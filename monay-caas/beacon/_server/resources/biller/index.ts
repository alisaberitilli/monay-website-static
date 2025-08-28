import { router } from "#server/trpc";

import { findBiller } from "./mutations";

// import { getBiller } from "./queries";

const userRouter = router({
  // create: createBiller,
  // delete: deleteBiller,
  get: findBiller,
});

export default userRouter;
