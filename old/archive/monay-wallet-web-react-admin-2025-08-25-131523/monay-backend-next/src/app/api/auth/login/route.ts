import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { verifyPassword, generateToken, generateRefreshToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { loginSchema } from '@/validators/auth.validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.validationError(validationResult.error.errors);
    }
    
    const { email, password } = validationResult.data;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user) {
      return ApiResponseBuilder.unauthorized('Invalid email or password');
    }
    
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return ApiResponseBuilder.unauthorized('Invalid email or password');
    }
    
    if (!user.isActive) {
      return ApiResponseBuilder.forbidden('Your account is inactive. Please contact support.');
    }
    
    if (user.isBlocked) {
      return ApiResponseBuilder.forbidden(`Your account has been blocked. ${user.blockedReason || 'Please contact support.'}`);
    }
    
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userRoles[0]?.role.name || 'user',
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      userType: user.userRoles[0]?.role.name || 'user',
    });
    
    await prisma.userToken.deleteMany({
      where: {
        userId: user.id,
        type: 'access'
      }
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
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'login',
        description: 'User logged in',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    });
    
    const { password: _, ...userWithoutPassword } = user;
    
    return ApiResponseBuilder.success({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }, 'Login successful');
    
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}