import { Model, idProp, model, prop } from "mobx-keystone";

@model("Beacon/Address")
export default class AddressModel extends Model({
  id: idProp,
  googlePlacesId: prop<string>(),
  jsonAddress: prop<Record<string, string>>(),
  country: prop<CountryModel>(),
}) {}

@model("Beacon/Locale")
export class LocaleModel extends Model({}) {}

@model("Beacon/Country")
export class CountryModel extends Model({}) {}
