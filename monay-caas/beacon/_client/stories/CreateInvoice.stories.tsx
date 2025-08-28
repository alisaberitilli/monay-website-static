import type { Meta, StoryObj } from "@storybook/react";

import CreateInvoice from "../renderer/src/features/core/invoices/createInvoice/CreateInvoice";

const meta = {
  title: "Pages/CreateInvoice",
  component: CreateInvoice,
  tags: ["features", "Pages"],
} satisfies Meta<typeof CreateInvoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateInvoiceStory: Story = {};
