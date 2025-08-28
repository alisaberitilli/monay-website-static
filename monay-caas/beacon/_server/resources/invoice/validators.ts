import { enforceUnion } from "#helpers";
import {
  ComplainPriority,
  ComplainStatus,
  type InvoiceStatus,
} from "@prisma/client";
import z from "zod";

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
const complainStatus = enforceUnion<ComplainStatus>([
  "OPEN",
  "UNDER_INVESTIGATION",
  "IN_PROGRESS",
  "PENDING_CUSTOMER_RESPONSE",
  "RESOLVED",
  "CLOSED",
  "ESCALATED",
  "REJECTED",
  "ON_HOLD",
  "WITH_DRAWN",
]);
const complainPriority = enforceUnion<ComplainPriority>([
  "NO_PRIORITY",
  "LOW",
  "MEDIUM",
  "URGENT",
  "HIGH",
]);

export const createInvoiceInput = z.object({
  invoiceNum: z.string(),
  amount: z.number(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  pdfUrl: z.string(),
  status: z.enum(invoiceStatusType),
  organizationId: z.string(),
  accountId: z.string(),
  orgPaymentMethodId: z.string(),
});

export const updateInvoiceInput = z.object({
  id: z.string(),
  invoiceId: z.string().optional(),
  amount: z.number().optional(),
  invoiceDate: z.date().optional(),
  dueDate: z.date().optional(),
  pdfUrl: z.string().optional(),
  status: z.enum(invoiceStatusType).optional(),
  organizationId: z.string().optional(),
  accountId: z.string().optional(),
  orgPaymentMethodId: z.string().optional(),
});

export const createInvoiceComplainInput = z.object({
  invoiceId: z.string(),
  status: z.enum(complainStatus),
  priority: z.enum(complainPriority).optional(),
  complaintext: z.string(),
  // resolutionText: z.string().optional(),
  assignedToUserId: z.string(),
});

export const updateInvoiceComplainInput = z.object({
  complaintId: z.string(),
  status: z.enum(complainStatus).optional(),
  priority: z.enum(complainPriority).optional(),
  complaintext: z.string().optional(),
  resolutionText: z.string().optional(),
  assignedToUserId: z.string().optional(),
});
