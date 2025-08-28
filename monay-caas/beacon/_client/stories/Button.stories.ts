import type { Meta, StoryObj } from "@storybook/react";

import Button from "../renderer/src/components/atoms/Button";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["atoms", "components"],
  argTypes: {
    intent: { control: "radio" },
    size: { control: "radio" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    size: "default",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    intent: "secondary",
    size: "default",
    children: "Button",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    children: "Button",
  },
};

export const Big: Story = {
  args: {
    size: "big",
    children: "Button",
  },
};
