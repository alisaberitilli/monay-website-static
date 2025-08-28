import type { Meta, StoryObj } from "@storybook/react";

import SignIn from "../renderer/src/features/auth/components/SignIn";

const meta = {
  title: "Widgets/SignIn",
  component: SignIn,
  tags: ["features", "auth"],
} satisfies Meta<typeof SignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
