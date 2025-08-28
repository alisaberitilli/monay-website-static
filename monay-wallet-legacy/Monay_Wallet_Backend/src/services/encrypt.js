const crypto = require('crypto');
import config from '../config';
const { algorithm, salt, digest, secretKey } = config.crypto;

let encrypt = async (plainText) => {
  try {
    const key = crypto.pbkdf2Sync(secretKey, salt, 65536, 32, digest);
    const iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (error) {
    throw Error(error);
  }
}

const encryptAPIs = {
  encrypt
}

export default encryptAPIs