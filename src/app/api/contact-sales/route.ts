import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      company,
      country,
      to,
      subject,
      message
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !company || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = {
      to: to || 'ali@monay.com',
      subject: subject || 'New Sales Contact Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Sales Contact Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .contact-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Sales Contact Request</h1>
              <p>A potential client has requested to be contacted by your sales team</p>
            </div>
            
            <div class="content">
              <h2>Contact Information</h2>
              
              <div class="contact-details">
                <h3>👤 Personal Details</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Country:</strong> ${country}</p>
              </div>
              
              <p><strong>Message:</strong> ${message}</p>
              
              <p>This contact request was submitted through the Monay website contact sales form. Please follow up with the potential client to discuss their specific needs and how Monay can help them.</p>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Send a personalized response within 24 hours</li>
                <li>Schedule a discovery call to understand their requirements</li>
                <li>Provide relevant information about Monay's services</li>
                <li>Follow up with additional resources or demos as needed</li>
              </ul>
              
              <p>Best regards,<br>
              <strong>Monay Website Contact System</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from the Monay website contact form.</p>
              <p>© 2024 MONAY. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Sales Contact Request

A potential client has requested to be contacted by your sales team.

Contact Information:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Company: ${company}
- Country: ${country}

Message: ${message}

This contact request was submitted through the Monay website contact sales form. Please follow up with the potential client to discuss their specific needs and how Monay can help them.

Next Steps:
1. Send a personalized response within 24 hours
2. Schedule a discovery call to understand their requirements
3. Provide relevant information about Monay's services
4. Follow up with additional resources or demos as needed

Best regards,
Monay Website Contact System

---
This is an automated notification from the Monay website contact form.
© 2024 MONAY. All rights reserved.
      `
    };

    // In a real implementation, you would:
    // 1. Use an email service like SendGrid, Mailgun, or AWS SES
    // 2. Configure proper email templates
    // 3. Handle email delivery status and retries
    // 4. Store contact requests in your CRM or database
    
    // For now, we'll simulate a successful email send
    console.log('Contact form email would be sent to:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Contact details:', { firstName, lastName, email, company, country });
    
    // Simulate email service delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store contact request (implement your storage solution)
    const contactRecord = {
      id: `contact_${Date.now()}`,
      ...body,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Contact request submitted successfully',
      contactId: contactRecord.id
    });

  } catch (error) {
    console.error('Error submitting contact request:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact request' },
      { status: 500 }
    );
  }
}
