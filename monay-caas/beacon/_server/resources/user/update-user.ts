import { TRPCError } from "@trpc/server";
import { z } from "zod";

import adminAuthClient from "#server/services/session";
import { authProcedure, rbacProcedure, router } from "#server/trpc";

import { userDeviceEventEmitter, userEventEmitter } from "./subscriptions";
import { updateUserInput, vUserOutput } from "./validators";

export const updateUserRouter = router({
  delete: authProcedure
    .output(z.boolean())
    .mutation(async ({ ctx: { prisma, log, authEmail } }) => {
      const userExists = await prisma.user.findUnique({
        where: { email: authEmail },
        select: { id: true, deactivatedAt: true },
      });

      if (!userExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User was not found.",
        });
      }

      const user = await prisma.user.update({
        where: {
          id: userExists.id,
        },
        data: {
          deactivatedAt: new Date(),
        },
      });

      log.info(
        `User ${user.email ?? "EMAIL"}/${
          user.phone ?? "PHONE"
        } deactivated at ${user.deactivatedAt?.toLocaleString("en-US")}`
      );

      return true;
    }),
  logSession: authProcedure
    .output(vUserOutput)
    .mutation(async ({ input, ctx: { authEmail, prisma, jwt, device } }) => {
      const user = await prisma.user.findUnique({
        where: { email: authEmail },
      });

      if (!user) {
        // check if user actually exists in supabase
        const supabaseData = await adminAuthClient.getUserById(jwt.sub ?? "");
        if (!supabaseData.data.user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "SECURITY [FRAUD]: User JWT is valid but user does not exist in supabase",
            cause: { fraud: { auth: true }, jwt },
          });
        }
        if (supabaseData.data.user?.user_metadata.server_user_created) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "SECURITY [FRAUD]: User should exist in db but does not exist.",
            cause: {
              security: { fraud: { auth: true }, jwt },
            },
          });
        }
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User does not exist.",
        });
      }

      if (user && user.deactivatedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is deactivated.",
          cause: { email: user.email, date: user.deactivatedAt },
        });
      }

      if (user) {
        await prisma.userDevice
          .findMany({
            where: {
              userId: user.id,
              fingerprint: device.id,
            },
          })
          .then((devices) =>
            Promise.all(
              devices.map((userDevice) =>
                prisma.userDevice.update({
                  where: { id: userDevice.id },
                  data: { ...device },
                })
              )
            )
          );
      }

      return user;
    }),
  update: authProcedure
    .input(updateUserInput)
    .mutation(async ({ input, ctx: { prisma } }) => {
      const { id } = input;
      //if email is updated then we will have to see the sideeffects
      //1. verify it if it is not present in the db and is unique
      //2. it needs to be updated in auth
      //
      if (!id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Any one between email and id required",
        });
      }
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exists",
        });
      }
      const dataToUpdate: { name?: string; phone?: string } = {};
      if (input.name) {
        dataToUpdate.name = input.name;
      }
      if (input.phone) {
        dataToUpdate.phone = input.phone;
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...dataToUpdate,
        },
      });

      userEventEmitter.emit(
        userEventEmitter.subscriptionTypes.onUpdate,
        updatedUser
      );

      return updatedUser;
    }),
  deactivateUser: rbacProcedure
    .meta({
      rbac: {
        // organization: "WRITE",
        users: "WRITE",
      },
    })
    .input(
      z.object({
        userId: z.string(),
        deactivationReason: z.enum([
          "REORGANIZATION",
          "DATA_MIGRATION",
          "NEW_SYSTEM_IMPLEMENTATION",
          "SECURITY_AUDITS_REMEDIATION",
          "USER_TRAINING_ONBOARDING",
          "THIRD_PARTY_VENDOR_CHANGES",
          "ORGANIZATION_DEACTIVATION",
          "SELF_DEACTIVATION",
        ]),
      })
    )
    // .output()
    .mutation(async ({ input, ctx: { prisma, log, user } }) => {
      const userDetails = await prisma.user.findUniqueOrThrow({
        where: {
          id: input.userId,
        },
      });
      if (!userDetails) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User not found with Id: ${input.userId}`,
        });
      }
      const deactivate = await prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          deactivationReason: input.deactivationReason,
        },
      });
      log.info(deactivate, `User deactivated with id: ${input.userId}`);
      return deactivate;
    }),
  // selfDeactivate: authProcedure.input().output().mutation(async({input, ctx: { prisma, user, log}})=>{
  //   const
  // })
});
