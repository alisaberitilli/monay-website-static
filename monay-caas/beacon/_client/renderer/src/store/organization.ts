import { Model, idProp, model, prop } from "mobx-keystone";

import { BillerContactModel, SubscriberContactModel } from "./contact";
import KybModel from "./kyb";

@model("Beacon/Organization")
export default class OrganizationModel extends Model({
  id: idProp,
  subscriberUnits: prop<SubscriberModel[]>(),
  billerUnits: prop<BillerModel[]>(),
  kybDocument: prop<KybModel>().withSetter(),
}) {}

@model("Beacon/Organization/Subscriber")
export class SubscriberModel extends Model({
  id: idProp,
  contactInfo: prop<SubscriberContactModel[]>().withSetter(),
}) {}

@model("Beacon/Organization/Biller")
export class BillerModel extends Model({
  id: idProp,
  contactInfo: prop<BillerContactModel[]>().withSetter(),
}) {}

@model("Beacon/Organization/Account")
export class AccountModel extends Model({
  id: idProp,
  accountId: prop<string>(),
  biller: prop<BillerModel>(),
  subscriber: prop<SubscriberModel>(),
  contracts: prop<ContractModel[] | undefined>(),
}) {}

@model("Beacon/Organization/Account/Contract")
export class ContractModel extends Model({
  id: idProp,
}) {}

@model("Beacon/Organization/Account/Contract/Service")
export class ServiceModel extends Model({
  id: idProp,
}) {}

@model("Beacon/Organization/Domains")
export class DomainModel extends Model({
  domain: prop<string>(),
  testEmail: prop<string>(),
}) {}

@model("Beacon/Organization/Submerchant")
export class SubmerchantModel extends Model({
  name: prop<string>(),
  description: prop<string>(""),
}) {}
