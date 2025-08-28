import { TRPCError } from "@trpc/server";
import z from "zod";

import { authProcedure, rbacProcedure } from "#server/trpc";

export const getInvoiceById = rbacProcedure
  .meta({
    rbac: { invoices: "READ" },
  })
  .input(
    z.object({
      invoiceId: z.string(),
    })
  )
  //   .output()
  .query(async ({ input, ctx: { log, prisma } }) => {
    const invoiceDetails = await prisma.invoice.findMany({
      where: {
        id: input.invoiceId,
      },
    });
    if (!invoiceDetails.length) {
      // find by num instead just in case
      const invoiceDetails = await prisma.invoice.findMany({
        where: { invoiceNum: input.invoiceId },
      });
      if (invoiceDetails.length) {
        log.info(input, "query by invoice num and not id");
        return invoiceDetails;
      }
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Invice with ${input.invoiceId} not found!!`,
      });
    }
    log.info(invoiceDetails, "Invoice fetchd!!");
    return invoiceDetails;
  });

export const getInvoiceComplainByInvoiceId = authProcedure
  .input(
    z.object({
      invoiceid: z.string(),
    })
  )
  // .output()
  .query(async ({ input, ctx: { log, prisma } }) => {
    const complaints = await prisma.invoiceComplaint.findMany({
      where: {
        invoiceId: input.invoiceid,
      },
    });
    if (!complaints.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No complaint found for invoice id: ${input.invoiceid}`,
      });
    }
    return complaints;
  });

export const getInvoiceComplaintById = authProcedure
  .input(
    z.object({
      complaintId: z.string(),
    })
  )
  // .output()
  .query(async ({ input, ctx: { log, prisma } }) => {
    const complaint = await prisma.invoiceComplaint.findMany({
      where: {
        complainantId: input.complaintId,
      },
    });
    if (!complaint.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No complaint found for invoice id: ${input.complaintId}`,
      });
    }
    return complaint;
  });
