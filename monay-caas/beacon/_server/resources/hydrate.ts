import { authProcedure, rbacProcedure } from "#server/trpc";
import { hasReadAccess, hasWriteAccess } from "#server/utils/db";

export const hydrateClient = rbacProcedure
  .meta({
    rbac: { organization: "READ" },
    userFields: {
      flags: true,
      prefs: true,
      nudgePrefs: true,
      devices: true,
      contactInfo: true,
      nudges: true,
    },
  })
  .query(async ({ ctx: { prisma, user } }) => {
    const {
      organization: orgPerms,
      users: userPerms,
      nudges: nudgePerms,
      payments: paymentPerms,
      billers: billerPerms,
      bills: billPerms,
      subscribers: subscriberPerms,
      subscriptions: subscriptionPerms,
    } = user.role.accessControl ?? {};

    const organization = hasReadAccess(orgPerms)
      ? await prisma.organization.findFirst({
          where: { id: user.organizationId },
        })
      : null;

    if (!organization) {
      return {
        organization,
        billerUnits: null,
        subscriberUnits: null,
        users: null,
        nudges: null,
        invites: null,
        domains: null,
        paymentMethods: null,
      };
    }

    const [
      billerUnits,
      subscriberUnits,
      users,
      nudges,
      invites,
      domains,
      paymentMethods,
    ] = await Promise.all([
      hasReadAccess(billerPerms)
        ? prisma.biller.findMany({
            where: { organizationId: organization.id },
            include: {
              contactInfo: true,
              accounts: {
                include: {
                  subscriber: true,
                  invoices: hasReadAccess(billPerms),
                },
              },
            },
          })
        : null,
      hasReadAccess(subscriberPerms)
        ? prisma.subscriber.findMany({
            where: { organizationId: organization.id },
            include: {
              contactInfo: true,
              accounts: {
                include: {
                  biller: true,
                  invoices: hasReadAccess(subscriptionPerms),
                },
              },
            },
          })
        : null,
      hasReadAccess(userPerms)
        ? prisma.user.findMany({
            where: { organizationId: organization.id },
          })
        : null,
      hasReadAccess(nudgePerms),
      true,
      true,
      hasWriteAccess(orgPerms),
    ]);

    return {
      organization,
      billerUnits,
      subscriberUnits,
      users,
      nudges,
      invites,
      domains,
      paymentMethods,
    };
  });

export const validateClient = rbacProcedure
  .meta({ rbac: { organization: "READ" } })
  .query(async ({ ctx: { prisma, user } }) => {
    if (user.deactivationReason === "ORGANIZATION_DEACTIVATION") {
      return false;
    }
    return true;
  });
