import { faker } from "@faker-js/faker";
import type { KybDocument } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { AES } from "crypto-js";

import config from "#server/config";
import { env } from "#server/utils";

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
  // TODO: fix this path
  const registrationResponse = await fetch(`${config.gpsApiPath}/register`, {
    method: "POST",
    body: JSON.stringify({
      ...inputs,
      channel,
      password: gpsPass,
    }),
  });
  const registration = await registrationResponse.json();

  if (!registration?.hasError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(registration.error),
    });
  }

  return { gpsAnswer: registration, ...encryptedValues };
};

interface GpsUserPortalLogin {
  email: string;
  password: string;
}
export const loginToGps = async (inputs: GpsUserPortalLogin) => {
  const loggingResponse = await fetch(`${config.gpsApiPath}/login`, {
    method: "POST",
    body: JSON.stringify({
      email: inputs.email,
      password: inputs.password,
    }),
  });
  const loging = await loggingResponse.json();
  if (!loging.hasError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(loging.message),
    });
  }
  console.log(loging.data);
  return loging.data;
};

const encryptPassForGps = (unencPass: string) =>
  AES.encrypt(unencPass, config.gpsSecret);

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

export const decryptGpsPassword = (
  encPass: string,
  encKey: string,
  iv: string
) => {
  const cipher = createDecipheriv("aes-128-gcm", encKey, iv);
  const write = cipher.update(encPass, "utf-8");
  if (!write) {
    // error handling logic
    throw new Error("Decrypting encrypted GPS password from cipher failed.");
  }
  const pass = cipher.final().toString("utf-8");
  return pass;
};

export const prepareGpsPassword = (
  encPass: string,
  encKey: string,
  iv: string
) => encryptPassForGps(decryptGpsPassword(encPass, encKey, iv));

interface GpsInput {
  token: string;
}
interface GpsKybInput extends GpsInput {
  kybDocument: KybDocument;
  address: AddressObject;
}
