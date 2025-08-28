import { Model, idProp, model, prop } from "mobx-keystone";

interface ClientUserRole {
  role: string;
  description: string;
  updatedAt: string;
  accessControl: {
    organization: string;
    users: string;
    nudges: string;
    invoices: string;
    billers: string;
    bills: string;
    subscribers: string;
    subscriptions: string;
    permissions: string;
  };
}

@model("Beacon/User")
export default class UserModel extends Model({
  id: idProp,
  email: prop<string>().withSetter(),
  name: prop<string>(),
  phone: prop<string | undefined>().withSetter(),
  role: prop<ClientUserRole | undefined>().withSetter(),
}) {}

@model("Beacon/User/Role")
export class UserRoleModel extends Model({
  role: prop<string | undefined>().withSetter(),
  description: prop<string | undefined>().withSetter(),
}) {}

@model("Beacon/User/Role/Control")
export class UserControlModel extends Model({}) {}

@model("Beacon/User/Device")
export class UserDeviceModel extends Model({
  os: prop<string | undefined>().withSetter(),
  appVersion: prop<string | undefined>().withSetter(),
  lastIp: prop<string | undefined>().withSetter(),
  timezone: prop<string | undefined>().withSetter(),
  fingerprint: prop<string | undefined>().withSetter(),
}) {}

@model("Beacon/User/Flags")
export class UserFlagsModel extends Model({}) {}

@model("Beacon/User/Prefs")
export class UserPrefsModel extends Model({}) {}

@model("Beacon/User/NudgePrefs")
export class UserNudgePrefsModel extends Model({}) {}
