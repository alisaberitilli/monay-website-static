import type { Meta, StoryObj } from "@storybook/react";

import LoadingScreen from "../renderer/src/components/singletons/LoadingScreen";

const meta = {
  title: "Screens/Loading",
  component: LoadingScreen,
  tags: ["components", "atoms", "screens", "singletons"],
} satisfies Meta<typeof LoadingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingScreenStory: Story = {};
