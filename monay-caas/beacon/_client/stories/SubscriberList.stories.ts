import type { Meta, StoryObj } from "@storybook/react";

import SubscriberList from "../renderer/src/features/core/subscribers/list/SubscriberList";

const meta = {
  title: "Widgets/SubscriberList",
  component: SubscriberList,
  tags: ["features", "widget"],
} satisfies Meta<typeof SubscriberList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SubscriberListStory: Story = {};
