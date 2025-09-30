import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For demo purposes, return a success response
    // In production, this would integrate with Stripe API
    return NextResponse.json({
      success: true,
      clientSecret: `pi_demo_${Date.now()}_secret`,
      transactionId: `stripe_${Date.now()}`,
      amount: body.amount,
      status: 'completed',
      message: 'Stripe payment intent created successfully (Demo)'
    });

  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating Stripe payment intent'
      },
      { status: 500 }
    );
  }
}