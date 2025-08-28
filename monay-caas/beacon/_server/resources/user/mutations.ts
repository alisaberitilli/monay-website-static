import { TRPCError } from "@trpc/server";
import { z } from "zod";

import adminAuthClient from "#server/services/session";
import { authProcedure, rbacProcedure } from "#server/trpc";

import { userDeviceEventEmitter } from "./subscriptions";

// update user details

export const signinUser = authProcedure.mutation(
  async ({ ctx: { device, prisma, authEmail } }) => {
    const devices = await prisma.userDevice.findMany({
      where: {
        OR: [{ id: device.id }, { fingerprint: device.fingerprint }],
        user: { email: authEmail },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (devices.length) {
      // there... shouldnt be more than one device here. regardless we just update everything
      const updatedDevices = await prisma.userDevice.updateMany({
        where: {
          OR: [{ id: device.id }, { fingerprint: device.fingerprint }],
          user: { email: authEmail },
        },
        data: {
          timezone: device.timezone,
          lastIp: device.lastIp,
          active: true,
        },
      });

      userDeviceEventEmitter.emit(
        userDeviceEventEmitter.subscriptionTypes.onUpdate,
        device
      );
    } else {
      const newDevice = await prisma.userDevice.create({
        data: {
          user: { connect: { email: authEmail } },
          ...device,
        },
      });

      // broadcast to all connected clients for THIS user only that a new device has signed in
      userDeviceEventEmitter.emit(
        userDeviceEventEmitter.subscriptionTypes.onCreate,
        newDevice
      );
    }

    return true;
  }
);

export const signoutUser = authProcedure.mutation(
  async ({ ctx: { prisma, authEmail, ip, log, device } }) => {
    const result = await prisma.userDevice.updateMany({
      where: { user: { email: authEmail }, id: device.id },
      data: {
        active: false,
        lastIp: device.lastIp,
        timezone: device.timezone,
        deactivatedAt: new Date(),
      },
    });
    log.info(
      {
        user: authEmail,
        ip,
        device: device.id,
        tz: device.timezone,
        updatedDevices: result.count,
      },
      "User session sign out"
    );
    return true;
  }
);

export const deleteUser = authProcedure
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
  });

// createContext -> freeProcedure (checks if API key exists) -> authProcedure (checks if JWT is valid) -> rbacProcedure (checks if user role is appropriate) -> procedure call
export const inviteUser = rbacProcedure
  .meta({
    rbac: { userInvite: "WRITE" },
    userFields: {
      organization: { include: { invites: true, roles: true, domains: true } },
    },
  })
  .input(z.string().email())
  .mutation(async ({ input, ctx: { prisma, log, user } }) => {
    const isWhitelisted = !!user.organization.domains.find(
      (domain) => domain.domain === input.split("@")[1]
    );

    const createUserInvite = await prisma.userInvite.create({
      data: {
        email: input,
        organizationId: user.organizationId,
        roleId: user.organization.roles.find((role) =>
          isWhitelisted ? role.isWhitelistDefault : role.isDefault
        )!.role,
      },
    });

    // send user email invite
    const createSupabaseInvite = await adminAuthClient.inviteUserByEmail(
      input,
      { data: { organization: user.organization.name, invited: true } }
    );

    if (createSupabaseInvite.error) {
      log.error(createSupabaseInvite.error, "Send user invite error");

      // try and delete user invite (assuming for whatever reason tx rollback does not work)
      await prisma.userInvite.delete({
        where: {
          id: createUserInvite.id,
        },
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Sending user invite via supabase failed",
      });
    }

    log.info({ createUserInvite, createSupabaseInvite }, "User invite created");

    return !!(createUserInvite && createSupabaseInvite);
  });

export const assignUserToAcc = authProcedure
  .input(
    z.object({
      userId: z.string(),
      accountId: z.string(),
    })
  )
  // .output()
  .mutation(async ({ input, ctx: { prisma, log } }) => {
    const userExist = await prisma.user.findFirst({
      where: {
        id: input.userId,
      },
    });
    if (!userExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User not found with ID: ${input.userId}`,
      });
    }
    const accountExist = await prisma.account.findFirst({
      where: {
        accountId: input.accountId,
      },
    });
    if (!accountExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Account not found with ID: ${input.accountId}`,
      });
    }

    const assingUser = await prisma.userAssignment.create({
      data: {
        userId: input.userId,
        accountId: input.accountId,
      },
    });
    return assingUser;
  });

export const updateAssignUserToAcc = authProcedure
  .input(
    z.object({
      userId: z.string(),
      accountId: z.string(),
    })
  )
  // .output()
  .mutation(async ({ input, ctx: { prisma, log } }) => {
    const userExist = await prisma.user.findFirst({
      where: {
        id: input.userId,
      },
    });
    if (!userExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User not found with ID: ${input.userId}`,
      });
    }
    const accountExist = await prisma.account.findFirst({
      where: {
        accountId: input.accountId,
      },
    });
    if (!accountExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Account not found with ID: ${input.accountId}`,
      });
    }

    const updateAssingUser = await prisma.userAssignment.updateMany({
      //FIXME: Why updateMany is here not just update
      where: {
        userId: input.userId,
        accountId: input.accountId,
      },
      data: {
        // userId: input.userId,
        accountId: input.accountId,
      },
    });
    return updateAssingUser;
  });
