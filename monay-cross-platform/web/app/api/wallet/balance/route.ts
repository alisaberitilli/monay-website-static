import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

// Proxy GET requests to monay-backend for wallet balance
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('authorization');
    
    // Try both home endpoint and wallet endpoint to get balance
    let balanceData: { balance: number; currency: string; status: string; lastUpdated?: string } = {
      balance: 0,
      currency: 'USD',
      status: 'active'
    };
    
    try {
      // First try the wallet endpoint
      const walletUrl = `${API_CONFIG.BASE_URL}/api/user/wallet?${searchParams.toString()}`;
      const walletResponse = await fetch(walletUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader })
        }
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        balanceData.balance = walletData.data?.balance || walletData.data?.walletBalance || 0;
      }
    } catch (error) {
      console.log('Wallet endpoint failed, trying home endpoint');
    }
    
    // Fallback to home endpoint if wallet didn't work
    if (balanceData.balance === 0) {
      try {
        const homeUrl = `${API_CONFIG.BASE_URL}/api/home?${searchParams.toString()}`;
        const homeResponse = await fetch(homeUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { 'Authorization': authHeader })
          }
        });
        
        if (homeResponse.ok) {
          const homeData = await homeResponse.json();
          balanceData.balance = homeData.data?.balance || homeData.data?.walletBalance || 0;
        }
      } catch (error) {
        console.log('Home endpoint also failed');
      }
    }
    
    // Remove mock data - return actual balance from backend
    // Real balance should come from the database via backend API
    
    // Final enrichment of balance data
    balanceData = {
      ...balanceData,
      currency: 'USD',
      status: 'active',
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(balanceData);
    
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}