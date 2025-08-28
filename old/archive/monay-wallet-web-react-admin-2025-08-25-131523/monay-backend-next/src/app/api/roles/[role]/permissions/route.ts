import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
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

    // Get permissions from role_permissions table using raw query
    const permissions = await prisma.$queryRaw`
      SELECT id::text, role, permission, resource, action 
      FROM role_permissions 
      WHERE role = ${params.role}::user_role
      ORDER BY permission
    `;

    return ApiResponseBuilder.success(permissions, 'Role permissions fetched successfully');
  } catch (error) {
    console.error('Fetch role permissions error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}