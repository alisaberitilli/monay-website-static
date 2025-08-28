import type { Meta, StoryObj } from "@storybook/react";

import SubscriberWidget from "../renderer/src/features/core/subscribers/widget/SubscriberWidget";

const meta = {
  title: "Widgets/SubscriberWidget",
  component: SubscriberWidget,
  tags: ["features", "widget"],
} satisfies Meta<typeof SubscriberWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SubscriberWidgetStory: Story = {
  args: {
    companyName: "People Gas",
    joinedDate: "21.01.12",
    description: "Lorem ipsum dolor sit amet consectetur. Vestibulum rhoncus at consequat pulvinar venenatis eget. At semper massa cursus purus.Lorem ipsum dolor sit amet consectetur. Vestibulum rhoncus at consequat pulvinar venenatis eget. At semper massa cursus purusLorem ipsum dolor sit amet consectetur. Vestibulum rhoncus at consequat pulvinar venenatis eget. At semper massa cursus purusLorem ipsum dolor sit amet consectetur. Vestibulum tibulum rhoncus at consequat pulvinar venenatis eget. At semper massa cursus purusLorem ipsum dolor sit amet  sit amet consectetur. ectetur. Vestibulum rhoncus at consequat pulvinar venenatis eget. At semper massa cursus ursus purussectetur. Vestibulum ectetur. rhoncus at consequat pulvinar venenatis eget. At semper massa cursus  massa purusLorem ipsum dolor sit amet consectetur. Vestibulum rhoncus at consequat pulvinar venenatis eget. At semper massa cursus purus",  
  }
};
