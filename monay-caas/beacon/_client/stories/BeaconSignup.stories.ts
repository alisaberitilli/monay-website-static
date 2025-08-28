import type { Meta, StoryObj } from "@storybook/react";
import BeaconSignup from "../../_portal/src/app/_components/BeaconSignup";

const meta = {
  title: "Pages/BeaconSignup",
  component: BeaconSignup,
  tags: ["features", "Pages"],
} satisfies Meta<typeof BeaconSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BeaconSignupStory: Story = {};
