import { toCaps, toLower } from "#helpers";
import { EventEmitter } from "events";

type BeaconEE<T extends string> = {
  subscriptionTypes: Record<UpdateOps, SubscriptionType<T>>;
  emit: () => {};
};

const eventString = <T extends string>(
  t: UpdateOps,
  name: T
): SubscriptionType<T> => `${t}${toCaps(toLower(name))}` as SubscriptionType<T>;

const ee = <T extends string>(name: T) => {
  const eventEmitter = new EventEmitter() as EventEmitter & BeaconEE<T>;

  eventEmitter.subscriptionTypes = {
    onCreate: eventString("onCreate", name),
    onUpdate: eventString("onUpdate", name),
    onDelete: eventString("onDelete", name),
  };

  return eventEmitter;
};

export default ee;
