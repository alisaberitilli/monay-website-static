import crypto from 'crypto';
import pg from 'pg';
const { Client } = pg;

// Encryption function (matching the backend service)
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

// Setup test MPIN for demo
async function setupTestMpin() {
  const client = new Client({
    user: 'alisaberi',
    host: 'localhost',
    database: 'monay',
    port: 5432,
  });

  try {
    await client.connect();

    // Encrypt MPIN "1234"
    const encryptedMpin = await encrypt('1234');
    console.log('Encrypted MPIN for "1234":', encryptedMpin);

    // Update the first test user with this MPIN
    const updateQuery = `
      UPDATE users
      SET mpin = $1
      WHERE email = 'test@monay.com'
      RETURNING id, email, first_name, last_name;
    `;

    const result = await client.query(updateQuery, [encryptedMpin]);

    if (result.rows.length > 0) {
      console.log('Updated user:', result.rows[0]);
      console.log('✅ Test user now has MPIN "1234" for demo purposes');
    } else {
      console.log('❌ No user found with email test@monay.com');
    }

  } catch (error) {
    console.error('Error setting up test MPIN:', error);
  } finally {
    await client.end();
  }
}

setupTestMpin();