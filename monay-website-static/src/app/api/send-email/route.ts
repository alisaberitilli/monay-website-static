import { NextRequest, NextResponse } from 'next/server';
import { sendToVtiger } from '@/lib/vtiger-integration';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Format the email content
    const emailContent = formatEmailContent(data);
    
    // For now, we'll log the data. In production, you would integrate with an email service
    // like SendGrid, AWS SES, or Nodemailer
    console.log('Form submission received for ali@monay.com:');
    console.log('=====================================');
    console.log(emailContent);
    console.log('=====================================');
    
    // Send to Vtiger CRM (runs in parallel with email)
    const vtigerPromise = sendToVtiger(data, data.formType || 'Form Submission');
    
    // In production, you would send the actual email here:
    // await sendEmail({
    //   to: 'ali@monay.com',
    //   subject: `New ${data.formType || 'Form'} Submission`,
    //   html: emailContent
    // });
    
    // Wait for Vtiger integration to complete (but don't fail if it errors)
    await vtigerPromise.catch(error => {
      console.error('Vtiger integration failed:', error);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process form submission' },
      { status: 500 }
    );
  }
}

function formatEmailContent(data: any): string {
  const { formType, ...formData } = data;
  
  let html = `
    <h2>New ${formType || 'Form'} Submission</h2>
    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <h3>Form Details:</h3>
    <table style="border-collapse: collapse; width: 100%;">
  `;
  
  Object.entries(formData).forEach(([key, value]) => {
    const formattedKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    html += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">
          ${formattedKey}:
        </td>
        <td style="padding: 8px; border: 1px solid #ddd;">
          ${value || 'Not provided'}
        </td>
      </tr>
    `;
  });
  
  html += `
    </table>
    <hr>
    <p style="color: #666; font-size: 12px;">
      This email was automatically generated from the Monay website form submission.
    </p>
  `;
  
  return html;
}