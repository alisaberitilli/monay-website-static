import type { Invoice } from "@prisma/client";

import { useRootStore } from "#client/store/_root";

const withUserRole = <T extends { invoice: Invoice }>(
  Component: React.FC<T>,
  mock = process.env.STORYBOOK,
  mockData: Invoice = {} as Invoice
): React.FC<T> => {
  if (mock) {
    return (props: T) => {
      return <Component {...props} invoice={mockData} />;
    };
  }
  return (props: T) => {
    return <Component {...props} invoice={props.invoice} />;
  };
};

export default withUserRole;
