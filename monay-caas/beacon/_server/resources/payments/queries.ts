import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authProcedure, rbacProcedure } from "#server/trpc";
import { env } from "#server/utils";

// import {  } from "./validators";

export const CheckPaymentStatus = authProcedure
  .input(
    z.object({
      paymentReqId: z.string(),
    })
  )
  //.output()
  .query(async ({ ctx: { prisma, authEmail }, input }) => {
    const paymentReqId = input.paymentReqId;

    const checkPaymanetReqStatusPath = env("checkPaymanetReqStatusPath"); //FIXME: actual path of the api
    //TODO:may be we will have to store payment related information in the beacon like payment req, transcation details etc. need to discuss with Ibrahim
    fetch(`${checkPaymanetReqStatusPath}/${paymentReqId}`).then((data) => {
      return data.json();
    });
  });

export const orgAllTransactions = rbacProcedure
  .meta({
    rbac: {
      payments: "READ",
    },
  })
  .input(z.object({ pageNumber: z.number().optional() }))
  // .output()
  .query(async ({ input, ctx: { prisma, log, user } }) => {
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
    //FIXME: get token after login
    const apiPath = ""; //FIXME: take api path from env
    const token = ""; //FIXME: get token after login to gps
    const callGpsAllTxns = await fetch(apiPath, {
      headers: {
        token: token,
      },
      body: JSON.stringify({
        merchant_id: orgDetails.merchantId,
        page_number: input.pageNumber ?? 0,
        page_size: 100,
        filter: {},
      }),
    });
    const allTxns = await callGpsAllTxns.json();
    log.info("Transaction fetched!!!", allTxns);
    return allTxns;
  });
