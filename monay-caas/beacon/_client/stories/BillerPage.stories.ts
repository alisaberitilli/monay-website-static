import type { Meta, StoryObj } from "@storybook/react";
import BillerPage from "../renderer/src/features/core/billers/pages/BillerPage";

const meta = {
  title: "Pages/BillerPage",
  component: BillerPage,
  tags: ["features", "Pages"],
} satisfies Meta<typeof BillerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BillerPageStory: Story = {};
