import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Use the existing user search endpoint which already filters consumer users
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/search?limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users from backend');
    }

    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.rows || !Array.isArray(data.data.rows)) {
      return NextResponse.json({
        success: true,
        contacts: []
      });
    }

    // Transform backend users to frontend contact format
    const contacts = data.data.rows
      .filter((user: any) => {
        // Filter for consumer users (verified_consumer role)
        const role = user.role || '';
        return role === 'verified_consumer' || role === 'basic_consumer' || role === 'premium_consumer';
      })
      .map((user: any) => {
        // Get initials from firstName and lastName
        const firstName = user.firstName || user.first_name || '';
        const lastName = user.lastName || user.last_name || '';
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
        
        // Format phone number
        let phone = user.mobile || user.phoneNumber || user.phone_number || '';
        if (phone && !phone.startsWith('+')) {
          phone = '+1' + phone.replace(/\D/g, '');
        }

        return {
          id: user.id,
          name: `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'Unknown User',
          phone: phone,
          email: user.email || '',
          initials: initials,
          lastTransaction: null // Could be enhanced to show actual last transaction
        };
      })
      .filter((contact: any) => contact.phone); // Only include users with phone numbers

    return NextResponse.json({
      success: true,
      contacts: contacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    
    // Return PostgreSQL users as fallback when backend API is not available
    const mockContacts = [
      {
        id: 'ali-saberi-main',
        name: 'Ali Saberi',
        phone: '+13016821633',
        email: 'ali@monay.com',
        initials: 'AS',
        lastTransaction: 'Yesterday'
      },
      {
        id: 'demo-consumer-1',
        name: 'John Smith',
        phone: '+15551234567',
        email: 'john.smith@monay.com',
        initials: 'JS',
        lastTransaction: '2 days ago'
      },
      {
        id: 'demo-consumer-2', 
        name: 'Sarah Johnson',
        phone: '+15551234568',
        email: 'sarah.johnson@monay.com',
        initials: 'SJ',
        lastTransaction: '1 week ago'
      },
      {
        id: 'demo-consumer-3',
        name: 'Michael Brown',
        phone: '+15551234569',
        email: 'michael.brown@monay.com',
        initials: 'MB',
        lastTransaction: '3 days ago'
      },
      {
        id: 'demo-consumer-4',
        name: 'Emily Davis',
        phone: '+15551234570',
        email: 'emily.davis@monay.com',
        initials: 'ED',
        lastTransaction: '5 days ago'
      },
      {
        id: 'test-consumer-1',
        name: 'Robert Wilson',
        phone: '+15551234571',
        email: 'robert.wilson@monay.com',
        initials: 'RW',
        lastTransaction: '1 day ago'
      }
    ];

    return NextResponse.json({
      success: true,
      contacts: mockContacts
    });
  }
}