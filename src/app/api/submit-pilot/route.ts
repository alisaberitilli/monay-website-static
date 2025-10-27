import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const pilotData = await request.json();

    // Validate required fields
    const requiredFields = ['email', 'companyType', 'tokenVolume', 'timeline'];
    for (const field of requiredFields) {
      if (!pilotData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(pilotData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Here you would typically:
    // 1. Store the application in your database
    // 2. Send notification emails to your team
    // 3. Create follow-up tasks
    // 4. Integrate with your CRM system

    // For now, we'll just log the application and send a notification
    console.log('New Pilot Program Application:', {
      email: pilotData.email,
      companyType: pilotData.companyType,
      tokenVolume: pilotData.tokenVolume,
      technicalRequirements: pilotData.technicalRequirements,
      timeline: pilotData.timeline,
      submittedAt: new Date().toISOString()
    });

    // Send notification email to your team (you can customize this)
    try {
      // You can integrate with your existing email service here
      // For example, using the existing contact-sales API or a new email service
      console.log('Sending notification email for new pilot application');
      
      // TODO: Implement email notification to your team
      // This could be:
      // - Email to ali@monay.com
      // - Slack notification
      // - CRM integration
      // - Project management tool integration
      
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the application submission if email fails
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Pilot program application submitted successfully',
        applicationId: `PILOT-${Date.now()}`, // Generate a unique ID
        submittedAt: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error submitting pilot application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
