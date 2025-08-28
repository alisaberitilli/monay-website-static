import { enforceUnion } from "#helpers";
import { VendorSource } from "@prisma/client";
import { z } from "zod";

export const xdexFetchDataInput = z.object({
  mobileNumber: z.string().min(10).max(12),
  buyerCode: z.number(),
  compCode: z.number(),
});

export const xdexFetchMultiInput = z.object({
  mobileNumber: z.string().min(10).max(12),
  buyerCodes: z.array(z.number()),
  compCode: z.number(),
});

export const xdexFetchVenderCodeInput = z.object({
  companyCode: z.string(),
});
export const findVendorAccountDetailsInput = z.object({
  buyerCode: z.number(),
  compCode: z.number(),
});

export const updatePayXdexInput = z.object({
  selectedInvoices: z.array(z.object({ invoiceNumber: z.string() })),
  totalAmount: z.string(),
  ts: z.string(),
  txnReferenceId: z.string(),
  billertxnReferenceId: z.string(),
  paymentMode: z.string(),
});

const invoiceNumber = z.object({
  invoiceNumber: z.string(),
});

export const updateBillerInfoInput = z.object({
  name: z.string().optional(),
  billerId: z.string().optional(),
  companyCode: z.string().optional(),
  source: z
    .enum(["BEACON", "MANUAL", "XDEX_BBPS"] satisfies [
      VendorSource,
      ...VendorSource[]
    ])
    .optional(),
  //TODO: organizationId will not be changed for now
  // organizationId: z.string().optional(),
});
export const xdexPaymentInput = z.object({
  // bearerToken: z.string(),
  //
  selectedInvoices: z.array(invoiceNumber),
  totalAmount: z.string(),
  ts: z.string(),
  txnReferenceId: z.string(),
  billertxnReferenceId: z.string(),
  paymentMode: z.string(),
});

export const finalPayInput = z.object({
  beneCode: z.string(),
  gpsToken: z.string(),
  merchantId: z.string(),
  requestUUID: z.string(),
});

export const addBillerManualyInput = z.object({
  name: z.string().optional(),
  billerId: z.string().optional(),
  companyCode: z.string().optional(),
  organizationId: z.string().optional(),
});

const vendorSource = enforceUnion<VendorSource>([
  "BEACON",
  "XDEX_BBPS",
  "MANUAL",
]);
const zodVendorSource = z.enum(vendorSource);
const addBillerManually = z.object({
  billerId: z.string(),
});
const addBillerFromXdex = z.object({
  billerId: z.string(),
  name: z.string().optional(),
  companyCode: z.string().optional(),
  organizationId: z.string().optional(),
});
const addBillerInputFromManual = z.object({
  type: z.literal(zodVendorSource.enum.MANUAL),
  data: addBillerManually,
});
const addBillerInputFromXdex = z.object({
  type: z.literal(zodVendorSource.enum.XDEX_BBPS),
  data: addBillerFromXdex,
});
const addBillerInputFromBeacon = z.object({
  type: z.literal(zodVendorSource.enum.BEACON),
  data: addBillerFromXdex,
});
export const addBillerInput = z.discriminatedUnion("type", [
  addBillerInputFromManual,
  addBillerInputFromXdex,
  addBillerInputFromBeacon,
]);
export const updateBillerInput = z.discriminatedUnion("type", [
  addBillerInputFromManual,
  addBillerInputFromXdex,
  addBillerInputFromBeacon,
]);
