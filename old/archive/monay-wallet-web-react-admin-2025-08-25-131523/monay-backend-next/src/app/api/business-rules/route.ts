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

    // Check if user has business rules read permission
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return ApiResponseBuilder.unauthorized('User not found');
    }

    const hasPermission = await prisma.rolePermission.findFirst({
      where: {
        role: user.role,
        permission: 'business_rules_management',
        resource: 'business_rules',
        action: { in: ['read', 'write'] }
      }
    });

    if (!hasPermission) {
      return ApiResponseBuilder.forbidden('Insufficient permissions to access business rules');
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // For now, return mock data since we haven't implemented the full schema yet
    const mockBusinessRules = [
      {
        id: '1',
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
      },
      {
        id: '2',
        name: 'Daily Spend Limit for Basic Users',
        description: 'Basic tier users limited to $1,000 daily spending',
        category: 'SPEND_MANAGEMENT',
        priority: 90,
        isActive: true,
        conditions: [
          { id: '1', field: 'user_tier', operator: 'equals', value: 'basic' },
          { id: '2', field: 'daily_spent', operator: 'greaterThan', value: 1000, logicOperator: 'AND' }
        ],
        actions: [
          { id: '1', type: 'setLimit', parameters: { type: 'daily', amount: 1000 } }
        ],
        assignedUsers: 892,
        violations: 45,
        createdAt: '2024-08-15T09:00:00Z',
        lastModified: '2024-08-22T14:20:00Z'
      },
      {
        id: '3',
        name: 'Geographic Restriction - Sanctioned Countries',
        description: 'Block transactions from sanctioned jurisdictions',
        category: 'GEOGRAPHIC_RESTRICTIONS',
        priority: 200,
        isActive: true,
        conditions: [
          { id: '1', field: 'user_country', operator: 'in', value: ['IR', 'KP', 'SY'] }
        ],
        actions: [
          { id: '1', type: 'block', parameters: { message: 'Transactions not permitted from this jurisdiction' } },
          { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'Blocked transaction from sanctioned country' } }
        ],
        assignedUsers: 0,
        violations: 3,
        createdAt: '2024-08-10T08:00:00Z',
        lastModified: '2024-08-20T11:45:00Z'
      }
    ];

    return ApiResponseBuilder.success(mockBusinessRules, 'Business rules fetched successfully');
  } catch (error) {
    console.error('Fetch business rules error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}

export async function POST(request: NextRequest) {
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
      return ApiResponseBuilder.forbidden('Insufficient permissions to create business rules');
    }

    const body = await request.json();
    const { name, description, category, priority, conditions, actions } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return ApiResponseBuilder.badRequest('Name, description, and category are required');
    }

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return ApiResponseBuilder.badRequest('At least one condition is required');
    }

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return ApiResponseBuilder.badRequest('At least one action is required');
    }

    // Validate conditions
    for (const condition of conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        return ApiResponseBuilder.badRequest('Each condition must have field, operator, and value');
      }
    }

    // Validate actions
    for (const action of actions) {
      if (!action.type) {
        return ApiResponseBuilder.badRequest('Each action must have a type');
      }
    }

    // Create new business rule (mock implementation)
    const newRule = {
      id: Date.now().toString(),
      name,
      description,
      category,
      priority: priority || 100,
      isActive: true,
      conditions: conditions.map((c: any, index: number) => ({
        ...c,
        id: `${Date.now()}_${index}`
      })),
      actions: actions.map((a: any, index: number) => ({
        ...a,
        id: `${Date.now()}_${index}`,
        parameters: a.parameters || {}
      })),
      assignedUsers: 0,
      violations: 0,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: decoded.userId
    };

    // In a real implementation, you would save to database:
    // const savedRule = await prisma.businessRule.create({
    //   data: {
    //     name,
    //     description,
    //     category,
    //     priority: priority || 100,
    //     isActive: true,
    //     conditions,
    //     actions,
    //     createdBy: decoded.userId
    //   }
    // });

    return ApiResponseBuilder.success(newRule, 'Business rule created successfully');
  } catch (error) {
    console.error('Create business rule error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, name, description, category, priority, conditions, actions, isActive } = body;

    if (!id) {
      return ApiResponseBuilder.badRequest('Rule ID is required');
    }

    // Mock update implementation
    const updatedRule = {
      id,
      name,
      description,
      category,
      priority: priority || 100,
      isActive: isActive !== undefined ? isActive : true,
      conditions: conditions?.map((c: any, index: number) => ({
        ...c,
        id: c.id || `${Date.now()}_${index}`
      })) || [],
      actions: actions?.map((a: any, index: number) => ({
        ...a,
        id: a.id || `${Date.now()}_${index}`,
        parameters: a.parameters || {}
      })) || [],
      assignedUsers: 0, // This would be calculated from database
      violations: 0, // This would be calculated from database
      createdAt: new Date().toISOString(), // Would be preserved from original
      lastModified: new Date().toISOString(),
      updatedBy: decoded.userId
    };

    return ApiResponseBuilder.success(updatedRule, 'Business rule updated successfully');
  } catch (error) {
    console.error('Update business rule error:', error);
    return ApiResponseBuilder.serverError(error as Error);
  }
}