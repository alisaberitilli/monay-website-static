import type { Meta, StoryObj } from "@storybook/react";

import TextInput from "../renderer/src/components/form/TextInput";

const meta = {
  title: "Forms/Input",
  component: TextInput,
  tags: ["forms", "components"],
  argTypes: {
    formSize: { control: "radio" },
    block: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    base: { control: "radio" },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    formSize: "md",
    block: true,
    label: "Label",
    description: "This is a description block for this input field",
    error: "",
  },
};
