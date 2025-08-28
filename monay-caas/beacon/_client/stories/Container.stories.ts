import type { Meta, StoryObj } from "@storybook/react";

import Container from "../renderer/src/components/atoms/Container";

const meta = {
  title: "Atoms/Container",
  component: Container,
  tags: ["components", "atoms"],
  argTypes: {
    title: { control: "text" },
    padding: { control: "radio", options: ["xs", "sm", "md", "lg"] },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContainerStory: Story = {
  args: {
    children: "Default Container",
    type: "default",
    title: "Container Title",
  },
};

export const NeumorphicContainerStory: Story = {
  args: {
    children: "Neumorphic Container",
    type: "neu",
    title: "Container Title",
  },
};

export const ListContainerStory: Story = {
  args: {
    children: "List Container",
    type: "list",
    title: "Container Title",
    padding: "lg",
  },
};

export const DropdownContainerStory: Story = {
  args: {
    children: "Dropdown Container",
    type: "dropdown",
    title: "Container Title",
  },
};
