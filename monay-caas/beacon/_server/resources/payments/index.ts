import { router } from "#server/trpc";

import { saveAch, saveCard } from "./mutations";
import { CheckPaymentStatus, orgAllTransactions } from "./queries";

const paymentsRouter = router({
  saveCard: saveCard,
  saveAch: saveAch,
  orgAllTransactions: orgAllTransactions,
  paymentStatus: CheckPaymentStatus,
});

export default paymentsRouter;
