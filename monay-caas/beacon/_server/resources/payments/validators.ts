import { z } from "zod";

export const saveCardInput = z.object({
  // merchantId: z.string(),
  // main_merchant_id: z.string(),
  cardHolderName: z.string(),
  cardNumber: z.string(),
  customerNumber: z.string(),
  expiryYear: z.string(),
  expiryMonth: z.string(),
  securityCode: z.string(),
});

export const saveAchInput = z.object({
  // merchantId: z.string(),
  // main_merchant_id: z.string(),
  routingNumber: z.string(),
  accountNumber: z.string(),
  checkType: z.string(),
  account_holder_name: z.string(),
  accountType: z.string(),
  checkNumber: z.string(),
  clientRequestId: z.string(),
  merchantType: z.string(),
  customerNumber: z.string(),
});
