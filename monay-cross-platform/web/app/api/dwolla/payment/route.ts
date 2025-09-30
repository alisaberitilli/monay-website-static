import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For demo purposes, return a success response
    // In production, this would integrate with Dwolla API
    return NextResponse.json({
      success: true,
      transactionId: `dwolla_${Date.now()}`,
      amount: body.amount,
      newBalance: 2547.83 + parseFloat(body.amount),
      status: 'completed',
      message: 'Dwolla ACH payment completed successfully (Demo)'
    });

  } catch (error) {
    console.error('Dwolla payment error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your Dwolla payment'
      },
      { status: 500 }
    );
  }
}