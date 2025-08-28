import { router } from "#server/trpc";

import {
  addBiller,
  makeFinalPayment,
  makePaymentXdex,
  updateBiller,
  updatePayXdex,
} from "./mutations";
import {
  fetchVendorCodeDetails,
  fetchXdexApi,
  findVendorAccountDetails,
  getBillerDetails,
} from "./queries";

const xdexRouter = router({
  fetchVendorCode: fetchVendorCodeDetails,
  fetchXdexData: fetchXdexApi,
  xdexPayment: makePaymentXdex,
  updatePayXdex: updatePayXdex,
  payFinally: makeFinalPayment,
  findVenAccDetails: findVendorAccountDetails,
  addBiller: addBiller,
  updateBiller: updateBiller,
  getBiller: getBillerDetails,
});

export default xdexRouter;
