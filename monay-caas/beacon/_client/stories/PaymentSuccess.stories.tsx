import type { Meta, StoryObj } from "@storybook/react";

import PaymentSuccess from "../renderer/src/features/core/invoices/paymentSuccess/PaymentSuccess";

const meta = {
  title: "Pages/paymentSuccess/PaymentSuccess",
  component: PaymentSuccess,
  tags: ["features", "Pages"],
} satisfies Meta<typeof PaymentSuccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaymentSuccessStory: Story = {};
