import encryptAPIs from './src/services/encrypt.js';

async function testBackendEncryption() {
  try {
    const testValues = ['1234', '123456', '0000', '9999'];

    for (const value of testValues) {
      const encrypted = await encryptAPIs.encrypt(value);
      console.log(`Backend encrypts "${value}" to: ${encrypted}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testBackendEncryption();