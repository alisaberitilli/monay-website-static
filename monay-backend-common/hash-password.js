const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'Demo@123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nSQL Update Command:');
  console.log(`UPDATE users SET password = '${hash}' WHERE mobile = '+13307018398';`);
}

hashPassword().catch(console.error);