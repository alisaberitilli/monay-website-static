import crypto from 'crypto';
import config from '../config/index.js';
const { algorithm, salt, digest, secretKey } = config.crypto;

let encrypt = async (plainText) => {
  try {
    // Add fallbacks for missing environment variables
    const fallbackDigest = digest || 'sha256';
    const fallbackSalt = salt || 'defaultSalt';
    const fallbackSecretKey = secretKey || 'defaultSecretKey';
    const fallbackAlgorithm = algorithm || 'aes-256-cbc';
    
    const key = crypto.pbkdf2Sync(fallbackSecretKey, fallbackSalt, 65536, 32, fallbackDigest);
    const iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const cipher = crypto.createCipheriv(fallbackAlgorithm, key, iv);
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