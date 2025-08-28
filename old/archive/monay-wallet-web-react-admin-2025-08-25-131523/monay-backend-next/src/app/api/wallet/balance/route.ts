import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    const walletData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        walletBalance: true,
        currency: true,
      }
    });
    
    const pendingTransactions = await prisma.transaction.aggregate({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ],
        status: 'pending'
      },
      _sum: {
        amount: true
      }
    });
    
    const monthlyStats = await getMonthlyStats(user.id);
    
    return ApiResponseBuilder.success({
      balance: walletData?.walletBalance || 0,
      currency: walletData?.currency || 'USD',
      pendingAmount: pendingTransactions._sum.amount || 0,
      monthlyStats
    });
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return ApiResponseBuilder.unauthorized(error.message);
    }
    return ApiResponseBuilder.serverError(error as Error);
  }
}

async function getMonthlyStats(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [sent, received] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        senderId: userId,
        status: 'completed',
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    }),
    prisma.transaction.aggregate({
      where: {
        receiverId: userId,
        status: 'completed',
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    })
  ]);
  
  return {
    totalSent: sent._sum.amount || 0,
    totalReceived: received._sum.amount || 0,
    sentCount: sent._count,
    receivedCount: received._count
  };
}