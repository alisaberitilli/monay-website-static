import type { Meta, StoryObj } from "@storybook/react";

import genericChart from "../renderer/src/components/hoc/genericChart";

const meta = {
  title: "Atoms/genericChart",
  component: genericChart,
  tags: ["components", "atoms"],
} satisfies Meta<typeof genericChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenericChartStory: Story = {
    args: {
        chartData: [
            { day: 1, payment: 17 },
            { day: 2, payment: 22 },
            { day: 3, payment: 33 },
            { day: 4, payment: 23 },
            { day: 5, payment: 45 },
            { day: 6, payment: 67 },
            { day: 7, payment: 89 },
            { day: 8, payment: 78 },
            { day: 9, payment: 57 },
            { day: 10, payment: 99 },
            { day: 11, payment: 68 },
            { day: 12, payment: 49 },
            { day: 13, payment: 111 },
            { day: 14, payment: 120 },
            { day: 15, payment: 125 },
            { day: 16, payment: 132 },
            { day: 17, payment: 121 },
            { day: 18, payment: 141 },
            { day: 19, payment: 131 },
            { day: 20, payment: 150 },
        ],
        width: 800,
        label: "Analytics",
      },
};
