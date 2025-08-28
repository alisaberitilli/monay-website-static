// @arvind-tilli start here
import { TRPCError } from "@trpc/server";

import { authProcedure } from "#server/trpc";

import { loginToGps, registerGpsUser } from "../gps";

export const gpsRegisterUser = authProcedure
  // .input(vUserDevice)
  // .output()
  .mutation(async ({ ctx: { prisma, authEmail, log } }) => {
    const beaconUser = await prisma.user.findUnique({
      where: { email: authEmail },
      include: {
        organization: {
          include: {
            address: true,
          },
        },
      },
    });
    if (!beaconUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Beacon user not found with email",
      });
    }
    const [first_name, ...lastname] = (beaconUser?.name || "").split(" ");
    const last_name = lastname.join(" ");
    const registerToGPSResponse = await registerGpsUser({
      first_name: first_name,
      last_name: last_name,
      email: beaconUser.email,
      country_code: beaconUser?.organization.address?.countryCode || "",
    });
    const { encKey, iv, encPass } = registerToGPSResponse;
    const encKeyStr = JSON.parse(encKey.toString());
    const ivStr = JSON.parse(iv.toString());
    if (!encKey) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "not fount",
      });
    }
    console.log(registerToGPSResponse);
    log.info({
      msg: `user with email ${authEmail} registered on GPS at ${new Date()}`,
    });
    //need to store the encPass, encKey, iv to GpsUser table

    // const updateGpsUser = await prisma.user.update({
    //   where: {
    //     email: authEmail,
    //   },
    //   data: {
    //     updatedAt: new Date(),
    //     orgUser: {
    //       update: {
    //         gpsUser: {
    //           update: {
    //             enckey: encKeyStr,
    //             encPassword: registerToGPSResponse.encPass,
    //             iv: ivStr, //registerToGPSResponse.iv,
    //           },
    //         },
    //       },
    //     },
    //   },
    //   include: {
    //     orgUser: {
    //       include: {
    //         gpsUser: true,
    //       },
    //     },
    //   },
    // });
    const updateGpsUser = await prisma.gpsUser.update({
      where: {
        orgUserId: beaconUser.id,
      },
      data: {
        enckey: encKeyStr,
        iv: ivStr,
        encPassword: encPass,
      },
    });
    if (updateGpsUser) {
      log.info({
        msg: `User encPass: ${encPass}, encKeyL ${encKeyStr} and iv: ${ivStr} stored in GpsUser table!`,
      });
    }

    return "User rgistered to GPS successfully!";
  });

export const gpsLogin = authProcedure
  // .input()
  // .output()
  .mutation(async ({ ctx: { prisma, log, authEmail } }) => {
    const beaconUser = await prisma.user.findUnique({
      where: { email: authEmail },
      include: {
        orgUser: {
          include: {
            gpsUser: true,
          },
        },
      },
    });
    if (!beaconUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Beacon user not found with email",
      });
    }
    // const [first_name, ...lastname] = (beaconUser?.name || "").split(" ");
    // const last_name = lastname.join(" ");
    const loggingResponse = await loginToGps({
      email: beaconUser.email,
      password: beaconUser.orgUser?.gpsUser?.encPassword || "",
    });
    console.log(loggingResponse);
    log.info({
      msg: `user with email ${authEmail} logged in on GPS at time ${new Date()}`,
    });

    return loggingResponse;
  });
