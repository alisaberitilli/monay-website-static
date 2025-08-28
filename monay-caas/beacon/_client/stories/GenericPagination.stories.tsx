import type { Meta, StoryObj } from "@storybook/react";

import genericPagination from "../renderer/src/features/core/invoices/features-hoc/genericPagination";

const meta = {
  title: "Atoms/Pagination",
  component: genericPagination,
  tags: ["features", "Pages"],
} satisfies Meta<typeof genericPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenericPaginationStory: Story = {};
