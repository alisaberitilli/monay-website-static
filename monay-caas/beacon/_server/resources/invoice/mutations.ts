import { InvoiceRequestStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

import { NudgeT, createAndDeliverNotification } from "#server/notifications";
import { authProcedure, rbacProcedure } from "#server/trpc";

import {
  createInvoiceComplainInput,
  createInvoiceInput,
  updateInvoiceComplainInput,
  updateInvoiceInput,
} from "./validators";

export const createInvoice = rbacProcedure
  .meta({
    rbac: {
      invoices: "WRITE",
    },
  })
  .input(createInvoiceInput)
  //   .output()
  .mutation(async ({ input, ctx: { log, prisma } }) => {
    const invoiceCreate = await prisma.invoice.create({
      data: {
        ...input,
      },
    });
    log.info(invoiceCreate, "Invoice created!!");
    await createAndDeliverNotification(NudgeT.CreateInvoice, {
      type: "organization",
      id: input.organizationId,
      mergeTags: { "invoice.created": input.invoiceNum },
      channels: ["PUSH", "EMAIL"],
    });
    return invoiceCreate;
  });

export const updateInvoice = rbacProcedure
  .meta({
    rbac: {
      invoices: "WRITE",
    },
  })
  .input(updateInvoiceInput)
  //   .output()
  .mutation(async ({ input, ctx: { log, prisma } }) => {
    const updateInvoice = await prisma.invoice.update({
      where: {
        id: input.id,
      },
      data: {
        ...input,
      },
    });
    log.info(updateInvoice, "Invoice details updated");
    return updateInvoice;
  });

export const invoiceApprovalRequest = rbacProcedure
  .meta({
    rbac: {
      invoices: "WRITE",
      // maxPayment: 1000.0, //FIXME: user to whom request is being sent, should have maxPayment > requested amount
    },
    userFields: {
      reportsTo: true,
      assignments: true,
    },
  })
  .input(
    z.object({
      invoiceId: z.string(),
      note: z.string(),
      approvingUserId: z.string().optional(),
    })
  )
  //   .output()
  .mutation(async ({ input, ctx: { log, prisma, user } }) => {
    //checking that requested person has access to pay amount mentioned in the invoice
    const invoiceDetails = await prisma.invoice.findUnique({
      where: {
        id: input.invoiceId,
      },
    });
    if (!invoiceDetails) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No invoice found with id ${input.invoiceId}`,
      });
    }

    let approvingUserId = input.approvingUserId;
    if (!approvingUserId) {
      // find approving user id via 2 ways:
      // 1. pull user assignments to invoice account and get the lowest privileged person on the account with authorization amount >= invoice amount
      //FIXME: Need to write code
      // 2. pull user reports and get earliest report that has the authorization amount >= invoice amount
      approvingUserId = "";
      const approvingUserRoles = await prisma.userRole.findMany({
        where: {
          organizationId: user.organizationId,
          reportLevel: {
            gt: user.role.reportLevel,
          },
        },
        include: {
          accessControl: {
            where: {
              maxPayment: {
                gte: invoiceDetails.amount,
              },
              invoices: "WRITE",
            },
            select: {
              maxPayment: true,
            },
          },
          users: {
            select: {
              id: true,
            },
          },
        },
        select: {
          role: true,
          reportLevel: true,
        },
      });
      const sortedApprovingUserRoles = approvingUserRoles.sort(
        (roleA, roleB) =>
          (roleA.accessControl?.maxPayment.toNumber() ?? 0) -
          (roleB.accessControl?.maxPayment.toNumber() ?? 0)
      );
      approvingUserId = sortedApprovingUserRoles[0].users[0].id;
    }

    const createInvoiceRequest = await prisma.invoiceRequest.create({
      data: {
        invoiceId: input.invoiceId,
        amount: invoiceDetails.amount,
        note: input.note,
        requestingUserId: user.id,
        approvingUserId: approvingUserId,
      },
    });
    log.info(createInvoiceRequest, "Invoice requested!");
    return createInvoiceRequest;
  });

export const approveInvoiceRequest = rbacProcedure
  .meta({
    rbac: {
      invoices: "WRITE",
      // maxPayment: maxAmount //FIXME: check whether user have access to maxPayment than rquested amount
    },
  })
  .input(
    z.object({
      status: z.enum(["APPROVED", "PARTIALLY_APPROVED", "REJECTED"] as [
        InvoiceRequestStatus,
        ...InvoiceRequestStatus[]
      ]),
      invoiceId: z.string(),
      invoiceRequestId: z.string(),
    })
  )
  //   .output()
  .mutation(async ({ input, ctx: { log, prisma } }) => {
    const invoiceRequestUpdate = await prisma.invoiceRequest.update({
      where: {
        id: input.invoiceRequestId,
        invoiceId: input.invoiceId,
      },
      data: {
        status: input.status,
      },
    });
    if (!invoiceRequestUpdate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Invoice with invoiceRequestId ${input.invoiceRequestId}  and invoiceId ${input.invoiceId} not found`,
      });
    }
    log.info(invoiceRequestUpdate, "Invoice approved!");
    return invoiceRequestUpdate;
  });

export const complainCreate = rbacProcedure
  .meta({
    rbac: {
      invoices: "WRITE",
    },
  })
  .input(createInvoiceComplainInput)
  // .output()
  .mutation(async ({ input, ctx: { prisma, log, user } }) => {
    const invoiceExist = await prisma.invoice.findFirst({
      where: {
        id: input.invoiceId,
      },
    });
    if (!invoiceExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No Invoice found with id: ${input.invoiceId}`,
      });
    }
    const createComplain = await prisma.invoiceComplaint.create({
      data: {
        // TODO: complaint id generation
        complaintId: "",
        status: input.status,
        priority: input.priority ?? "NO_PRIORITY",
        complainText: input.complaintext,
        invoiceId: input.invoiceId,
        complainantId: user.id,
        assignedToUserId: input.assignedToUserId,
      },
    });
    log.info(createComplain, "Complain created!!");
    return createComplain;
  });

export const updateComplaintInvoice = rbacProcedure
  .meta({
    rbac: {
      invoices: "WRITE",
    },
  })
  .input(updateInvoiceComplainInput)
  // .output()
  .mutation(async ({ input, ctx: { prisma, log } }) => {
    const updateInvoiceComplaint = await prisma.invoiceComplaint.update({
      where: {
        id: input.complaintId,
      },
      data: {
        ...input,
      },
    });
    log.info(updateInvoiceComplaint, "Complain updated!!!");
    return updateInvoiceComplaint;
  });
