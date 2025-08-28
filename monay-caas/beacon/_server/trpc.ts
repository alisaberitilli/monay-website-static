import { type DeviceType, Prisma } from "@prisma/client";
import { TRPCError, initTRPC } from "@trpc/server";
import type { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { IncomingMessage } from "http";
import jwt, { type JwtPayload } from "jsonwebtoken";
import superjson from "superjson";
import ws from "ws";
import { ZodError } from "zod";

import log from "#server/log";
import { forUser, limitedPrisma, prisma } from "#server/services/prisma";

import config from "./config";
import { loginToGps } from "./services/gps";
import { collapseHeaders } from "./utils";
import { UserControlKey, UserControls, evalRole } from "./utils/db";

// step 1. build a context object
export const createContext = ({
  req,
}:
  | CreateExpressContextOptions
  | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  const [os, appVersion, fingerprint, type, timezone] = collapseHeaders(
    ["x-t-os", "x-t-v", "x-t-f", "x-t-t", "x-t-tz"],
    req.headers
  );

  // TODO: CHANGE HOW WE UPDATE CONTEXT DEPENDING ON WHETHER IT IS A WS CONTEXT OR NOT

  if ("socket" in req) {
    console.log("is ws connection");
  } else {
    console.log("reg connection");
  }

  return {
    log,
    authToken: req.headers.authorization?.split("Bearer ")?.[1],
    ip: "ip" in req && req.ip,
    ua: req.headers["user-agent"],
    key: req.headers["x-t-api-key"],
    device: {
      id: `${os}::${type}::${req.headers["user-agent"]}`,
      os,
      appVersion,
      fingerprint,
      lastIp: "ip" in req ? req.ip : "UNKNOWN",
      type: type as DeviceType,
      timezone,
    } satisfies Prisma.UserDeviceCreateWithoutUserInput,
  };
};
export type Context = inferAsyncReturnType<typeof createContext>;

export interface Meta {
  rbac?: AtLeastOne<UserControls>;
  localeRequired?: boolean;
  userFields?: Prisma.UserInclude;
  gps?: boolean;
}

const t = initTRPC
  .meta<Meta>()
  .context<Context>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const getApiKey = () => {
  return config.apiKey;
};

const hasApiKey = t.middleware(({ next, ctx }) => {
  if (!ctx.key) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No API key in request.",
    });
  }

  if (ctx.key !== getApiKey()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid API key.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      // in an unauth'd context, we can expose a limited subset of prisma models and queries
      prisma: limitedPrisma,
    },
  });
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.authToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No bearer token found in request.",
    });
  }

  try {
    const token = jwt.verify(ctx.authToken, config.jwtSecret) as JwtPayload;
    return next({
      ctx: {
        ...ctx,
        prisma, // we can now add prisma to the context here
        jwt: token,
        authEmail: token.email as string,
      },
    });
  } catch (e) {
    ctx.log.error(e);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

// FIXME: we need to make this typesafe somehow. at some point
const userWithAllIncludes = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    organization: {
      include: {
        invites: true,
        users: {
          include: {
            contactInfo: true,
          },
        },
        orgUser: {
          include: {
            gpsUser: true,
          },
        },
        roles: true,
        domains: true,
        submerchants: true,
        subscriberUnits: true,
        billerUnits: true,
        nudges: true,
        paymentMethods: true,
      },
    },
    role: {
      include: {
        accessControl: true,
      },
    },
    orgUser: {
      include: {
        gpsUser: true,
      },
    },
    flags: true,
    prefs: true,
    nudgePrefs: true,
    devices: true,
    contactInfo: {
      include: {
        contact: true,
      },
    },
    nudges: true,
  },
});
type UserWithAll = Prisma.UserGetPayload<typeof userWithAllIncludes>;
export const freeProcedure = t.procedure.use(hasApiKey);
export const authProcedure = freeProcedure.use(isAuthed);
/**
 * type-safety on the resulting user field on the ctx object is NOT type-safe as of right now. if you don't include your necessary relations on the meta userFields key, they will NOT exist on the resulting user object
 */
export const rbacProcedure = authProcedure.use(async ({ next, ctx, meta }) => {
  if (!meta?.rbac) {
    throw new TRPCError({
      code: "METHOD_NOT_SUPPORTED",
      message: "No access requirements found for rbac procedure.",
    });
  }

  const { rbac, userFields } = meta;

  // @ts-expect-error we simply have this typed wrong
  const user: UserWithAll | null = await ctx.prisma.user.findUnique({
    where: { email: ctx.authEmail },
    include: {
      ...userFields,
      role: { include: { accessControl: true } },
      orgUser: { include: { gpsUser: true } },
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found.",
    });
  }

  if (!user.role.accessControl) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User access control list not found.",
    });
  }

  for (const [key, requiredPerm] of Object.entries(rbac)) {
    const controlKey = key as UserControlKey;
    const userPerm = user.role.accessControl[controlKey];

    // TODO: make this so it doesnt throw, but rather define ways for alternate access for less privileged roles
    if (!evalRole(userPerm, requiredPerm)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Role check failed for user with email ${user.email}, roles required: ${requiredPerm}, user perm: ${userPerm}`,
        cause: {
          rbac,
          userAc: user.role.accessControl,
        },
      });
    }
  }

  let gpsBearerToken: string | null = null;
  if (
    meta.gps &&
    (user.orgUser?.gpsUser || user.role.accessControl.payments === "WRITE")
  ) {
    const gpsUser =
      user.orgUser?.gpsUser ??
      (await ctx.prisma.organization
        .findFirst({ where: { id: user.organizationId } })
        .orgUser()
        .gpsUser());

    if (!gpsUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Org user was not found or does not exist for organization",
      });
    }
    // login to gps
    // check token expiration
    if (Date.now() >= gpsUser.tokenExpiryAt.getTime()) {
      // get a new token
      const { token } = await loginToGps({
        email: user.email,
        password: gpsUser.encPassword,
      });
      gpsBearerToken = token;
    } else {
      gpsBearerToken = gpsUser.token;
    }
  } else {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Payments role check failed for user with email ${user.email}`,
    });
  }

  forUser(user.id)(prisma);

  return next({
    ctx: {
      ...ctx,
      /**
       * FIELDS ARE NOT TYPE-SAFE
       */
      user,
      gpsBearerToken,
      gpsUser: user.orgUser?.gpsUser,
    },
  });
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;

export default t;
