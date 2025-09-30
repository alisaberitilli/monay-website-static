import crypto from 'crypto';

// Encryption function (exactly matching the backend service)
const encrypt = async (plainText) => {
  try {
    // Use the same defaults as in the encrypt service
    const fallbackDigest = 'sha256';
    const fallbackSalt = 'defaultSalt';
    const fallbackSecretKey = 'defaultSecretKey';
    const fallbackAlgorithm = 'aes-256-cbc';

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

// Test encryption
async function testEncryption() {
  const testValues = ['1234', '123456', '0000', '9999'];

  for (const value of testValues) {
    const encrypted = await encrypt(value);
    console.log(`MPIN "${value}" encrypts to: ${encrypted}`);
  }

  // Current database value
  const dbValue = 'YXZ6Yo4fG/QgkNAp9UQUqg==';
  console.log(`\nDatabase MPIN value: ${dbValue}`);
  console.log(`Does "1234" match database? ${await encrypt('1234') === dbValue ? 'YES' : 'NO'}`);
}

testEncryption();