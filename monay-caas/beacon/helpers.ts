// name another file in this project helpers.ts at your own risk...

export const sleep = async (ms: number): Promise<null> =>
  new Promise((res) => setTimeout(() => res(null), ms));

export const byteSize = (obj: unknown) =>
  new TextEncoder().encode(JSON.stringify(obj)).length;
export const kbSize = (obj: unknown) => byteSize(obj) / 1024;
export const mBSize = (obj: unknown) => kbSize(obj) / 1024;

export const randSign = () => (Math.random() > 0.5 ? 1 : -1);

export const noise = (value: number, effect: number, multiplier = 1) => {
  const min = (1 - effect) * value;
  const max = (1 + effect) * value;
  const range = max - min;
  return Math.random() * range * multiplier;
};

export const minTime = async <T>(
  promise: Promise<T>,
  ms = 1500
): Promise<T> => {
  const [res] = await Promise.all([promise, sleep(ms)]);
  return res;
};

export const maxTime = async <T>(
  promise: Promise<T>,
  ms = 1500
): Promise<T | null> => {
  const res = await Promise.race([promise, sleep(ms)]);
  return res;
};

export const toLower = <T extends string>(t: T): Lowercase<T> =>
  t.toLowerCase() as Lowercase<T>;
export const toUpper = <T extends string>(t: T): Uppercase<T> =>
  t.toUpperCase() as Uppercase<T>;
export const toCaps = <T extends string>(t: T): Capitalize<T> =>
  (t.slice(0, 1).toUpperCase() + t.slice(1).toLowerCase()) as Capitalize<T>;

type StringCase =
  | "camel"
  | "snake"
  | "kebab"
  | "mumble"
  | "pascal"
  | "cobol"
  | "constant";
type StringTransformer = (t: string, i: number) => string;
type TransformerTuple = [StringTransformer, string];
const stringTransformers: Record<StringCase, TransformerTuple> = {
  camel: [(t: string, i: number) => (i === 0 ? toLower(t) : toCaps(t)), ""],
  snake: [toLower, "_"],
  kebab: [toLower, "-"],
  mumble: [toLower, ""],
  pascal: [toCaps, ""],
  cobol: [toUpper, "-"],
  constant: [toUpper, "_"],
};

export function caseify(stringCase: StringCase, ...tokens: string[]): string {
  const [transformer, joiner] = stringTransformers[stringCase];
  return tokens.map(transformer).join(joiner);
}

export const typeSafeObjectEntries = <T extends Record<PropertyKey, unknown>>(
  obj: T
): { [K in keyof T]: [K, T[K]] }[keyof T][] => {
  return Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][];
};

export const typeSafeObjectFromEntries = <
  const T extends ReadonlyArray<readonly [PropertyKey, unknown]>
>(
  entries: T
): { [K in T[number] as K[0]]: K[1] } => {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
};

export const enforceUnion = <T, U extends T[] = [T, ...T[]]>(
  array: U & ([T] extends [U[number]] ? unknown : never)
) => array;

export const addDefaultPropClasses = <T extends object>(
  props: T,
  defaultProps: T
) =>
  Object.fromEntries(
    Object.entries(props).map(([key, classes]) => [
      key,
      `${defaultProps[key as keyof typeof defaultProps]} ${classes}`,
    ])
  );

export const addDefaultClasses = <T extends object, U extends string>(
  propObject: Record<U, T>,
  defaultProps: T
): Record<U, T> =>
  Object.fromEntries(
    Object.entries(propObject).map(([propKey, prop]) => [
      propKey,
      addDefaultPropClasses(prop as T, defaultProps),
    ])
  ) as Record<U, T>;

export const mapObject = <T extends object, U = unknown>(
  obj: T,
  objMapper: (key: keyof T, value: T[keyof T]) => U
) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      objMapper(key as keyof T, value as T[keyof T]),
    ])
  ) as Record<keyof T, U>;

export const reduceObject = <T extends object, U = unknown>(
  obj: T,
  objReducer: (reduction: U, entry: [keyof T, T[keyof T]]) => U,
  defaultValue: U
) => {
  const entries = Object.entries(obj) as [keyof T, T[keyof T]][];
  return entries.reduce(objReducer, defaultValue);
};

export const reduceStringLength = (
  obj: Record<string | number | symbol, string>
) =>
  reduceObject(
    obj,
    (reduction, entry) => (reduction += entry[1]?.length ?? 0),
    0
  );

export const dateFmt: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};
export const formatDate = (d: Date) => d.toLocaleDateString("en-US", dateFmt);
