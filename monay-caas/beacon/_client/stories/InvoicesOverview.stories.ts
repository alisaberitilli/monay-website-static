import type { Meta, StoryObj } from "@storybook/react";

import InvoicesOverview from "../renderer/src/features/core/invoices/payInvoice/invoicesOverview/InvoicesOverview";

const meta = {
  title: "Pages/PayInvoice/InvoicesOverview",
  component: InvoicesOverview,
  tags: ["features", "Pages"],
} satisfies Meta<typeof InvoicesOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InvoicesOverviewStory: Story = {};
