import type { Meta, StoryObj } from "@storybook/react";

import NoData from "../renderer/src/features/core/NoData/NoData";

const meta = {
  title: "Pages/NoData",
  component: NoData,
  tags: ["features", "Pages"],
} satisfies Meta<typeof NoData>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoDataStory: Story = {
    args: {
        name: "List Data"
    }
};
