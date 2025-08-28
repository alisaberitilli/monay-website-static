import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
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

    const ruleId = params.id;

    // Mock data for specific rule
    const mockRule = {
      id: ruleId,
      name: 'Enhanced KYC Required for High-Value Transactions',
      description: 'Users must have enhanced KYC for transactions over $10,000',
      category: 'KYC_ELIGIBILITY',
      priority: 100,
      isActive: true,
      conditions: [
        { id: '1', field: 'transaction_amount', operator: 'greaterThan', value: 10000 },
        { id: '2', field: 'kyc_level', operator: 'lessThan', value: 'enhanced', logicOperator: 'AND' }
      ],
      actions: [
        { id: '1', type: 'block', parameters: { message: 'Enhanced KYC required for high-value transactions' } }
      ],
      assignedUsers: 247,
      violations: 12,
      createdAt: '2024-08-20T10:00:00Z',
      lastModified: '2024-08-23T15:30:00Z'
    };

    return ApiResponseBuilder.success(mockRule, 'Business rule fetched successfully');
  } catch (error) {
    console.error('Fetch business rule error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}

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
      return ApiResponseBuilder.forbidden('Insufficient permissions to update business rules');
    }

    const ruleId = params.id;
    const body = await request.json();

    // Mock update - in real implementation, update the database
    const updatedRule = {
      id: ruleId,
      ...body,
      lastModified: new Date().toISOString(),
      updatedBy: decoded.userId
    };

    return ApiResponseBuilder.success(updatedRule, 'Business rule updated successfully');
  } catch (error) {
    console.error('Update business rule error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}

export async function DELETE(
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
      return ApiResponseBuilder.forbidden('Insufficient permissions to delete business rules');
    }

    const ruleId = params.id;

    // Check if rule has active assignments (mock check)
    // In real implementation, check database for active user assignments
    const hasActiveAssignments = false; // Mock check

    if (hasActiveAssignments) {
      return ApiResponseBuilder.badRequest('Cannot delete rule with active user assignments');
    }

    // Mock deletion - in real implementation, soft delete or hard delete based on business rules
    // await prisma.businessRule.delete({ where: { id: ruleId } });

    return ApiResponseBuilder.success(null, 'Business rule deleted successfully');
  } catch (error) {
    console.error('Delete business rule error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}