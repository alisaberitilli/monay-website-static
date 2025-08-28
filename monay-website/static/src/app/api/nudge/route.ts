import { NextRequest, NextResponse } from 'next/server';
import { NUDGE_CONFIG } from '@/lib/nudge-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formType, data } = body;

    // Validate required fields
    if (!formType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: formType and data' },
        { status: 400 }
      );
    }

    // Prepare Nudge payload based on form type
    let nudgePayload;
    let nudgeEndpoint;

    switch (formType) {
      case 'signup':
        nudgeEndpoint = NUDGE_CONFIG.ENDPOINTS.CONTACTS;
        nudgePayload = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          country: data.country,
          source: NUDGE_CONFIG.SOURCES.WEBSITE_SIGNUP,
          tags: NUDGE_CONFIG.TAGS.WEBSITE_SIGNUP,
          customFields: {
            password: data.password, // Note: In production, this should be handled securely
            confirmPassword: data.confirmPassword
          }
        };
        break;

      case 'contact-sales':
        nudgeEndpoint = NUDGE_CONFIG.ENDPOINTS.CONTACTS;
        nudgePayload = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          country: data.country,
          source: NUDGE_CONFIG.SOURCES.WEBSITE_CONTACT,
          tags: NUDGE_CONFIG.TAGS.WEBSITE_CONTACT,
          customFields: {
            message: data.message || 'Contact sales request'
          }
        };
        break;

      case 'schedule-meeting':
        nudgeEndpoint = NUDGE_CONFIG.ENDPOINTS.CONTACTS;
        nudgePayload = {
          email: data.email,
          firstName: data.name.split(' ')[0] || data.name,
          lastName: data.name.split(' ').slice(1).join(' ') || '',
          company: data.company,
          phone: data.phone,
          source: NUDGE_CONFIG.SOURCES.WEBSITE_SCHEDULER,
          tags: NUDGE_CONFIG.TAGS.WEBSITE_SCHEDULER,
          customFields: {
            meetingType: data.meetingType,
            meetingDate: data.date,
            meetingTime: data.time,
            notes: data.notes,
            organizer: data.organizer,
            subject: data.subject
          }
        };
        break;

      case 'pilot-program':
        nudgeEndpoint = NUDGE_CONFIG.ENDPOINTS.CONTACTS;
        nudgePayload = {
          email: data.email,
          company: data.companyType,
          source: NUDGE_CONFIG.SOURCES.WEBSITE_PILOT,
          tags: NUDGE_CONFIG.TAGS.WEBSITE_PILOT,
          customFields: {
            companyType: data.companyType,
            tokenVolume: data.tokenVolume,
            technicalRequirements: data.technicalRequirements.join(', '),
            timeline: data.timeline,
            emailVerified: true
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid form type' },
          { status: 400 }
        );
    }

    // Read API key from environment
    const apiKey = process.env.NUDGE_API_KEY;
    if (!apiKey) {
      throw new Error('NUDGE_API_KEY is not configured');
    }

    // Send data to Nudge
    const nudgeResponse = await fetch(nudgeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'X-API-Version': NUDGE_CONFIG.API_VERSION
      },
      body: JSON.stringify(nudgePayload)
    });

    if (!nudgeResponse.ok) {
      const errorData = await nudgeResponse.text();
      console.error('Nudge API error:', errorData);
      throw new Error(`Nudge API error: ${nudgeResponse.status} ${nudgeResponse.statusText}`);
    }

    const nudgeResult = await nudgeResponse.json();

    // Log successful submission
    console.log(`Successfully submitted ${formType} to Nudge:`, {
      formType,
      email: data.email,
      nudgeId: nudgeResult.id || nudgeResult.contactId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `${formType} submitted successfully to Nudge`,
      nudgeId: nudgeResult.id || nudgeResult.contactId,
      formType
    });

  } catch (error) {
    console.error('Error submitting to Nudge:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit to Nudge',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
