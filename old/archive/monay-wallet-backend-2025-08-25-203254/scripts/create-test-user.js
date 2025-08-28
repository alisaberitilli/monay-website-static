import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Update or create test user
    const user = await prisma.users.upsert({
      where: { email: 'demo@monay.com' },
      update: {
        mobile: '+15551234567',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        isEmailVerified: true,
        isMobileVerified: true,
        isKycVerified: true,
        isActive: true,
        isBlocked: false,
        isDeleted: false,
      },
      create: {
        id: 'test-user-123',
        email: 'demo@monay.com',
        mobile: '+15551234567',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        walletBalance: 1000,
        isEmailVerified: true,
        isMobileVerified: true,
        isKycVerified: true,
        isActive: true,
        isBlocked: false,
        isDeleted: false,
        accountType: 'personal',
        role: 'user',
      },
    });
    
    console.log('Test user created/updated successfully:');
    console.log('Email: demo@monay.com');
    console.log('Mobile: +15551234567');
    console.log('Password: demo123');
    console.log('User ID:', user.id);
    
    // Also update Jane Smith as backup test user
    const jane = await prisma.users.update({
      where: { email: 'jane.smith@example.com' },
      data: {
        mobile: '+15551234567',
        password: hashedPassword,
        isEmailVerified: true,
        isMobileVerified: true,
        isActive: true,
        isBlocked: false,
        isDeleted: false,
      },
    });
    
    console.log('\nBackup test user updated:');
    console.log('Email: jane.smith@example.com');
    console.log('Mobile: +15551234567');
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();