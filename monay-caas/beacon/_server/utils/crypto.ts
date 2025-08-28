import crypto from "node:crypto";

import config from "#server/config";

export const createKey = (type: BufferEncoding = "hex") =>
  crypto.randomBytes(32).toString(type);

const { iv } = config;
const algo = "aes-256-gcm";
export const encryptString = (textToEncrypt: string, _key?: string) => {
  const key = _key ?? createKey();
  const cipher = crypto.createCipheriv(algo, Buffer.from(key, "utf-8"), iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(textToEncrypt, "utf-8")),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    encryptedString: encrypted.toString("hex"),
    authTag,
    key,
  };
};

export const decryptString = (
  encryptedString: string,
  key: string,
  authTag: string
) => {
  const decipher = crypto.createDecipheriv(algo, key, iv);
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedString, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
};
