import type { Meta, StoryObj } from "@storybook/react";

import BillerSection from "../renderer/src/features/core/invoices/billerSection/BillerSection";

const meta = {
  title: "Pages/BillerSection",
  component: BillerSection,
  tags: ["features", "Pages"],
} satisfies Meta<typeof BillerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BillerSectionStory: Story = {};
