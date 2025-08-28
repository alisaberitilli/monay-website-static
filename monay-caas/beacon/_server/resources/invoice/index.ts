import { router } from "#server/trpc";

import {
  approveInvoiceRequest,
  complainCreate,
  createInvoice,
  invoiceApprovalRequest,
  updateComplaintInvoice,
  updateInvoice,
} from "./mutations";
import {
  getInvoiceById,
  getInvoiceComplainByInvoiceId,
  getInvoiceComplaintById,
} from "./queries";

const invoiceRouter = router({
  getInvoice: getInvoiceById,
  createInvoice: createInvoice,
  updateInvoice: updateInvoice,
  requestInvoice: invoiceApprovalRequest,
  approveInvoice: approveInvoiceRequest,
  complaintByInvoiceid: getInvoiceComplainByInvoiceId,
  complaintByComplaintId: getInvoiceComplaintById,
  createInvoiceComplain: complainCreate,
  updateInvoiceComplain: updateComplaintInvoice,
});

export default invoiceRouter;
