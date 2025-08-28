import type { Meta, StoryObj } from "@storybook/react";

import Hint from "../renderer/src/components/atoms/Hint";

const meta = {
  title: "Atoms/Hint",
  component: Hint,
  tags: ["components", "atoms"],
} satisfies Meta<typeof Hint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HintStory: Story = {};
