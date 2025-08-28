import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponseBuilder.unauthorized('No valid token provided');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return ApiResponseBuilder.unauthorized('Invalid token');
    }

    // Fetch all roles
    const roles = await prisma.role.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return ApiResponseBuilder.success(roles, 'Roles fetched successfully');
  } catch (error) {
    console.error('Fetch roles error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}