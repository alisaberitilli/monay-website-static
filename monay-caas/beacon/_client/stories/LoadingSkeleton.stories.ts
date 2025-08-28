import type { Meta, StoryObj } from "@storybook/react";

import LoadingSkeleton from "../renderer/src/components/animations/LoadingSkeleton";

const meta = {
  title: "Animations/LoadingSkeleton",
  component: LoadingSkeleton,
  tags: ["components", "animations"],
} satisfies Meta<typeof LoadingSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingSkeletonStory: Story = {};
