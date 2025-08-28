import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  AddMoneyButton,
  CheckboxActiveButton,
  CheckboxInactiveButton,
  CloseButton,
  DashboardButton,
  FilterButton,
  IconButton,
  ListButton,
  MapButton,
  MenuButton,
  MoreButton,
  RobotButton,
  SendMoneyButton,
  SettingsButton,
  VectorButton,
} from "../renderer/src/components/atoms/IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Atoms/IconButton",
  component: IconButton,
  tags: ["atoms", "components", "autodocs"],
  argTypes: {
    size: { control: "radio", options: ["default", "small"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendMoneyStory: Story = {
  name: "Send Money",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <SendMoneyButton {...args} />;
  },
};

export const AddMoneyStory: Story = {
  name: "Add Money",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <AddMoneyButton {...args} />;
  },
};

export const SettingsStory: Story = {
  name: "Settings",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <SettingsButton {...args} />;
  },
};

export const MenuStory: Story = {
  name: "Menu",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <MenuButton {...args} />;
  },
};

export const RobotStory: Story = {
  name: "Robot",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <RobotButton {...args} />;
  },
};

export const MapStory: Story = {
  name: "Map",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <MapButton {...args} />;
  },
};

export const VectorStory: Story = {
  name: "Vector",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <VectorButton {...args} />;
  },
};

export const DashboardStory: Story = {
  name: "Dashboard",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <DashboardButton {...args} />;
  },
};

export const ListStory: Story = {
  name: "List",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <ListButton {...args} />;
  },
};

export const FilterStory: Story = {
  name: "Filter",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <FilterButton {...args} />;
  },
};

export const MoreStory: Story = {
  name: "More",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <MoreButton {...args} />;
  },
};

export const CheckboxActiveStory: Story = {
  name: "Checkbox Active",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <CheckboxActiveButton {...args} />;
  },
};

export const CheckboxInactiveStory: Story = {
  name: "Checkbox Inactive",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <CheckboxInactiveButton {...args} />;
  },
};

export const CloseStory: Story = {
  name: "Close",
  args: {
    disabled: false,
    size: "default",
  },
  render: (args) => {
    return <CloseButton {...args} />;
  },
};
