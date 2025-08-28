import { router } from "#server/trpc";

import { deactivateOrg, updateOrgKyb } from "./mutations";
import { findExistingOrganization } from "./queries";

const organizationRouter = router({
  findExisting: findExistingOrganization,
  updateOrgKyb: updateOrgKyb,
  deactivateOrg: deactivateOrg,
});

export default organizationRouter;
