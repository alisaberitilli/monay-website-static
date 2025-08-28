import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

// GET /api/users - Get all users (admin only for now, add auth later)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const role = searchParams.get('role') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      switch (status) {
        case 'active':
          where.isActive = true;
          break;
        case 'inactive':
          where.isActive = false;
          break;
        case 'pending':
          where.isKycVerified = false;
          break;
      }
    }

    // Get users with roles
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        walletBalance: true,
        isActive: true,
        isEmailVerified: true,
        isKycVerified: true,
        lastLoginAt: true,
        createdAt: true,
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
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Get total count
    const total = await prisma.user.count({ where });

    // Return users with full role information
    const formattedUsers = users.map(user => ({
      ...user,
      userRoles: user.userRoles.map(ur => ({
        role: {
          id: ur.role.name, // Using name as ID for now
          name: ur.role.name,
          displayName: ur.role.displayName,
          description: '', // Add if needed
          permissions: {} // Add if needed
        }
      }))
    }));

    return ApiResponseBuilder.success(formattedUsers, 'Users retrieved successfully');
    
  } catch (error) {
    return ApiResponseBuilder.serverError(error as Error);
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, role = 'user', status = 'active' } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return ApiResponseBuilder.badRequest('User with this email already exists');
    }

    // Get role
    const roleRecord = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!roleRecord) {
      return ApiResponseBuilder.badRequest('Invalid role');
    }

    // Create user with default password
    const hashedPassword = await bcrypt.hash('Welcome123!', 12);
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isActive: status === 'active',
        isEmailVerified: false,
        referralCode: `USER${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userRoles: {
          create: {
            roleId: roleRecord.id,
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    const transformedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.userRoles[0]?.role.name || 'user',
      status: user.isActive ? 'active' : 'inactive',
      balance: user.walletBalance,
      lastLogin: '',
      createdAt: user.createdAt.toISOString().split('T')[0],
    };

    return ApiResponseBuilder.success(transformedUser, 'User created successfully');
    
  } catch (error) {
    return ApiResponseBuilder.serverError(error as Error);
  }
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId || userId === 'users') {
      return ApiResponseBuilder.badRequest('User ID is required');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return ApiResponseBuilder.notFound('User not found');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return ApiResponseBuilder.success(null, 'User deleted successfully');
    
  } catch (error) {
    return ApiResponseBuilder.serverError(error as Error);
  }
}