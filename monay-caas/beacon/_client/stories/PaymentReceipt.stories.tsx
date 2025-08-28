import type { Meta, StoryObj } from "@storybook/react";

import PaymentReceipt from "../renderer/src/features/core/invoices/invoiceView/paymentReceipt/PaymentReceipt";

const meta = {
  title: "Pages/invoiceView/PaymentReceipt",
  component: PaymentReceipt,
  tags: ["features", "Pages"],
} satisfies Meta<typeof PaymentReceipt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaymentReceiptStory: Story = {
  args: {
    invoiceNumber: 201180533505,
    projectName: "Project name",
    department: "Gas",
    date: "08/26/2023",
    dueDate: "09/26/2023",
    category: "Utility",
    status: "Unpaid",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    paymentAmount: 122.99,
    netAmount: 0.00,
    unitPrice: 0.00,
    quantity: 232,
    paymentMethodFee: 0.00,
  }
};
