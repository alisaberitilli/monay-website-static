import { Access, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { JwtPayload } from "jsonwebtoken";
import type { Logger } from "pino";
import { z } from "zod";

import type { AuthPrisma } from "#server/services/prisma";
import adminAuthClient from "#server/services/session";
import { authProcedure, router } from "#server/trpc";

import { vOrgInput, vUserInput, vUserOutput } from "./validators";

type CreateUserRole = Prisma.UserRoleCreateWithoutOrganizationInput;

const DEFAULT_ROLE: CreateUserRole = {
  role: "None",
  isDefault: true,
  accessControl: {
    create: {
      organization: Access.NONE,
      users: Access.NONE,
    },
  },
};

const AGENT_ROLE: CreateUserRole = {
  role: "Agent",
  isWhitelistDefault: true,
  accessControl: {
    create: {
      billers: Access.READ,
      subscribers: Access.READ,
      subscriptions: Access.WRITE,
    },
  },
};

const SUPERVISOR_ROLE: CreateUserRole = {
  role: "Supervisor",
  accessControl: {
    create: {
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.READ,
    },
  },
};

const MANAGER_ROLE: CreateUserRole = {
  role: "Manager",
  accessControl: {
    create: {
      organization: Access.WRITE,
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.WRITE,
    },
  },
};

const createUserAccount = async (
  prisma: AuthPrisma,
  input: {
    email: string;
    authEmail: string;
    name: string;
    device: Prisma.UserDeviceCreateWithoutUserInput;
    organizationId: string;
    jwt: JwtPayload;
    rawUserData?: object;
  },
  log: Logger
) => {
  const { email, authEmail, name, device, organizationId, jwt, rawUserData } =
    input;
  if (email !== authEmail) {
    log.info(
      {
        email,
        authEmail,
        ip: device.lastIp,
      },
      "JWT spoof detected"
    );
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "JWT spoof detected",
    });
  }

  const [supabaseData, userExists] = await Promise.all([
    adminAuthClient.getUserById(jwt.sub ?? "NULL"),
    prisma.user.findFirst({
      where: { email },
      select: { id: true, deactivatedAt: true },
    }),
  ]);

  // check user validity
  if (userExists) {
    if (userExists && userExists.deactivatedAt) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Deleted user already exists",
      });
    }
    throw new TRPCError({
      code: "CONFLICT",
      message: "User already exists",
    });
  }

  if (!supabaseData.data.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message:
        "Fatal error. Valid auth token passed but user id not found in supabase.",
    });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { roles: { include: { accessControl: true } }, orgUser: true },
  });

  if (!organization) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Organization DNE",
    });
  }

  const userRole = organization.roles.find((role) =>
    organization.orgUser
      ? role.role === DEFAULT_ROLE.role
      : role.role === MANAGER_ROLE.role
  );

  if (!userRole) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User roles created incorrectly",
    });
  }

  const createOrgUserField = organization.orgUser
    ? {
        orgUser: {
          create: {
            organizationId: organization.id,
          },
        },
      }
    : {};

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      roleId: userRole.role,
      organizationId: organization.id,
      devices: {
        create: {
          ...device,
        },
      },
      ...createOrgUserField,
      flags: {
        create: {
          raw: rawUserData,
        },
      }, // R46605
      prefs: {
        create: {},
      },
      nudgePrefs: {
        create: {},
      },
    },
  });

  await adminAuthClient.updateUserById(jwt.sub ?? "", {
    user_metadata: { server_user_created: true },
  });

  return newUser;
};

export const createUserRouter = router({
  create: authProcedure
    .input(vUserInput.extend({ organizationId: z.string() }))
    .output(vUserOutput)
    .mutation(
      async ({
        input: { email, name, organizationId },
        ctx: { prisma, log, authEmail, jwt, device },
      }) => {
        const createUserResult = await createUserAccount(
          prisma,
          {
            email,
            name,
            device,
            authEmail,
            jwt,
            organizationId,
          },
          log
        );

        return { email: createUserResult.email, id: createUserResult.id };
      }
    ),
  createWithOrg: authProcedure
    .input(vOrgInput.and(vUserInput))
    .output(vUserOutput)
    .mutation(
      async ({
        input: { email, name, organization, kybDocument, rawUserData },
        ctx: { prisma, log, authEmail, jwt, device },
      }) => {
        const {
          merchantName,
          subMerchantDba,
          taxId,
          website,
          phone,
          addressId,
        } = kybDocument;

        const { id } = await prisma.organization.create({
          data: {
            name: organization,
            kybDoc: {
              create: {
                merchantName,
                subMerchantDba,
                taxId,
                website,
                phone,
                addressId,
              },
            },
            roles: {
              create: [
                { ...DEFAULT_ROLE },
                { ...AGENT_ROLE },
                { ...SUPERVISOR_ROLE },
                { ...MANAGER_ROLE },
              ],
            },
            subscriberUnits: {
              create: {
                name: organization,
              },
            },
            domains: {
              create: {
                testEmail: email,
                domain: email.split("@")[1],
              },
            },
          },
        });

        const newUser = await createUserAccount(
          prisma,
          {
            email,
            authEmail,
            name,
            device,
            organizationId: id,
            jwt,
            rawUserData,
          },
          log
        );

        return { email: newUser.email, id: newUser.id };
      }
    ),
});
