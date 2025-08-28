import { router } from "#server/trpc";

import {
  // updateBusinessInformation,
  // updateOwnershipInformation,
  addBillingInfo,
  addBusinessInformation,
  addOtherInfo,
  addOwnershipInformation,
  kycSubmitToGPSInd,
  kycSubmitToGPSUS,
} from "../../services/gps/kyb";

const kybRouter = router({
  addBusinessInformation: addBusinessInformation, //v1/kyc/business_info

  // updateBusinessInformation: updateBusinessInformation,
  addOwnershipInformation: addOwnershipInformation, //v1/kyc/contact
  addOtherInfo: addOtherInfo,
  // updateOwnershipInformation: updateOwnershipInformation,
  addBillingInfoRouter: addBillingInfo,
  submitUsKycToGPS: kycSubmitToGPSUS,
  submitIndKycToGPS: kycSubmitToGPSInd,
});

export default kybRouter;
