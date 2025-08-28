import type { Access } from "@prisma/client";

import { useRootStore } from "#client/store/_root";

interface RoleProps {
  access: Access;
}

const withUserRole = <T extends RoleProps>(
  Component: React.FC<T>,
  mock = process.env.STORYBOOK
): React.FC<T> => {
  if (mock) {
    return (props: T) => {
      return <Component {...props} />;
    };
  }
  return (props: T) => {
    const root = useRootStore();
    return <Component {...props} access={root.beacon!.user.role} />;
  };
};

export default withUserRole;
