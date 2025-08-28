import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      // phone, // Removed unused variable
      meetingType,
      date,
      time,
      duration,
      notes,
      organizer
    } = body;

    // Validate required fields
    if (!name || !email || !company || !date || !time || !organizer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Teams meeting using Microsoft Graph API
    // Note: This requires proper authentication and Microsoft Graph permissions
    /* const meetingData = {
      subject: `Monay Platform Demo - ${company}`,
      start: {
        dateTime: new Date(`${date.split('T')[0]}T${time}:00`).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(`${date.split('T')[0]}T${time}:00`).toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        {
          emailAddress: {
            address: email,
            name: name
          },
          type: 'required'
        }
      ],
      body: {
        contentType: 'HTML',
        content: `
          <h2>Monay Platform Demo Meeting</h2>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Meeting Type:</strong> ${meetingType}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p><strong>Organizer:</strong> ${organizer}</p>
          <br>
          <p>This meeting will be conducted via Microsoft Teams. You will receive a meeting link shortly.</p>
        `
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness'
    }; */

    // In a real implementation, you would:
    // 1. Authenticate with Microsoft Graph API
    // 2. Create the meeting using POST /me/events
    // 3. Store the meeting details in your database
    // 4. Send confirmation emails
    
    // For now, we'll simulate a successful response
    const mockMeetingId = `meeting_${Date.now()}`;
    const mockTeamsLink = `https://teams.microsoft.com/l/meetup-join/19:${mockMeetingId}@thread.v2/0?context={"Tid":"tenant-id","Oid":"user-id"}`;

    // Store meeting in your system (database, CRM, etc.)
    // const meetingRecord = {
    //   id: mockMeetingId,
    //   ...meetingData,
    //   teamsLink: mockTeamsLink,
    //   status: 'scheduled',
    //   createdAt: new Date().toISOString()
    // };

    // Send confirmation email (implement your email service)
    // await sendConfirmationEmail(meetingRecord);

    return NextResponse.json({
      success: true,
      meetingId: mockMeetingId,
      teamsLink: mockTeamsLink,
      message: 'Meeting scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    return NextResponse.json(
      { error: 'Failed to schedule meeting' },
      { status: 500 }
    );
  }
}
