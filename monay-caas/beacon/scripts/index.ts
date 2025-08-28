import { faker } from "@faker-js/faker";
import { createCipheriv, randomBytes } from "crypto";
import { AES } from "crypto-js";

export const env = (ENV_VAR: string) => {
  if (!process.env[ENV_VAR]) {
    throw new Error(`env var ${ENV_VAR} is missing from .env`);
  }

  return process.env[ENV_VAR] ?? "";
};

const fakerModules = [
  faker.airline.aircraftType,
  faker.animal.bear,
  faker.animal.bird,
  faker.animal.cat,
  faker.animal.cetacean,
  faker.animal.snake,
  faker.color.human,
  faker.commerce.department,
  faker.commerce.productName,
  faker.person.firstName,
  faker.person.jobTitle,
  faker.company.buzzNoun,
  faker.company.name,
];

const NUM_MODULES = 3;
const getFake = () =>
  fakerModules[Math.floor(Math.random() * fakerModules.length)]()
    .toLowerCase()
    .replace(/[\W_]+/gi, "");
const makeFakes = () => new Array(NUM_MODULES).fill(0).map(getFake).join("-");

const chars = "abcdefghijklmnopqrstuvwxyz";
const nums = "1234567890";
const special = "!?@#$%^&*()";
const getRandomChar = (str: string) =>
  str.charAt(Math.floor(Math.random() * str.length));
const getRandomChars = (str: string, amt: number) =>
  new Array(amt)
    .fill(0)
    .map(() => getRandomChar(str))
    .join("");
const makeRandomChars = () =>
  `${getRandomChars(chars.toUpperCase(), 4)}${getRandomChars(
    nums,
    3
  )}${getRandomChar(special)}`;

interface GpsUserRegistrationForm {
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
}
export const registerGpsUser = async (inputs: GpsUserRegistrationForm) => {
  const channel = "Beacon";
  const { unencPass, ...encryptedValues } = createGpsPassword();
  const gpsPass = encryptPassForGps(unencPass);

  const registration = await fetch(env("GPS_URL"), {
    method: "POST",
    body: JSON.stringify({
      ...inputs,
      channel,
      password: gpsPass,
    }),
  }); //.then((res) => res.json());

  return { gpsAnswer: registration, ...encryptedValues };
};

const encryptPassForGps = (unencPass: string) =>
  AES.encrypt(unencPass, env("GPS_SECRET"));

const createGpsPassword = () => {
  const unencPass = `${makeFakes()}-${makeRandomChars()}`;
  const encKey = randomBytes(32);
  const iv = process.env.SERVER_IV ?? randomBytes(32);
  const cipher = createCipheriv("aes-128-gcm", encKey, iv);
  const write = cipher.write(unencPass, "utf-8");
  if (!write) {
    // error handling logic
    throw new Error("Writing unencrypted GPS password to cipher failed.");
  }
  const encPass = cipher.final().toString("utf-8");

  return {
    unencPass,
    encPass,
    encKey,
    iv,
  };
};

console.log(JSON.stringify(createGpsPassword()));
