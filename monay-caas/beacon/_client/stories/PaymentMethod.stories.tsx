import type { Meta, StoryObj } from "@storybook/react";

import PaymentMethod from "../renderer/src/features/core/invoices/payInvoice/paymentMethod/PaymentMethod";

const meta = {
  title: "Pages/PayInvoice/PaymentMethod",
  component: PaymentMethod,
  tags: ["features", "Pages"],
} satisfies Meta<typeof PaymentMethod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaymentMethodStory: Story = {};
