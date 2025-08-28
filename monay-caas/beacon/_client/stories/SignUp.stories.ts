import type { Meta, StoryObj } from "@storybook/react";

import SignUp from "../renderer/src/features/auth/components/SignUp";

const meta = {
  title: "Widgets/SignUp",
  component: SignUp,
  tags: ["features", "auth"],
} satisfies Meta<typeof SignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
