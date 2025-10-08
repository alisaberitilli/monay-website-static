import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      meetingType,
      date,
      time,
      duration,
      teamsLink,
      // organizer // Removed unused variable
    } = body;

    // Validate required fields
    if (!name || !email || !company || !date || !time || !teamsLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the meeting date and time
    const meetingDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email content
    const emailContent = {
      to: email,
      subject: `Meeting Confirmed: Monay Platform Demo - ${meetingDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meeting Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .meeting-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Meeting Confirmed!</h1>
              <p>Your Monay Platform Demo has been scheduled</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>Great news! Your meeting with <strong>Ali from Monay</strong> has been successfully scheduled.</p>
              
              <div class="meeting-details">
                <h3>📅 Meeting Details</h3>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Meeting Type:</strong> ${meetingType}</p>
                <p><strong>Date:</strong> ${meetingDate}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
                <p><strong>Platform:</strong> Microsoft Teams</p>
              </div>
              
              <p><strong>Join your meeting:</strong></p>
              <a href="${teamsLink}" class="button">Join Teams Meeting</a>
              
              <p><strong>What to expect:</strong></p>
              <ul>
                <li>Personalized walkthrough of the Monay platform</li>
                <li>Discussion of your specific use case and requirements</li>
                <li>Q&A session about Coin-as-a-Service and Wallet-as-a-Service</li>
                <li>Next steps for your pilot program</li>
              </ul>
              
              <p><strong>Preparation tips:</strong></p>
              <ul>
                <li>Test your Teams connection before the meeting</li>
                <li>Have your questions ready</li>
                <li>Consider sharing your screen if you want to show specific workflows</li>
              </ul>
              
              <p>If you need to reschedule or have any questions, please reply to this email or contact us directly.</p>
              
              <p>Looking forward to our meeting!</p>
              
              <p>Best regards,<br>
              <strong>Ali from Monay</strong><br>
              Monay Platform Specialist</p>
            </div>
            
            <div class="footer">
              <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
              <p>© 2024 MONAY. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Meeting Confirmed: Monay Platform Demo - ${meetingDate}

Hello ${name},

Great news! Your meeting with Ali from Monay has been successfully scheduled.

Meeting Details:
- Company: ${company}
- Meeting Type: ${meetingType}
- Date: ${meetingDate}
- Time: ${time}
- Duration: ${duration} minutes
- Platform: Microsoft Teams

Join your meeting: ${teamsLink}

What to expect:
- Personalized walkthrough of the Monay platform
- Discussion of your specific use case and requirements
- Q&A session about Coin-as-a-Service and Wallet-as-a-Service
- Next steps for your pilot program

Preparation tips:
- Test your Teams connection before the meeting
- Have your questions ready
- Consider sharing your screen if you want to show specific workflows

If you need to reschedule or have any questions, please reply to this email or contact us directly.

Looking forward to our meeting!

Best regards,
Ali from Monay
Monay Platform Specialist

---
This is an automated confirmation email. Please do not reply directly to this message.
© 2024 MONAY. All rights reserved.
      `
    };

    // In a real implementation, you would:
    // 1. Use an email service like SendGrid, Mailgun, or AWS SES
    // 2. Configure proper email templates
    // 3. Handle email delivery status and retries
    
    // For now, we'll simulate a successful email send
    console.log('Email would be sent to:', email);
    console.log('Subject:', emailContent.subject);
    
    // Simulate email service delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      emailId: `email_${Date.now()}`
    });

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}
