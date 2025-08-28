import type { Meta, StoryObj } from "@storybook/react";
import UploadWidget from "../../_portal/src/app/_components/UploadWidget";

const meta = {
  title: "Pages/UploadWidget",
  component: UploadWidget,
  tags: ["features", "Pages"],
} satisfies Meta<typeof UploadWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UploadWidgetStory: Story = {};
