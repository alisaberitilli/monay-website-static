// DO NOT IMPORT ANY DEPENDENCIES IN THIS FILE
// ONLY PURE JS/TS CODE SHOULD EXIST HERE
// DONT PUT IN ANYTHING THAT REQUIRES DOM/NODE APIS UNLESS IT IS GUARANTEED CROSS-COMPATIBLE

export const noop = () => {};
export const noopAsync = async () => {};
export const nilOp = () => null;
export const nonOp = () => undefined;

export const currencies = ["$", "¥", "£", "€", "₹"] as const;
export const randomCurrency = () =>
  currencies[Math.floor(Math.random() * currencies.length)];
export const moddedCurrency = (index: number) =>
  currencies[index % currencies.length];

const RATIO = Math.PI / 180;
export const degreesToRadians = (degrees: number) => degrees * RATIO;
export const radiansToDegrees = (radians: number) => radians * (1 / RATIO);

export function polarToCartesian({ r, theta }: { r: number; theta: number }) {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
}

export function cartesianToPolar({ x, y }: { x: number; y: number }) {
  return {
    r: Math.sqrt(x * x + y * y),
    theta: Math.atan2(y, x),
  };
}

export const self = <T>(t: T) => t;

export const ONE_MS = 1;
export const ONE_SEC = ONE_MS * 1000;
export const ONE_MIN = ONE_SEC * 60;
export const ONE_HR = ONE_MIN * 60;
export const ONE_DAY = ONE_HR * 24;
export const ONE_YEAR = ONE_DAY * 365;
export const ONE_LEAP_YEAR = ONE_YEAR + 1;

export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions[],
  delimiter = "-"
) => {
  const format = (option: Intl.DateTimeFormatOptions) => {
    const formatter = new Intl.DateTimeFormat("en", option);
    return formatter.format(date);
  };
  return options.map(format).join(delimiter);
};

export const dateToYyyyMmDd = (date = new Date()) =>
  formatDate(date, [
    { year: "numeric" },
    { month: "2-digit" },
    { day: "2-digit" },
  ]);
