import type { Meta, StoryObj } from "@storybook/react";

import Radio from "../renderer/src/components/atoms/Radio";

const meta: Meta<typeof Radio> = {
  title: "Atoms/Radio",
  component: Radio,
  tags: ["atoms", "components"],
  argTypes: {
    // variant: {control: "radio"}
    // intent: { control: "radio" },
    // size: { control: "radio" },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {};

// export const Yellow: Story = {
//     args: {
//         variant: 'yellow'
//     }
// }

// export const Red: Story = {
//     args: {
//         variant: 'red'
//     }
// }

// export const Grouped: Story = {
//     render: (args) =>
//         <div
//             style = {{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: 10,
//                 border : '1px solid black',
//                 width: 'max-content',
//                 padding: 10,
//             }}
//         >
//             <Light variant= "red" />
//             <Light variant= "yellow" />
//             <Light variant= "green" />
//         </div>
// }
