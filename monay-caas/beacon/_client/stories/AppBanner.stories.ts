import type { Meta, StoryObj } from "@storybook/react";

import AppBanner from "../renderer/src/components/singletons/AppBanner";

const meta = {
  title: "Singletons/AppBanner",
  component: AppBanner,
  tags: ["components", "singletons"],
} satisfies Meta<typeof AppBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AppBannerStory: Story = {};
