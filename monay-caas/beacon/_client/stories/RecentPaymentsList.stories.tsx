import type { Meta, StoryObj } from "@storybook/react";

import RecentPaymentsList from "../renderer/src/features/core/invoices/recentPayments-list/views/RecentPaymentsList";

const meta = {
  title: "Pages/RecentPaymentsList",
  component: RecentPaymentsList,
  tags: ["features", "Pages"],
} satisfies Meta<typeof RecentPaymentsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RecentPaymentsListStory: Story = {};
