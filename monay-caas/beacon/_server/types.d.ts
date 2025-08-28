type KeysOfType<T, U, B = false> = {
  [P in keyof T]: B extends true
    ? T[P] extends U
      ? U extends T[P]
        ? P
        : never
      : never
    : T[P] extends U
    ? P
    : never;
}[keyof T];

type PickByType<T, U, B = false> = Pick<T, KeysOfType<T, U, B>>;
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

interface AddressObject {
  address?: string;
  country_code?: string;
  state_code?: string;
  city_code?: string;
  zip?: string;
}

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string = "."> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

type AllKeys<T> = T extends T ? keyof T : never;

type JsonPrimitive = string | number | boolean | bigint | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonArray = JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

type UpdateOps = "onCreate" | "onUpdate" | "onDelete";

type SubscriptionSet<T extends string> = {
  [key in UpdateOps as `${key}${Capitalize<Lowercase<T>>}`]: (
    // eslint-disable-next-line
    ...args: any[]
  ) => void;
};

type SubscriptionType<T extends string> = keyof SubscriptionSet<T>;

interface StoreMethods {
  get: (key: string) => string | null;
  set: (key: string, value: unknown) => void;
  has: (key: string) => boolean;
}

interface DesktopApi {
  fingerprint: string | null;
  store: StoreMethods;
}
