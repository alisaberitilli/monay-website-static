import type { Meta, StoryObj } from "@storybook/react";

import Loading from "../renderer/src/components/atoms/Loading";

const meta = {
  title: "Atoms/Loading",
  component: Loading,
  tags: ["components", "atoms"],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingStory: Story = {};
