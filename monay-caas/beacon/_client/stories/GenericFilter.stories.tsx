import type { Meta, StoryObj } from "@storybook/react";

import genericFilter from "../renderer/src/features/core/invoices/features-hoc/genericFilter";

const meta = {
  title: "Atoms/Filter",
  component: genericFilter,
  tags: ["features", "Pages"],
} satisfies Meta<typeof genericFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenericFilterStory: Story = {};
