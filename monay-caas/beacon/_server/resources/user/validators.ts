import { Access, Prisma } from "@prisma/client";
import { z } from "zod";

export const vUserInput = z.object({
  email: z.string().min(1),
  name: z.string().min(1),
});

export const vUserOutput = z.object({
  id: z.string(),
  email: z.string(),
});

export const vOrgInput = z.object({
  organization: z.string(),
  kybDocument: z.object({
    merchantName: z.string(),
    subMerchantDba: z.string(),
    taxId: z.string(),
    website: z.string(),
    phone: z.string(),
    addressId: z.string(),
  }),
  rawUserData: z.object({}).passthrough().optional(),
});

export const updateUserInput = z.object({
  id: z.string(),
  name: z.string().optional(),
  phone: z.string().optional(),
  //email(for now leave it), phone,
});
export const userIncludeFields = z.object<
  Record<keyof Omit<Prisma.UserInclude, "_count">, z.ZodOptional<z.ZodBoolean>>
>({
  flags: z.boolean().optional(),
  devices: z.boolean().optional(),
  role: z.boolean().optional(),
  organization: z.boolean().optional(),
  orgUser: z.boolean().optional(),
  prefs: z.boolean().optional(),
  nudgePrefs: z.boolean().optional(),
  contactInfo: z.boolean().optional(),
  nudges: z.boolean().optional(),
  approvalRequests: z.boolean().optional(),
  approvalsRequested: z.boolean().optional(),
  reports: z.boolean().optional(),
  reportsTo: z.boolean().optional(),
  assignments: z.boolean().optional(),
});

type CreateUserRole = Prisma.UserRoleCreateWithoutOrganizationInput;

export const DEFAULT_ROLE: CreateUserRole = {
  role: "None",
  isDefault: true,
  accessControl: {
    create: {
      organization: Access.NONE,
      users: Access.NONE,
    },
  },
};

export const AGENT_ROLE: CreateUserRole = {
  role: "Agent",
  isWhitelistDefault: true,
  reportLevel: 3,
  accessControl: {
    create: {
      billers: Access.READ,
      subscribers: Access.READ,
      subscriptions: Access.WRITE,
    },
  },
};

export const SUPERVISOR_ROLE: CreateUserRole = {
  role: "Supervisor",
  reportLevel: 2,
  accessControl: {
    create: {
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.READ,
      maxPayment: 99999.99,
    },
  },
};

export const MANAGER_ROLE: CreateUserRole = {
  role: "Manager",
  reportLevel: 1,
  accessControl: {
    create: {
      organization: Access.WRITE,
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.WRITE,
      maxPayment: 9999999999.99,
    },
  },
};
