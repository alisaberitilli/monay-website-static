import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authProcedure, freeProcedure } from "#server/trpc";

import { userIncludeFields } from "./validators";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const freeMailDomains = require("../../free_mail.json");

export const getUser = authProcedure
  .input(z.optional(userIncludeFields))
  .query(async ({ input = {}, ctx: { prisma, authEmail } }) => {
    const includedFields = {
      ...Object.entries(input)
        .filter(([, value]) => !!value)
        .reduce(
          (includes, [userKey]) => ({
            ...includes,
            [userKey]: true,
          }),
          {}
        ),
    };
    const hasIncludedFields = Object.keys(input).length > 0;

    const user = await prisma.user.findUnique({
      where: { email: authEmail },
      include: hasIncludedFields ? includedFields : undefined,
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User data not found.",
      });
    }

    return user;
  });

export const checkValidEmail = freeProcedure
  .input(z.object({ email: z.string().min(1) }))
  .output(z.enum(["AVAILABLE", "TAKEN", "INVALID"]))
  .query(async ({ input: { email }, ctx: { prisma } }) => {
    const emailDomain = email.split("@")[1];
    if (freeMailDomains[emailDomain]) {
      return "INVALID";
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });
    return userExists ? "TAKEN" : "AVAILABLE";
  });

export const checkExistingOrganization = authProcedure
  .input(z.string().email())
  .output(z.string().nullable())
  .query(async ({ input, ctx: { prisma } }) => {
    const domain = input.split("@")[1];
    const organization = await prisma.organization.findFirst({
      where: { domains: { some: { domain } } },
      select: { domains: true, id: true },
    });

    return organization?.id ?? null;
  });
