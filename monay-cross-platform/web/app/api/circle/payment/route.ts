import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For demo purposes, return a success response
    // In production, this would integrate with Circle API
    return NextResponse.json({
      success: true,
      transactionId: `circle_${Date.now()}`,
      amount: body.amount,
      newBalance: 2547.83 + parseFloat(body.amount),
      status: 'completed',
      message: 'Circle USDC payment completed successfully (Demo)'
    });

  } catch (error) {
    console.error('Circle payment error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your Circle payment'
      },
      { status: 500 }
    );
  }
}