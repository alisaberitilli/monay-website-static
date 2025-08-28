import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { NudgeT, createAndDeliverNotification } from "#server/notifications";
// import { z } from "zod";
import { authProcedure, rbacProcedure } from "#server/trpc";
import { env } from "#server/utils";

import { saveAchInput, saveCardInput } from "./validators";

export const saveCard = rbacProcedure
  .meta({
    rbac: {
      payments: "WRITE",
    },
  })
  .input(saveCardInput)
  // .output()
  .mutation(async ({ input, ctx: { log, prisma, user } }) => {
    const orgDetails = await prisma.organization.findFirst({
      where: {
        id: user.organizationId,
      },
    });
    if (!orgDetails) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No org found for this user ${user.organizationId}`,
      });
    }
    const saveCardInGPSPath = env("saveCardInGPSPath"); //FIXME: actual path of the api

    const saveCardInGps = await fetch(
      saveCardInGPSPath || "apiPath", //FIXME: Put actual path here
      {
        method: "POST",
        headers: {},
        body: JSON.stringify({
          merchantId: orgDetails.merchantId,
          main_merchant_id: orgDetails.mainMerchantId,
          ...input,
        }),
      }
    );
    await createAndDeliverNotification(NudgeT.CreateCard, {
      type: "organization",
      id: user.organizationId,
      mergeTags: { "card.ending": input.cardNumber.slice(-4) },
      channels: ["PUSH", "EMAIL"],
    });
    // FIXME: store some infor from here in our db
    log.info("card saved", saveCardInGps);
    return saveCardInGps;
  });

export const saveAch = rbacProcedure
  .meta({
    rbac: {
      payments: "WRITE",
    },
  })
  .input(saveAchInput)
  // .output()
  .mutation(async ({ input, ctx: { log, prisma, user } }) => {
    const orgDetails = await prisma.organization.findFirst({
      where: {
        id: user.organizationId,
      },
    });
    if (!orgDetails) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No org found for this user ${user.organizationId}`,
      });
    }
    const saveAchInGPSPath = env("saveAchInGPSPath");
    const saveAchInGps = await fetch(
      saveAchInGPSPath || "apiPath", //FIXME: Put actual path here
      {
        method: "POST",
        headers: {},
        body: JSON.stringify({
          merchantId: orgDetails.merchantId,
          main_merchant_id: orgDetails.mainMerchantId,
          ...input,
        }),
      }
    );
    // FIXME: store some infor from here in our db
    return saveAchInGps;
  });
