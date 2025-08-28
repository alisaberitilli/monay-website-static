import { NextRequest, NextResponse } from 'next/server';
import { userDB, PilotFormData } from '@/lib/user-db';

export async function POST(request: NextRequest) {
  try {
    const formData: PilotFormData = await request.json();

    // Validate required fields
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.mobileNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: email, firstName, lastName, mobileNumber' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate mobile number format (should be +1XXXXXXXXXX)
    const mobileRegex = /^\+1\d{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      return NextResponse.json(
        { error: 'Mobile number must be in US format (+1XXXXXXXXXX)' },
        { status: 400 }
      );
    }

    console.log('Saving user data:', {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobileNumber: formData.mobileNumber,
      companyName: formData.companyName,
      companyType: formData.companyType
    });

    // Create user in database
    const user = await userDB.createUser(formData);

    if (!user) {
      console.error('Failed to create user in database');
      return NextResponse.json(
        { error: 'Failed to save user data' },
        { status: 500 }
      );
    }

    console.log(`✅ User saved successfully with ID: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'User data saved successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        mobileNumber: user.mobile_number,
        companyName: user.company_name,
        companyType: user.company_type,
        jobTitle: user.job_title,
        industry: user.industry,
        useCase: user.use_case,
        technicalRequirements: user.technical_requirements,
        expectedVolume: user.expected_volume,
        timeline: user.timeline,
        additionalNotes: user.additional_notes,
        emailVerified: user.email_verified,
        mobileVerified: user.mobile_verified,
        verificationCompletedAt: user.verification_completed_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Error saving user data:', error);
    
    if (error instanceof Error) {
      // Check for specific database errors
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: `Server error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
