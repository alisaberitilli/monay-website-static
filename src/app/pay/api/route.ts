import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { accountNumber, firstName, lastName, amountDue, dueDate } = body;

    if (!accountNumber || !firstName || !lastName || !amountDue || !dueDate) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['accountNumber', 'firstName', 'lastName', 'amountDue', 'dueDate']
        },
        { status: 400 }
      );
    }

    // Validate amountDue is a number
    if (typeof amountDue !== 'number' || amountDue <= 0) {
      return NextResponse.json(
        { error: 'amountDue must be a positive number' },
        { status: 400 }
      );
    }

    // Build redirect URL with query parameters
    const redirectUrl = `/pay?accountNumber=${encodeURIComponent(accountNumber)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&amountDue=${amountDue}&dueDate=${encodeURIComponent(dueDate)}`;

    return NextResponse.json({
      success: true,
      redirectUrl,
      message: 'Payment request received'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format. Expected JSON body.' },
      { status: 400 }
    );
  }
}

// Handle GET requests with a helpful message
export async function GET() {
  return NextResponse.json({
    message: 'Payment Request API',
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        accountNumber: 'string',
        firstName: 'string',
        lastName: 'string',
        amountDue: 'number',
        dueDate: 'string (YYYY-MM-DD)'
      },
      example: {
        accountNumber: 'ACC-123456',
        firstName: 'John',
        lastName: 'Doe',
        amountDue: 1250,
        dueDate: '2025-12-31'
      }
    }
  });
}
