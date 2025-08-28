import type { ContactType } from "@prisma/client";
import { Model, idProp, model, prop } from "mobx-keystone";

@model("Beacon/Contact")
export default class ContactModel extends Model({
  id: idProp,
  type: prop<ContactType>(),
  info: prop<string>(),
}) {}

@model("Beacon/Contact/User")
export class UserContactModel extends Model({
  isPrimary: prop<boolean>(false),
  contact: prop<ContactModel>(),
}) {}

@model("Beacon/Contact/Susbcriber")
export class SubscriberContactModel extends Model({
  isPrimary: prop<boolean>(false),
  contact: prop<ContactModel>(),
}) {}

@model("Beacon/Contact/Biller")
export class BillerContactModel extends Model({
  isPrimary: prop<boolean>(false),
  contact: prop<ContactModel>(),
}) {}
