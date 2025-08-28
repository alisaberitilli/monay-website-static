import type {
  $Enums,
  Nudge,
  NudgeType,
  NudgeVariant,
  UserDevice,
} from "@prisma/client";

import { userNotificationEventEmitter } from "./resources/user/subscriptions";
import prisma from "./services/prisma";

const idMap = { user: "userId", organization: "organizationId" } as const;

export enum NudgeT {
  "CreateCard" = "CARD:CREATE",
  "CreateInvoice" = "INVOICE:CREATE",
  "DueInvoice" = "INVOICE:DUE",
  "ReceivedPayment" = "RECEIVED:PAYMENT",
  "FailedPayment" = "FAILED:PAYMENT",
  "RefundedPayment" = "REFUNDED:PAYMENT",
  "RaisedDisputePayment" = "RAISED:DISPUTEPAYMENT",
  "ResolvedDisputePayment" = "RESOLVED:DISPUTEPAYMENT",
  "ReminderSubscriptionRenewal" = "Reminder:SUBSCRIPTIONRENEWAL",
  "OverdueIncvoice" = "Overdue:INVOICE",
  "OutstandingBalance" = "OUTSTANDING:BALANCE",
  "ReminderFromBiller" = "REMINDER:FROMBILLER",
  "AvailableAccountStatement" = "AVAILABLE:ACCOUNTSTATEMENT",
  "NewService" = "NEW:SERVICE",
  "UpdatedService" = "UPDATED:SERVICE",
  "UpdateUserAccount" = "UPDATE:USERACCOUNT",
  "UpgradedOrganization" = "UPGRADED:ORGANIZATION",
  "ScheduledMaintainance" = "SCHEDULED:MAINTAINANCE",
  "ChangedInternalPolicy" = "CHNAGED:INTERNALEPOLICY",
  "UpdatedPreference" = "UPDATED:PREFERENCE",
  "UpdatedPaymentMethod" = "UPDATED:PAYMENTMETHOD",
  "ConfirmBulkPayment" = "CONFIRM:BULKPAYMENT",
  "JoinedBeacon" = "JOINED:BEACON",
  "ChangedPermissionForYourRole" = "PERMISSION:CHNAGEDFORYOURROLE",
  "SavedCard" = "SAVED:CARD",
  "SavedAccountDetails" = "SAVED:ACCOUNTDETAILS",
}

interface ValidateNotifOpts {
  rejectOnUnknown?: boolean;
}
export function validateNotification(
  nudge: Nudge & { type: NudgeType; variant?: NudgeVariant },
  opts: ValidateNotifOpts = { rejectOnUnknown: false }
) {
  const { type } = nudge;

  const mergeTags = nudge.data ? Object.entries(nudge.data) : null;
  const expectedMergeTags = type.mergeTags
    ? Object.entries(type.mergeTags)
    : null;

  // this needs to have
  // header: notification header text with merged merge tags
  // body: notification body text with merged merge tags
  // uri: notification deep link with merged path information
  const nudgeToClient = {
    id: nudge.userId ?? nudge.organizationId,
    header: nudge.variant?.header ?? type.header,
    body: nudge.variant?.body ?? type.body,
    uri: nudge.variant?.uri ?? type.uri,
  };

  if (!mergeTags && !expectedMergeTags) {
    // were done, do whatever
    return nudgeToClient;
  } else {
    if (
      opts.rejectOnUnknown &&
      (mergeTags?.length ?? 0) > (expectedMergeTags?.length ?? 0)
    ) {
      throw new Error(
        `
Unexpected merge tags found:
  Expected [${expectedMergeTags}]
  Received: [${mergeTags}]`
      );
    } else if ((mergeTags?.length ?? 0) < (expectedMergeTags?.length ?? 0)) {
      throw new Error(
        `
Missing merge tags:
  Expected [${expectedMergeTags}]
  Received: [${mergeTags}]`
      );
    }

    if (expectedMergeTags) {
      const missingTags = [];
      const conflictingTags = [];

      for (const [key, value] of expectedMergeTags) {
        const matchingTag = (mergeTags ?? []).find(
          (entry) => key === entry?.[0]
        );
        if (!matchingTag) {
          missingTags.push(key);
        } else if (typeof matchingTag[1] !== value) {
          conflictingTags.push({
            key,
            expected: value,
            got: matchingTag,
            gotType: typeof matchingTag[1],
          });
        } else {
          const formattedTag = formatMergeTag(matchingTag[1], value);
          if (~nudgeToClient.body.indexOf(`{${key}}`))
            nudgeToClient.body.replace(`{${key}}`, formattedTag);
          if (~nudgeToClient.header.indexOf(`{${key}}`))
            nudgeToClient.header.replace(`{${key}}`, formattedTag);
          if (~nudgeToClient.uri.indexOf(`{${key}}`))
            nudgeToClient.uri.replace(`{${key}}`, matchingTag[1]);
        }
      }

      if (missingTags.length) {
        throw new Error(`Missing merge tags: [${missingTags}]`);
      }

      if (conflictingTags.length) {
        throw new Error(
          `Conflicting merge tags: ${JSON.stringify(conflictingTags)}`
        );
      }
    }

    // check if any unmerged mergetags are in the constructed nudge body
    const mergeTagRegex = /\{.*\}/;
    if (
      mergeTagRegex.test(nudgeToClient.body) ||
      mergeTagRegex.test(nudgeToClient.header)
    ) {
      throw new Error(
        `Not all merge tags resolved:\n Header: ${nudgeToClient.header}\n Body: ${nudgeToClient.body}`
      );
    }
  }

  return nudgeToClient;
}

function formatMergeTag(
  tag: string | number | Date,
  type: "string" | "number" | "date"
) {
  if (typeof tag !== type && !(tag instanceof Date && type === "date")) {
    throw new Error("Cannot format merge tag");
  }

  if (type === "string" && typeof tag === "string") {
    return tag;
  }
  if (type === "number" && typeof tag === "number") {
    return tag.toString();
  }
  if (type === "date" && tag instanceof Date) {
    return tag.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "2-digit",
    });
  }

  return typeof tag === "string" ? tag : tag.toString();
}

interface NotificationData {
  type: "user" | "organization";
  id: string;
  mergeTags: Record<string, string | Date | number>;
  channels?: $Enums.Channel[];
}

export async function createNotification(type: NudgeT, data: NotificationData) {
  const nudge = await prisma.nudge.create({
    data: {
      [idMap[data.type]]: data.id,
      typeId: type,
      data: data.mergeTags,
      channels: data.channels ?? ["PUSH"],
    },
    include: { type: true },
  });

  return nudge;
}

export async function scheduleNotification(
  type: NudgeT,
  data: NotificationData,
  date: Date
) {
  console.log("");
}

export async function deliverNotification(
  nudge: Nudge & { type: NudgeType; variant?: NudgeVariant }
) {
  // also handle sending email, sms, whatsapp if channels are listed
  const notif = validateNotification(nudge, { rejectOnUnknown: false });

  for (const channel of nudge.channels) {
    switch (channel) {
      case "EMAIL":
        break;
      case "WHATSAPP":
        break;
      case "SMS":
        break;
      case "PUSH":
        userNotificationEventEmitter.emit("create", notif);
        break;
      default:
        break;
    }
  }

  return notif;
}

export async function createAndDeliverNotification(
  type: NudgeT,
  data: NotificationData
) {
  const nudge = await createNotification(type, data);
  return await deliverNotification(nudge);
}
