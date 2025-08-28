import type { Meta, StoryObj } from "@storybook/react";

import DueSoonWidget from "../renderer/src/features/core/invoices/views/DueSoonWidget";

const meta = {
  title: "Widgets/DueSoonWidget",
  component: DueSoonWidget,
  tags: ["features", "widget"],
} satisfies Meta<typeof DueSoonWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DueSoonWidgetStory: Story = {};
