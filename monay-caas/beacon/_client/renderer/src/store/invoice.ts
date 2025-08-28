import { Model, idProp, model, prop } from "mobx-keystone";

@model("Beacon/Invoice")
export default class InvoiceModel extends Model({
  invoiceId: idProp,
}) {}
