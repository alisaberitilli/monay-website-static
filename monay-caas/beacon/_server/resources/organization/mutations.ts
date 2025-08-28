import { DeactivationReason } from "@prisma/client";
import { TRPCError } from "@trpc/server";
// import { KybDocumentUpdateInputObjectSchema } from "prisma/generated/schemas/objects/KybDocumentUpdateInput.schema";
// import { KybDocumentWhereInputObjectSchema } from "prisma/generated/schemas/objects/KybDocumentWhereInput.schema";
import { KybOwnerUpdateWithoutKybDocInputObjectSchema } from "prisma/generated/schemas/objects/KybOwnerUpdateWithoutKybDocInput.schema";
import { z } from "zod";

import { rbacProcedure } from "#server/trpc";

import { updateOrgKybInput } from "./validators";

// update user details
export const updateOrgKyb = rbacProcedure
  .meta({ rbac: { kyb: "WRITE" } })
  // .input(KybDocumentUpdateInputObjectSchema)
  .input(updateOrgKybInput)
  .mutation(async ({ input, ctx: { prisma, authEmail } }) => {
    //FIXME-already user details are in input, so remove below lines later
    const userDetails = await prisma.user.findUnique({
      where: {
        email: authEmail,
      },
      include: {
        orgUser: {
          include: {
            organization: {
              include: {
                kybDoc: true,
              },
            },
          },
        },
      },
    });
    if (!userDetails) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No usr found in db!!!",
      });
    }
    // const dataToUpdate: typeof KybDocumentSchemaType = {};
    // if (input?.facebookUrl) {
    //   dataToUpdate.facebookUrl = input.facebookUrl;
    // }

    const orgId = userDetails.orgUser?.organizationId;
    const updateKybDoc = await prisma.kybDocument.update({
      where: {
        organizationId: orgId,
      },
      data: {
        ...input,
      },
    });
    console.log(userDetails);
    return updateKybDoc;
  });

interface KybDocumentSchemaType {
  merchantName: string;
  subMerchantDba: string;
  website: string;
  taxId: string;
  phone: string;
  // phoneType      DbaContactType?
  linkedinUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  overview: string;
  //business address
  // address        Address?
  addressId: string;

  // other information
  productDescription: string;
  primaryBusiness: string;
  firstYearSalesVol: number;
  averageTxAmt: number;
  // posType            FulfillmentType?
  posPct: number;

  // financial documentation
  // businessType        :BusinessType?
  productsAndServices: string;
  backgroundInfo: string;
  backgroundInfoUrl: string;
  // these are s3 keys to uploaded pdfs
  // s3 url format will be bucket.s3.region.com/organizations/{ORG_ID}/{KEY}
  // where KEY is what is stored below
  resumeUrl: string;
  corpOverviewUrl: string;
  statementUrl: string;
  statementInterimUrl: string;
  depositoryInfoUrl: string;
  merchProcessingUrl: string;
  profitLossUrl: string;

  // boarding form info
  // feeModel             FeeModel?
  locationCount: number;
  // incorporationDate    DateTime?       @map("incorporation_date")
  incorporationState: string;
  // taxIdType            TaxIdType?
  taxName: string;
  dbaName: string;
  dbaNumber: string;
  dbaContactName: string;
  // dbaContactType       DbaContactType?
  retailDescriptor: string;
  customerServiceNum: string;
  customerServiceEmail: string;
  billToName: string;
  billToContactName: string;
  billToPhone: string;
  // billToAddress        Address?
  billToAddressId: string;
  companyFax: string;
  companyFaxCCC: string;
  companySignUrl: string;
  companyLogoUrl: string;

  // organization   Organization
  organizationId: string;

  // localeData KybLocaleData?

  // owners        KybOwner[]
  //Name, title and, profile of people having authority and responsibility for planning, directing, and controlling the activities of the company, either directly or indirectly.
  // keyManagement KybManager[] //list of key mgmt

  //bank details
  bankRoutingNum: string;
  bankAccNum: string;
  bankAccType: string;
  checkType: string;
  checkNum: string;
}
export const updateOrgKybOwner = rbacProcedure
  .meta({ rbac: { kyb: "WRITE" } })
  .input(KybOwnerUpdateWithoutKybDocInputObjectSchema)
  .mutation(async ({ input, ctx: { prisma, user } }) => {
    const updatedOwners = await prisma.kybOwner.updateMany({
      where: { kybDoc: { organizationId: user.organizationId } },
      data: {
        ...input,
      },
    });
    console.log(updatedOwners);
  });

export const updateOrgKybManager = {};

export const deactivateOrg = rbacProcedure
  .meta({
    rbac: {
      organization: "WRITE",
    },
  })
  .input(
    z.object({
      deactivationReasion: z.string(),
    })
  )
  // .output()
  .mutation(async ({ input, ctx: { user, prisma, log } }) => {
    const orgId = user.organizationId;
    const updateOrg = await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        deactivated: true,
        // deactivatedAt: now(),
        users: {
          updateMany: {
            where: { organizationId: user.organizationId },
            data: {
              deactivationReason: DeactivationReason.ORGANIZATION_DEACTIVATION,
            },
          },
        },
      },
      include: {
        users: true,
      },
    });
  });
