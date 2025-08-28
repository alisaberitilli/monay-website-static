import { Access, type UserControl } from "@prisma/client";

export type UserControls = PickByType<UserControl, Access>;
export type UserControlKey = keyof UserControls;
export const controlMap: Record<Access, number> = {
  [Access.NONE]: 0,
  [Access.READ]: 1,
  [Access.WRITE]: 2,
};

export const evalRole = (userPermAccess: Access, requiredPermAccess: Access) =>
  controlMap[userPermAccess] >= controlMap[requiredPermAccess];

const hasAccess = (accessLevel: Access) => {
  const getAccess = <T extends object = never>(
    userPermAccess?: Access,
    obj?: T
  ): T | boolean => {
    const hasAccess =
      controlMap[userPermAccess ?? Access.NONE] >= controlMap[accessLevel];
    if (obj && hasAccess) return obj;

    return hasAccess;
  };
  return getAccess;
};

export const hasReadAccess = hasAccess("READ");
export const hasWriteAccess = hasAccess("WRITE");
