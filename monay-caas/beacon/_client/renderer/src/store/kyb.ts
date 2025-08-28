import type {
  BusinessType,
  DbaContactType,
  FulfillmentType,
  TaxIdType,
} from "@prisma/client";
import { Model, idProp, model, prop } from "mobx-keystone";

import AddressModel from "./address";

@model("Beacon/Organization/Kyb")
export default class KybModel extends Model({
  id: idProp,

  // business information
  merchantName: prop<string | undefined>().withSetter(),
  subMerchantDba: prop<string | undefined>().withSetter(),
  website: prop<string | undefined>().withSetter(),
  taxId: prop<string | undefined>().withSetter(),
  phone: prop<string | undefined>().withSetter(),
  linkedinUrl: prop<string | undefined>().withSetter(),
  overview: prop<string | undefined>().withSetter(),
  address: prop<AddressModel>().withSetter(),

  // other information
  productDescription: prop<string | undefined>().withSetter(),
  primaryBusiness: prop<string | undefined>().withSetter(),
  firstYearSalesVol: prop<number | undefined>().withSetter(),
  averageTxAmt: prop<number | undefined>().withSetter(),
  posType: prop<FulfillmentType | undefined>().withSetter(),
  posPct: prop<number | undefined>().withSetter(),

  // financial documentation
  businessType: prop<BusinessType | undefined>().withSetter(),
  productsAndServices: prop<string | undefined>().withSetter(),
  backgroundInfo: prop<string | undefined>().withSetter(),
  resumeUrl: prop<string | undefined>().withSetter(),
  corpOverviewUrl: prop<string | undefined>().withSetter(),
  statementUrl: prop<string | undefined>().withSetter(),
  statementInterimUrl: prop<string | undefined>().withSetter(),
  depositoryInfoUrl: prop<string | undefined>().withSetter(),
  merchProcessingUrl: prop<string | undefined>().withSetter(),
  profitLossUrl: prop<string | undefined>().withSetter(),

  // boarding form info
  locationCount: prop<number | undefined>().withSetter(),
  incorporationDate: prop<Date | undefined>().withSetter(),
  taxIdType: prop<TaxIdType | undefined>().withSetter(),
  taxName: prop<string | undefined>().withSetter(),
  dbaName: prop<string | undefined>().withSetter(),
  dbaContactName: prop<string | undefined>().withSetter(),
  dbaContactType: prop<DbaContactType | undefined>().withSetter(),
  retailDescriptor: prop<string | undefined>().withSetter(),
  customerServiceNum: prop<string | undefined>().withSetter(),
  billToName: prop<string | undefined>().withSetter(),
  billToContactName: prop<string | undefined>().withSetter(),
  billToAddress: prop<AddressModel | undefined>().withSetter(),
}) {}

@model("Beacon/Organization/Kyb/Owner")
export class KybOwnerModel extends Model({
  name: prop<string | undefined>().withSetter(),
  dob: prop<Date | undefined>().withSetter(),
  title: prop<string | undefined>().withSetter(),
  ownershipPct: prop<number | undefined>().withSetter(),
  ssn: prop<string | undefined>().withSetter(),
  email: prop<string | undefined>().withSetter(),
  mobile: prop<string | undefined>().withSetter(),
}) {}

@model("Beacon/Organization/Kyb/Manager")
export class KybManagerModel extends Model({
  name: prop<string | undefined>().withSetter(),
  title: prop<string | undefined>().withSetter(),
  linkedinUrl: prop<string | undefined>().withSetter(),
  resumeUrl: prop<string | undefined>().withSetter(),
}) {}
