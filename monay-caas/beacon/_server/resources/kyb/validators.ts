import { enforceUnion } from "#helpers";
import { FeeModel } from "@prisma/client";
import { z } from "zod";

export const inputKyBSubmit = z.object({
  kybDocId: z.string(),
  gpsToken: z.string(),
});

type KycCategory = "kyc_01" | "kyc_02" | "kyc_03" | "kyc_04" | "kyc_05";
const kycSteps = enforceUnion<KycCategory>([
  "kyc_01",
  "kyc_02",
  "kyc_03",
  "kyc_04",
  "kyc_05",
]);

type IndianCompanyType =
  | "PROPRIETORSHIP_COMPANY"
  | "PARTNERSHIP_COMPANY"
  | "PRIVATE_LIMITED_COMPANY"
  | "TRUST_OR_NGO_DOCUMENTS";

export type AddressType = "BUSINESS" | "PERSONAL" | "BILLING";
const yesNo = enforceUnion<"YES" | "NO">(["YES", "NO"]);
const addressType = enforceUnion<AddressType>([
  "BUSINESS",
  "PERSONAL",
  "BILLING",
]);

export const inputAddBusinessInformation = z.object({
  business_legal_name: z.string().min(1),
  tax_id: z.string().min(5),
  dba: z.string(),
  web_url: z.string(),
  address: z.string(),
  city_code: z.string().min(1),
  state_code: z.string(),
  country_code: z.string(),
  zip: z.string(),
  category_id: z.enum(kycSteps).default("kyc_01"),
  tel_phone: z.string(),
  is_landline: z.string(),
  ccc: z.string(),
  address_type: z.enum(addressType),
  is_primary: z.boolean().optional() || false,
  is_subAccount: z.boolean().optional(),

  //to call GPS api
  token: z.string().optional(),
});

type OwnerKycDocType = "PASSPORT" | "DRIVING_LICENCE" | "AADHAR";
const kycDocType = enforceUnion<OwnerKycDocType>([
  "AADHAR",
  "PASSPORT",
  "DRIVING_LICENCE",
]);
export const inputAddContactInformation = z.object({
  category_id: z.enum(kycSteps),
  count: z.number().optional(),
  title: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  dob: z.string(),
  percentage_ownership: z.string(),
  ssn: z.string().optional(),
  aadhar: z.string().optional(),
  passport: z.string().optional(),
  non_us: z.boolean(),
  personal_gurantee: z.enum(yesNo),
  phone_number: z.string(),
  ccc: z.string().optional().optional(),

  // address of the owner
  country_code: z.string(),
  state_code: z.string(),
  city_code: z.string(),
  zip: z.string(),
  address: z.string(),
  address_type: z.enum(addressType),

  // kyc docs
  type: z.enum(kycDocType),
  front: z.string(),
  back: z.string(),
  document_name: z.string(),
  document_name_back: z.string(),

  //KYCBusinessInfoId for relating KYCBusinessInfo and OwnerDetails
  kyc_business_info_id: z.string(),

  //token from the GPS to call GPS
  token: z.string().optional(),
});

const indianCompanyType = enforceUnion<IndianCompanyType>([
  "PROPRIETORSHIP_COMPANY",
  "PARTNERSHIP_COMPANY",
  "PRIVATE_LIMITED_COMPANY",
  "TRUST_OR_NGO_DOCUMENTS",
]);
export const inputAddotherInformation = z.object({
  company_type: z.enum(indianCompanyType),
  registration_certificate: z.string(),
  gst_number: z.string(),
  deed: z.string(),
  authorization_letter: z.string(),
  address_proof_business: z.string(),
  address_proof_owner: z.string(),
  id_proof_partener_owner_trustee: z.string(),
  board_resolution_doc: z.string(),
  last_two_year_trust_audit: z.string(),
  one_photo: z.string(),
  cancelled_cheque: z.string(),
  bank_statement: z.string(),
  partner_trustee_data: z.array(
    z.object({
      partner_trustee_name: z.string(),
      id_proof_partner_trustee: z.string(),
      one_photo_partner_trustee: z.string(),
      id_proof_file_name: z.string().optional(),
      one_photo_file_name: z.string().optional(),
    })
  ),
});

const feeMode = enforceUnion<FeeModel>(["ABSORPTION", "CONVENIENCE"]);

export const inputBillingInfo = z.object({
  fee_model: z.enum(feeMode),
  company_identifier: z.string(),
  company_name: z.string(),
  company_fax: z.string(),
  company_fax_ccc: z.string(),
  company_signature: z.string(),
  company_logo: z.string(),
  company_sign_file_name: z.string(),
  company_logo_file_name: z.string(),
  customer_service_email: z.string(),
  dba_number: z.string(),
  url_facebook: z.string(),
  url_twitter: z.string(),
  url_instagram: z.string(),
  bank_routing_number: z.string(),
  bank_account_number: z.string(),
  account_type: z.string(),
  check_type: z.string(),
  check_number: z.string(),
  phone_number: z.string(),
  ccc: z.string(),

  //token to call other api
  token: z.string().optional(),
});
