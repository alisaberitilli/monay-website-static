import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user has business rules write permission
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return ApiResponseBuilder.unauthorized('User not found');
    }

    const hasWritePermission = await prisma.rolePermission.findFirst({
      where: {
        role: user.role,
        permission: 'business_rules_management',
        resource: 'business_rules',
        action: 'write'
      }
    });

    if (!hasWritePermission) {
      return ApiResponseBuilder.forbidden('Insufficient permissions to modify business rules');
    }

    const ruleId = params.id;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return ApiResponseBuilder.badRequest('isActive must be a boolean value');
    }

    // Mock toggle implementation
    const updatedRule = {
      id: ruleId,
      isActive,
      lastModified: new Date().toISOString(),
      updatedBy: decoded.userId
    };

    // In real implementation:
    // await prisma.businessRule.update({
    //   where: { id: ruleId },
    //   data: { isActive, updatedAt: new Date() }
    // });

    const message = isActive ? 'Business rule activated successfully' : 'Business rule deactivated successfully';
    return ApiResponseBuilder.success(updatedRule, message);
  } catch (error) {
    console.error('Toggle business rule error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}