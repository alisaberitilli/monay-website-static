import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

// Proxy GET requests to monay-backend
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Build backend URL
    const backendUrl = `${API_CONFIG.BASE_URL}/api/user/transaction?${searchParams.toString()}`;
    
    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch transactions' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Transaction proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// Proxy POST requests to monay-backend (for transaction export)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // For export functionality, we'll handle this locally since backend might not have export endpoint
    // If backend has export endpoint, change this URL accordingly
    const backendUrl = `${API_CONFIG.BASE_URL}/api/user/transaction`;
    
    // Get all transactions first
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch transactions for export' },
        { status: response.status }
      );
    }
    
    let transactions = data.data || data.transactions || [];
    const { format = 'csv', dateRange } = body;
    
    // Apply date range if specified
    if (dateRange && transactions.length > 0) {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      transactions = transactions.filter((t: any) => 
        new Date(t.createdAt || t.created_at) >= startDate
      );
    }
    
    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Time', 'Description', 'Type', 'Amount', 'Status', 'Payment Method', 'Note'];
      const rows = transactions.map((t: any) => [
        new Date(t.createdAt || t.created_at).toLocaleDateString(),
        new Date(t.createdAt || t.created_at).toLocaleTimeString(),
        t.description || t.note || '',
        (t.amount || t.transactionAmount) > 0 ? 'Income' : 'Expense',
        Math.abs(t.amount || t.transactionAmount || 0).toFixed(2),
        t.status || 'completed',
        t.paymentMethod || 'Monay Balance',
        t.note || t.description || ''
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
      ].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Return JSON format
    return NextResponse.json({
      transactions,
      count: transactions.length,
      exportDate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Export transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}