import type { Meta, StoryObj } from "@storybook/react";

import InvoiceList from "../renderer/src/features/core/invoices/views/InvoiceList";

const meta = {
  title: "Pages/InvoiceList",
  component: InvoiceList,
  tags: ["features", "Pages"],
} satisfies Meta<typeof InvoiceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InvoiceListStory: Story = {};
