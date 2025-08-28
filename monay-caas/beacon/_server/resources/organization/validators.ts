import { enforceUnion } from "#helpers";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export type AddressType = "BUSINESS" | "PERSONAL" | "BILLING";
const addressType = enforceUnion<AddressType>([
  "BUSINESS",
  "PERSONAL",
  "BILLING",
]);

const restrictedOrganizationWithAddress =
  Prisma.validator<Prisma.OrganizationArgs>()({
    select: { name: true, image: true, address: true },
  });
type RestrictedOrganizationWithAddress = Prisma.OrganizationGetPayload<
  typeof restrictedOrganizationWithAddress
>;
export const vFindOrganization = z.nullable(
  z
    .object({
      name: z.string(),
      image: z.string(),
      address: z.object({
        id: z.string(),
        googlePlacesId: z.string(),
        jsonAddress: z.string(),
        countryCode: z.string(),
      }),
    })
    .strip() satisfies z.ZodType<RestrictedOrganizationWithAddress>
);

export const Address = z.nullable(
  z.object({
    country_code: z.string().optional(),
    state_code: z.string().optional(),
    city_code: z.string().optional(),
    zip: z.string().optional(),
    address: z.string().optional(),
    address_type: z.enum(addressType).optional(),
  })
);
export const updateOrgKybInput = z.nullable(
  z.object({
    merchantName: z.string().optional(),
    subMerchantDba: z.string().optional(),
    website: z.string().optional(),
    taxId: z.string().optional(),
    phone: z.string().optional(),
    // phoneType      DbaContactType?
    linkedinUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    overview: z.string().optional(),
    //business address
    // address        Address?
    addressId: z.string().optional(),

    // other information
    productDescription: z.string().optional(),
    primaryBusiness: z.string().optional(),
    firstYearSalesVol: z.number().optional(),
    averageTxAmt: z.number().optional(),
    // posType            FulfillmentType?
    posPct: z.number().optional(),

    // financial documentation
    // businessType        :BusinessType?
    productsAndServices: z.string().optional(),
    backgroundInfo: z.string().optional(),
    backgroundInfoUrl: z.string().optional(),
    // these are s3 keys to uploaded pdfs
    // s3 url format will be bucket.s3.region.com/organizations/{ORG_ID}/{KEY}
    // where KEY is what is stored below
    resumeUrl: z.string().optional(),
    corpOverviewUrl: z.string().optional(),
    statementUrl: z.string().optional(),
    statementInterimUrl: z.string().optional(),
    depositoryInfoUrl: z.string().optional(),
    merchProcessingUrl: z.string().optional(),
    profitLossUrl: z.string().optional(),

    // boarding form info
    // feeModel             FeeModel?
    locationCount: z.number().optional(),
    // incorporationDate    DateTime?       @map("incorporation_date")
    incorporationState: z.string().optional(),
    // taxIdType            TaxIdType?
    taxName: z.string().optional(),
    dbaName: z.string().optional(),
    dbaNumber: z.string().optional(),
    dbaContactName: z.string().optional(),
    // dbaContactType       DbaContactType?
    retailDescriptor: z.string().optional(),
    customerServiceNum: z.string().optional(),
    customerServiceEmail: z.string().optional(),
    billToName: z.string().optional(),
    billToContactName: z.string().optional(),
    billToPhone: z.string().optional(),
    // billToAddress: Address,
    billToAddressId: z.string().optional(),
    companyFax: z.string().optional(),
    companyFaxCCC: z.string().optional(),
    companySignUrl: z.string().optional(),
    companyLogoUrl: z.string().optional(),

    // organization   Organization
    organizationId: z.string().optional(),

    // localeData KybLocaleData?

    // owners        KybOwner[]
    //Name, title and, profile of people having authority and responsibility for planning, directing, and controlling the activities of the company, either directly or indirectly.
    // keyManagement KybManager[] //list of key mgmt

    //bank details
    bankRoutingNum: z.string().optional(),
    bankAccNum: z.string().optional(),
    bankAccType: z.string().optional(),
    checkType: z.string().optional(),
    checkNum: z.string().optional(),
  })
);
