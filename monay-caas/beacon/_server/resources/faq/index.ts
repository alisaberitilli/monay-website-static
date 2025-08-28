import { router } from "#server/trpc";

import { getAllFaqs, getFaqById, getFaqByTags } from "./queries";

const faqRouter = router({
  all: getAllFaqs,
  byId: getFaqById,
  byTags: getFaqByTags,
});

export default faqRouter;
