import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

// Proxy GET requests to monay-backend
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const authHeader = request.headers.get('authorization');
    
    // Map frontend types to backend endpoints
    let backendEndpoint;
    if (type === 'sent') {
      backendEndpoint = '/api/user/my-request';
    } else if (type === 'received') {
      backendEndpoint = '/api/user/payment/request/received';
    } else {
      backendEndpoint = '/api/user/payment/request/all';
    }
    
    const backendUrl = `${API_CONFIG.BASE_URL}${backendEndpoint}?${searchParams.toString()}`;
    
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
        { error: data.message || 'Failed to fetch payment requests' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Payment requests proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment requests' },
      { status: 500 }
    );
  }
}

// Proxy POST requests to monay-backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Map frontend data to backend format
    const backendData = {
      toUserId: body.payerId || body.toUserId,
      amount: body.amount,
      message: body.description || body.message,
      dueDate: body.dueDate,
      // Add any additional mapping as needed
    };
    
    const backendUrl = `${API_CONFIG.BASE_URL}/api/user/payment/request`;
    
    // Forward request to backend
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
        { error: data.message || 'Failed to create payment request' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Create payment request error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request' },
      { status: 500 }
    );
  }
}

// Proxy PATCH requests to monay-backend
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const { requestId, status, action } = body;
    
    // Map to backend endpoints based on action
    let backendUrl;
    let backendData;
    
    if (action === 'decline' || status === 'rejected') {
      backendUrl = `${API_CONFIG.BASE_URL}/api/payment/request/decline`;
      backendData = { requestId };
    } else if (action === 'pay' || status === 'paid') {
      backendUrl = `${API_CONFIG.BASE_URL}/api/user/payment/request/pay`;
      backendData = body; // Forward all payment data
    } else {
      return NextResponse.json(
        { error: 'Invalid action or status' },
        { status: 400 }
      );
    }
    
    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: backendUrl.includes('decline') ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(backendData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to update payment request' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Update payment request error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment request' },
      { status: 500 }
    );
  }
}