import type { Meta, StoryObj } from "@storybook/react";

import Comments from "../renderer/src/features/core/invoices/invoiceView/comments/Comments";

const meta = {
  title: "Pages/invoiceView/Comments",
  component: Comments,
  tags: ["features", "Pages"],
} satisfies Meta<typeof Comments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommentsStory: Story = {};
