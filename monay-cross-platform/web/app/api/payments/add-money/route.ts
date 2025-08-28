import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

// TilliPay API Configuration
const TILLIPAY_API_URL = process.env.TILLIPAY_API_URL || 'https://api.tillipay.com';
const TILLIPAY_API_KEY = process.env.TILLIPAY_API_KEY || '';
const TILLIPAY_MERCHANT_ID = process.env.TILLIPAY_MERCHANT_ID || '';

interface AddMoneyRequest {
  amount: number;
  paymentMethodId: string;
  cardDetails?: {
    cardNumber?: string;
    last4?: string;
    brand?: string;
  };
  userId: string;
}

interface TilliPayTransaction {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  timestamp: string;
  message?: string;
}

// Proxy POST requests to monay-backend for adding money
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Map frontend data to backend format
    const backendData = {
      amount: body.amount,
      mpin: body.mpin || body.pin,
      // Add card-specific or bank-specific data based on payment method
      ...(body.paymentMethodId === 'card' && {
        cardId: body.cardId,
        cardNumber: body.cardDetails?.cardNumber,
        cvv: body.cardDetails?.cvv,
        expiryDate: body.cardDetails?.expiryDate
      }),
      ...(body.paymentMethodId === 'bank' && {
        accountId: body.accountId,
        routingNumber: body.bankDetails?.routingNumber,
        accountNumber: body.bankDetails?.accountNumber
      })
    };
    
    // Choose endpoint based on payment method
    let backendEndpoint;
    if (body.paymentMethodId === 'card' || body.paymentMethod === 'card') {
      backendEndpoint = '/api/user/add-money/card';
    } else if (body.paymentMethodId === 'bank' || body.paymentMethod === 'bank') {
      backendEndpoint = '/api/user/add-money/bank';
    } else {
      backendEndpoint = '/api/user/add-money/card'; // Default to card
    }
    
    const backendUrl = `${API_CONFIG.BASE_URL}${backendEndpoint}`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(backendData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to add money' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      ...data
    });

    /* PRODUCTION CODE - Uncomment when TilliPay credentials are available
    
    if (!TILLIPAY_API_KEY) {
      console.error('TilliPay API key not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create transaction with TilliPay
    const tilliPayRequest = {
      merchantId: TILLIPAY_MERCHANT_ID,
      amount: body.amount,
      currency: 'USD',
      paymentMethod: body.paymentMethodId,
      description: `Add money to wallet - User ${body.userId}`,
      metadata: {
        userId: body.userId,
        type: 'wallet_topup',
        cardLast4: body.cardDetails?.last4
      }
    };

    // Call TilliPay API
    const tilliPayResponse = await fetch(`${TILLIPAY_API_URL}/v1/transactions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TILLIPAY_API_KEY}`,
        'X-Merchant-ID': TILLIPAY_MERCHANT_ID
      },
      body: JSON.stringify(tilliPayRequest)
    });

    if (!tilliPayResponse.ok) {
      const errorData = await tilliPayResponse.json().catch(() => ({}));
      console.error('TilliPay API error:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Payment processing failed',
          details: errorData.message || 'Unable to process payment at this time'
        },
        { status: tilliPayResponse.status }
      );
    }

    const tilliPayData: TilliPayTransaction = await tilliPayResponse.json();

    // Process the response based on transaction status
    if (tilliPayData.status === 'completed') {
      // Update user's wallet balance in your database
      // This is where you would update your database with the new balance
      
      return NextResponse.json({
        success: true,
        transactionId: tilliPayData.transactionId,
        amount: body.amount,
        newBalance: 2547.83 + body.amount, // Should be from database
        status: 'completed',
        message: 'Money added successfully to your wallet'
      });
    } else if (tilliPayData.status === 'pending') {
      return NextResponse.json({
        success: true,
        transactionId: tilliPayData.transactionId,
        amount: body.amount,
        status: 'pending',
        message: 'Transaction is being processed. Please wait...'
      });
    } else {
      return NextResponse.json(
        {
          error: 'Transaction failed',
          transactionId: tilliPayData.transactionId,
          message: tilliPayData.message || 'Payment could not be completed'
        },
        { status: 400 }
      );
    }
    */

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your payment'
      },
      { status: 500 }
    );
  }
}

// GET /api/payments/add-money - Check transaction status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get('transactionId');

  if (!transactionId) {
    return NextResponse.json(
      { error: 'Transaction ID required' },
      { status: 400 }
    );
  }

  try {
    // Check transaction status with TilliPay
    const response = await fetch(`${TILLIPAY_API_URL}/v1/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${TILLIPAY_API_KEY}`,
        'X-Merchant-ID': TILLIPAY_MERCHANT_ID
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transaction = await response.json();

    return NextResponse.json({
      transactionId: transaction.transactionId,
      status: transaction.status,
      amount: transaction.amount,
      timestamp: transaction.timestamp
    });

  } catch (error) {
    console.error('Error checking transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to check transaction status' },
      { status: 500 }
    );
  }
}