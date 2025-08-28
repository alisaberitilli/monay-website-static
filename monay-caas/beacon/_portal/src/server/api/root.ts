import { enforceUnion } from "#helpers";
import { InvoiceStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./trpc";

const invoiceStatusType = enforceUnion<InvoiceStatus>([
  "UNPAID",
  "PROCESSING",
  "DISPUTED",
  "FINANCING_PENDING",
  "ON_PAYMENT_PLAN",
  "PARTIALLY_PAID",
  "FULLY_PAID",
  "VOIDED",
]);
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  //biller creation in db
  billerCreate: publicProcedure
    .input(
      z.object({
        name: z.string(),
        companyCode: z.string(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx: { prisma, log } }) => {
      const orgExist = await prisma.organization.findFirst({
        where: {
          id: input.organizationId,
        },
      });
      if (!orgExist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No org exist with id ${input.organizationId}`,
        });
      }
      const billerCreation = await prisma.biller.create({
        data: {
          ...input,
          source: "BEACON_PORTAL",
        },
      });
      log.info("Biller account created", billerCreation);
      return billerCreation;
    }),
  //account creation for biller
  createAccount: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        description: z.string(),
        billerId: z.string(),
        subscriberId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, log }, input }) => {
      const accountCreation = await prisma.account.create({
        data: {
          accountId: input.accountId,
          description: input.description,
          billerId: input.billerId,
          subscriberId: input.subscriberId,
        },
      });
      log.info("Account created for Biller", accountCreation);
      return accountCreation;
    }),
  //account update for biller
  updateAccount: publicProcedure
    .input(z.object({}))
    .mutation(async ({ ctx: { prisma } }) => {}),
  //fetch account details from db for biller
  getAccountDetails: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        accountId: z.string().optional(),
      })
    )
    .query(async ({ ctx: { prisma, log }, input }) => {
      // let accountDetails;
      // if (input.id) {
      //   accountDetails = await prisma.account.findFirst({
      //     where: {
      //       id: input.id,
      //     },
      //   });
      // } else if (input.accountId) {
      //   accountDetails = await prisma.account.findFirst({
      //     where: {
      //       accountId: input.accountId,
      //     },
      //   });
      // }
      if (input.id || input.accountId) {
        throw new TRPCError({
          code: "METHOD_NOT_SUPPORTED",
          message: "Either id or account id is required to get account details",
        });
      }
      //TOCHECK: OR in where clause
      const accountDetails = await prisma.account.findFirst({
        where: {
          OR: [{ id: input.id }, { accountId: input.accountId }],
        },
      });
      if (!accountDetails) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No account details found",
        });
      }
      log.info("Account Details fetched for biller", accountDetails);
      return accountDetails;
    }),
  //fetching list of subscribers from db
  getSubscribersList: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        billerId: z.string().optional(),
      })
    )
    .query(async ({ ctx: { prisma, log }, input }) => {
      if (input.id || input.billerId) {
        throw new TRPCError({
          code: "METHOD_NOT_SUPPORTED",
          message: "Either id or account id is required to get account details",
        });
      }
      const subscribersList = await prisma.biller.findFirst({
        where: {
          OR: [{ id: input.id }, { billerId: input.billerId }],
        },
        include: {
          //TODO: check here the relation in correct way
          accounts: {
            include: {
              subscriber: true,
            },
          },
        },
      });
      log.info("list of subscribers, we got for biller", subscribersList);
      return subscribersList;
    }),

  //biller is requesting to subscriber to accept the req and then biller will be able to send invoice
  requestToSubscriber: publicProcedure
    .input(z.object({}))
    .mutation(async ({ ctx: { prisma } }) => {}),
  //biller fetching to the all the list of the subscribes subscriber
  getSubscribedSubscriberInfo: publicProcedure
    .input(z.object({}))
    .query(async ({ ctx: { prisma } }) => {}),
  getAllInvoiceForSubscriber: publicProcedure
    .input(z.object({}))
    .query(({ input, ctx: { prisma, log } }) => {}),
  getOneInvoice: publicProcedure
    .input(
      z.object({
        invoiceId: z.string(),
      })
    )
    .query(async ({ input, ctx: { log, prisma } }) => {
      const invoiceDetails = await prisma.invoice.findFirst({
        where: {
          id: input.invoiceId,
        },
      });
      if (!invoiceDetails) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Invice with id:${input.invoiceId} not found!!!`,
        });
      }
      log.info("Invoice fetchd!!", invoiceDetails);
      return invoiceDetails;
    }),
  createInvoice: publicProcedure
    .input(
      z.object({
        invoiceNum: z.string(),
        amount: z.number(),
        invoiceDate: z.date(),
        dueDate: z.date(),
        accountId: z.string(),
        orgPaymentMethodId: z.string(), //TOCHECK: if this is not provided then we will have to fetch it from db using org details
        //for now I'm considering it as it will be given
        status: z.enum(invoiceStatusType).optional(),
      })
    )
    .mutation(async ({ input, ctx: { prisma, log } }) => {
      const invoiceCreation = await prisma.invoice.create({
        data: {
          invoiceNum: input.invoiceNum,
          amount: input.amount,
          invoiceDate: input.invoiceDate,
          dueDate: input.dueDate,
          pdfUrl: "",
          status: input.status ?? "UNPAID",
          accountId: input.accountId,
          orgPaymentMethodId: input.orgPaymentMethodId,
        },
      });
      log.info("Invoice created!!!", invoiceCreation);
      return invoiceCreation;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
