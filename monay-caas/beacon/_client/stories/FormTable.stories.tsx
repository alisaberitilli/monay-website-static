import FormTable from "../../_portal/src/app/_components/InvoiceReconciliation/FormTable";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Pages/FormTable",
  component: FormTable,
  tags: ["features", "Pages"],
} satisfies Meta<typeof test>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormTableStory: Story = {};
