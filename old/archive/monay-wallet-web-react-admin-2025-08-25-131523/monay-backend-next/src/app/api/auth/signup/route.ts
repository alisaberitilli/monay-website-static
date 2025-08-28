import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { hashPassword, generateToken, generateRefreshToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { signupSchema } from '@/validators/auth.validator';
import uniqid from 'uniqid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.validationError(validationResult.error.errors);
    }
    
    const data = validationResult.data;
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.mobile ? [{ mobile: data.mobile }] : [])
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.email === data.email) {
        return ApiResponseBuilder.error('Email already exists', 409);
      }
      if (existingUser.mobile === data.mobile) {
        return ApiResponseBuilder.error('Mobile number already exists', 409);
      }
    }
    
    const hashedPassword = await hashPassword(data.password);
    const referralCode = uniqid.time().toUpperCase();
    
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        password: hashedPassword,
        accountType: data.accountType,
        referralCode,
        referredBy: data.referralCode,
        isEmailVerified: false,
        isMobileVerified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        accountType: true,
        referralCode: true,
        isEmailVerified: true,
        isMobileVerified: true,
        createdAt: true,
      }
    });
    
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });
    
    await prisma.userToken.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        type: 'access',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'signup',
        description: 'User account created',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    });
    
    return ApiResponseBuilder.created({
      user,
      accessToken,
      refreshToken,
    }, 'Account created successfully. Please verify your email and mobile number.');
    
  } catch (error) {
    console.error('Signup error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}