import { Nudge, User, UserDevice } from "@prisma/client";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "stream";

import ee from "#server/ee";
import {
  createNotification,
  deliverNotification,
  scheduleNotification,
} from "#server/notifications";
import { rbacProcedure } from "#server/trpc";

export const userEventEmitter = ee("user");

export const onUserUpdate = rbacProcedure
  .meta({ rbac: { users: "WRITE" } })
  .subscription(({ ctx: { user } }) => {
    return observable<User>((emit) => {
      const userSubs: SubscriptionSet<"user"> = {
        onCreateUser: () => {},
        onDeleteUser: () => {},
        onUpdateUser: (u: User) => {
          if (u.organizationId === user.organizationId) {
            emit.next(u);
          }
        },
      };

      Object.entries(userSubs).forEach(([EVENT, op]) => {
        userEventEmitter.on(EVENT, op);
      });

      return () => {
        Object.entries(userSubs).forEach(([EVENT, op]) => {
          userEventEmitter.off(EVENT, op);
        });
      };
    });
  });

export const userDeviceEventEmitter = ee("userDevice");
export const onUserDeviceUpdate = rbacProcedure
  .meta({ rbac: { organization: "READ" } })
  .subscription(({ ctx: { user } }) => {
    return observable<UserDevice>((emit) => {
      const userDeviceSubs: SubscriptionSet<"userDevice"> = {
        onCreateUserdevice: (device: UserDevice) => {
          if (device.userId === user.id) {
            emit.next(device);
          }
        },
        onDeleteUserdevice: (device: UserDevice) => {
          if (device.userId === user.id) {
            emit.next(device);
          }
        },
        onUpdateUserdevice: (device: UserDevice) => {
          if (device.userId === user.id) {
            emit.next(device);
          }
        },
      };

      Object.entries(userDeviceSubs).forEach(([EVENT, op]) => {
        userDeviceEventEmitter.on(EVENT, op);
      });

      return () => {
        Object.entries(userDeviceSubs).forEach(([EVENT, op]) => {
          userDeviceEventEmitter.off(EVENT, op);
        });
      };
    });
  });

export const userNotificationEventEmitter = new EventEmitter();
export const onUserNotify = rbacProcedure
  .meta({ rbac: { organization: "READ" } })
  .subscription(({ ctx: { user } }) => {
    return observable<{ header: string; body: string; uri: string }>((emit) => {
      const onCreateNotification = async (data: {
        id: string;
        header: string;
        body: string;
        uri: string;
      }) => {
        if (user.id === data.id || user.organizationId === data.id) {
          emit.next(data);
        }
      };

      userNotificationEventEmitter.on("create", onCreateNotification);

      return () => {
        userNotificationEventEmitter.off("create", onCreateNotification);
      };
    });
  });
