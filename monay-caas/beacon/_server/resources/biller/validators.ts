import { enforceUnion } from "#helpers";
import { Access, DeviceType, Prisma } from "@prisma/client";
import { UserIncludeObjectSchema } from "prisma/generated/schemas/objects/UserInclude.schema";
import { z } from "zod";

const deviceTypes = enforceUnion<DeviceType>([
  "ANDROID",
  "DESKTOP",
  "IOS",
  "WEB",
]);

export const findBillerInput = z.object({
  name: z.string().min(1),
});

export const findBillerOutPut = z.object({
  name: z.string(),
  // organization: z.string(),
  organizationId: z.string(),
  id: z.string(),
});

export const vUserDevice = z.object({
  timezone: z.string(),
  platform: z.enum(deviceTypes),
  deviceId: z.string(),
  osVersion: z.string(),
  appVersion: z.string(),
});

export const vUserInput = z.object({
  email: z.string().min(1),
  name: z.string().min(1),
  device: vUserDevice,
});

export const vUserOutput = z.object({
  id: z.string(),
  email: z.string(),
});

export const userIncludeFields = UserIncludeObjectSchema;

type CreateUserRole = Omit<Prisma.UserRoleCreateArgs["data"], "organization">;

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
  accessControl: {
    create: {
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.READ,
    },
  },
};

export const MANAGER_ROLE: CreateUserRole = {
  role: "Supervisor",
  accessControl: {
    create: {
      organization: Access.WRITE,
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.WRITE,
    },
  },
};
