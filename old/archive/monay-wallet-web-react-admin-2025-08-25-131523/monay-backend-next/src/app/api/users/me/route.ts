import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateUser(request);
    
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        walletBalance: true,
        profileImage: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        isEmailVerified: true,
        isMobileVerified: true,
        isKycVerified: true,
        accountType: true,
        referralCode: true,
        qrCode: true,
        twoFactorEnabled: true,
        createdAt: true,
        userKyc: {
          select: {
            status: true,
            documentType: true,
            verifiedAt: true,
          }
        },
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
                displayName: true,
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return ApiResponseBuilder.notFound('User not found');
    }
    
    return ApiResponseBuilder.success(user, 'User profile retrieved successfully');
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return ApiResponseBuilder.unauthorized(error.message);
    }
    return ApiResponseBuilder.serverError(error as Error);
  }
}