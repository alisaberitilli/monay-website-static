import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db-service';

// GET /api/analytics/spending - Get spending analytics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'user123';
    const days = parseInt(searchParams.get('days') || '30');
    
    // Get user's wallet
    const wallet = await DatabaseService.getWalletByUserId(userId);
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }
    
    // Get spending by category
    const spendingByCategory = await DatabaseService.getSpendingByCategory(wallet.id, days);
    
    // Get transaction summary
    const summary = await DatabaseService.getTransactionSummary(wallet.id);
    
    // Calculate total spending
    const totalSpending = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
    
    // Format spending data for frontend
    const categories = Object.entries(spendingByCategory).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
    }));
    
    return NextResponse.json({
      categories,
      totalSpending,
      summary,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      },
      mode: 'mock'
    });
  } catch (error) {
    console.error('Error fetching spending analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending analytics' },
      { status: 500 }
    );
  }
}