// Last updated: 10/17/2023 10:56:49 AM

export enum StatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}
export type Status = `${StatusEnum}`;

export enum VendorSourceEnum {
  BEACON = "BEACON",
  XDEX_BBPS = "XDEX_BBPS",
  MANUAL = "MANUAL",
}
export type VendorSource = `${VendorSourceEnum}`;

export enum DeviceTypeEnum {
  WEB = "WEB",
  DESKTOP = "DESKTOP",
  IOS = "IOS",
  ANDROID = "ANDROID",
}
export type DeviceType = `${DeviceTypeEnum}`;

export enum AccessEnum {
  NONE = "NONE",
  READ = "READ",
  WRITE = "WRITE",
}
export type Access = `${AccessEnum}`;

export enum ThemeEnum {
  USER = "USER",
  LIGHT = "LIGHT",
  DARK = "DARK",
}
export type Theme = `${ThemeEnum}`;

export enum FulfillmentTypeEnum {
  POS_IMMEDIATE = "POS_IMMEDIATE",
  POS_DELAYED = "POS_DELAYED",
  MAIL_ORDER = "MAIL_ORDER",
  PHONE_ORDER = "PHONE_ORDER",
  INTERNET_ORDER = "INTERNET_ORDER",
}
export type FulfillmentType = `${FulfillmentTypeEnum}`;

export enum BusinessTypeEnum {
  GOV = "GOV",
  INTL = "INTL",
  LLC = "LLC",
  LLP = "LLP",
  PARTNERSHIP = "PARTNERSHIP",
  PROPRIETOR = "PROPRIETOR",
  SOLE_PROPRIETORSHIP = "SOLE_PROPRIETORSHIP",
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  NPO = "NPO",
}
export type BusinessType = `${BusinessTypeEnum}`;

export enum TaxIdTypeEnum {
  SSN = "SSN",
  EIN = "EIN",
  OTHER_FEDERAL_TAX = "OTHER_FEDERAL_TAX",
}
export type TaxIdType = `${TaxIdTypeEnum}`;

export enum DbaContactTypeEnum {
  MOBILE = "MOBILE",
  LANDLINE = "LANDLINE",
}
export type DbaContactType = `${DbaContactTypeEnum}`;

export enum FeeModelEnum {
  ABSORPTION = "ABSORPTION",
  CONVENIENCE = "CONVENIENCE",
}
export type FeeModel = `${FeeModelEnum}`;

export enum PiiTypeEnum {
  SSN = "SSN",
  LICENSE = "LICENSE",
  AADHAR = "AADHAR",
  PASSPORT = "PASSPORT",
}
export type PiiType = `${PiiTypeEnum}`;

export enum ContactTypeEnum {
  LANDLINE = "LANDLINE",
  MOBILE = "MOBILE",
  FAX = "FAX",
  EMAIL = "EMAIL",
}
export type ContactType = `${ContactTypeEnum}`;

export enum ChannelEnum {
  PUSH = "PUSH",
  SMS = "SMS",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
}
export type Channel = `${ChannelEnum}`;

export enum PaymentTypeEnum {
  ACH = "ACH",
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  AADHAR = "AADHAR",
}
export type PaymentType = `${PaymentTypeEnum}`;

export enum ComplainStatusEnum {
  OPEN = "OPEN",
  UNDER_INVESTIGATION = "UNDER_INVESTIGATION",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING_CUSTOMER_RESPONSE = "PENDING_CUSTOMER_RESPONSE",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  ESCALATED = "ESCALATED",
  REJECTED = "REJECTED",
  ON_HOLD = "ON_HOLD",
  WITH_DRAWN = "WITH_DRAWN",
}
export type ComplainStatus = `${ComplainStatusEnum}`;

export enum ComplainPriorityEnum {
  NO_PRIORITY = "NO_PRIORITY",
  URGENT = "URGENT",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}
export type ComplainPriority = `${ComplainPriorityEnum}`;

export enum InvoiceStatusEnum {
  UNPAID = "UNPAID",
  PROCESSING = "PROCESSING",
  DISPUTED = "DISPUTED",
  FINANCING_PENDING = "FINANCING_PENDING",
  ON_PAYMENT_PLAN = "ON_PAYMENT_PLAN",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  FULLY_PAID = "FULLY_PAID",
  VOIDED = "VOIDED",
}
export type InvoiceStatus = `${InvoiceStatusEnum}`;

export enum InvoiceRequestStatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PARTIALLY_APPROVED = "PARTIALLY_APPROVED",
  VOIDED = "VOIDED",
}
export type InvoiceRequestStatus = `${InvoiceRequestStatusEnum}`;

export enum AppInputTypeEnum {
  TEXT = "TEXT",
  SELECT = "SELECT",
  REGEX = "REGEX",
}
export type AppInputType = `${AppInputTypeEnum}`;
