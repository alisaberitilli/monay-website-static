import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(['all', 'sent', 'received']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    const validationResult = querySchema.safeParse(searchParams);
    if (!validationResult.success) {
      return ApiResponseBuilder.validationError(validationResult.error.errors);
    }
    
    const { page, limit, type, status, startDate, endDate } = validationResult.data;
    const skip = (page - 1) * limit;
    
    const where: any = {
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    };
    
    if (type === 'sent') {
      where.senderId = user.id;
      delete where.OR;
    } else if (type === 'received') {
      where.receiverId = user.id;
      delete where.OR;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);
    
    return ApiResponseBuilder.success({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return ApiResponseBuilder.unauthorized(error.message);
    }
    return ApiResponseBuilder.serverError(error as Error);
  }
}

const createTransactionSchema = z.object({
  receiverId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  paymentMethod: z.enum(['wallet', 'card', 'bank']).default('wallet'),
  mpin: z.string().length(4),
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const body = await request.json();
    
    const validationResult = createTransactionSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.validationError(validationResult.error.errors);
    }
    
    const data = validationResult.data;
    
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        walletBalance: true,
        mpin: true,
      }
    });
    
    if (!sender) {
      return ApiResponseBuilder.notFound('Sender not found');
    }
    
    if (!sender.mpin || sender.mpin !== data.mpin) {
      return ApiResponseBuilder.error('Invalid MPIN', 401);
    }
    
    if (sender.walletBalance < data.amount) {
      return ApiResponseBuilder.error('Insufficient balance', 400);
    }
    
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId },
      select: { id: true }
    });
    
    if (!receiver) {
      return ApiResponseBuilder.notFound('Receiver not found');
    }
    
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const transaction = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            decrement: data.amount
          }
        }
      });
      
      await tx.user.update({
        where: { id: data.receiverId },
        data: {
          walletBalance: {
            increment: data.amount
          }
        }
      });
      
      return await tx.transaction.create({
        data: {
          transactionId,
          senderId: user.id,
          receiverId: data.receiverId,
          type: 'send',
          amount: data.amount,
          currency: data.currency,
          status: 'completed',
          paymentMethod: data.paymentMethod,
          description: data.description,
          processedAt: new Date(),
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });
    });
    
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Payment Sent',
          message: `You sent $${data.amount} to ${transaction.receiver?.firstName} ${transaction.receiver?.lastName}`,
          type: 'transaction',
          data: { transactionId: transaction.id }
        }
      }),
      prisma.notification.create({
        data: {
          userId: data.receiverId,
          title: 'Payment Received',
          message: `You received $${data.amount} from ${transaction.sender?.firstName} ${transaction.sender?.lastName}`,
          type: 'transaction',
          data: { transactionId: transaction.id }
        }
      })
    ]);
    
    return ApiResponseBuilder.created(transaction, 'Transaction completed successfully');
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return ApiResponseBuilder.unauthorized(error.message);
    }
    return ApiResponseBuilder.serverError(error as Error);
  }
}