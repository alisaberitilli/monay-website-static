import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit, getFormRateLimit } from '../middleware/rate-limit';

export async function POST(request: Request) {
  console.log('=== VTIGER API ROUTE CALLED ===');
  
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request as any, getFormRateLimit('vtiger'));
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult; // Rate limit exceeded
  }
  
  try {
    const formData = await request.json();
    
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    
    // Get configuration from server-side environment variables
    const vtigerUrl = process.env.VTIGER_URL || 'http://localhost:8000';
    const username = process.env.VTIGER_USERNAME || 'admin';
    const accessKey = process.env.VTIGER_ACCESS_KEY || 'crsogur4p4yvzyur';
    
    console.log('Vtiger URL:', vtigerUrl);
    console.log('Username:', username);
    
    // Step 1: Get challenge token
    const challengeResponse = await fetch(
      `${vtigerUrl}/webservice.php?operation=getchallenge&username=${username}`
    );
    const challengeData = await challengeResponse.json();
    
    if (!challengeData.success) {
      throw new Error('Failed to get challenge: ' + JSON.stringify(challengeData));
    }
    
    const token = challengeData.result.token;
    console.log('Got challenge token');
    
    // Step 2: Login
    const generatedKey = crypto
      .createHash('md5')
      .update(token + accessKey)
      .digest('hex');
    
    const loginParams = new URLSearchParams();
    loginParams.append('operation', 'login');
    loginParams.append('username', username);
    loginParams.append('accessKey', generatedKey);
    
    const loginResponse = await fetch(`${vtigerUrl}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: loginParams.toString()
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginData));
    }
    
    const sessionId = loginData.result.sessionName;
    const userId = loginData.result.userId;
    console.log('Logged in successfully');
    
    // Build comprehensive description with ALL form data
    const buildDescription = (data: any) => {
      const lines: string[] = [
        '=== FORM SUBMISSION DETAILS ===',
        `Form Type: ${data.formType || 'Unknown'}`,
        `Submission Date: ${new Date().toLocaleString()}`,
        `Source URL: ${data.pageUrl || 'https://www.monay.com'}`,
        '',
        '--- CONTACT INFORMATION ---'
      ];
      
      // Add all form fields with proper labels
      const fieldMappings: Record<string, string> = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        mobile: 'Mobile',
        company: 'Company',
        organizationName: 'Organization Name',
        companyName: 'Company Name',
        website: 'Website',
        country: 'Country',
        city: 'City',
        state: 'State',
        street: 'Street',
        postalcode: 'Postal Code',
        zipCode: 'Zip Code',
        
        // Business fields
        monthlyActiveUsers: 'Monthly Active Users',
        useCase: 'Use Case',
        industry: 'Industry',
        role: 'Role/Title',
        jobTitle: 'Job Title',
        designation: 'Designation',
        department: 'Department',
        
        // Financial fields
        transactionVolume: 'Transaction Volume',
        monthlyTransactionVolume: 'Monthly Transaction Volume',
        budget: 'Budget',
        timeline: 'Timeline',
        
        // Message and notes
        message: 'Message/Comments',
        description: 'Description',
        notes: 'Additional Notes',
        requirements: 'Requirements',
        
        // Product interests
        interestedProducts: 'Interested Products',
        productType: 'Product Type',
        
        // Other fields
        source: 'Source',
        referrer: 'Referrer',
        campaign: 'Campaign'
      };
      
      // Add all fields to description
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'formType' && value !== null && value !== undefined && value !== '') {
          const label = fieldMappings[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          // Handle arrays (like interestedProducts)
          if (Array.isArray(value)) {
            lines.push(`${label}: ${value.join(', ')}`);
          } else {
            lines.push(`${label}: ${value}`);
          }
        }
      });
      
      lines.push('', '=== END OF SUBMISSION ===');
      
      return lines.join('\n');
    };
    
    // Step 3: Create lead with proper field mapping
    const leadData = {
      // Required fields
      lastname: formData.lastName || formData.lastname || 'Unknown',
      assigned_user_id: userId,
      
      // Required custom fields - MUST have numeric values
      cf_913: '1', // Contract Term in Years
      cf_915: '10000', // TCV - Total Contract Value  
      cf_917: '5000', // 1st Year Annual Contract Value
      cf_919: '5000', // Annual Contract Value ACV
      
      // Optional fields from form - ensure they have values and trim whitespace
      firstname: (formData.firstName || formData.firstname || '').trim(),
      email: (formData.email || '').trim(),
      mobile: (formData.phone || '').trim(), // Mobile field for Vtiger
      phone: (formData.phone || '').trim(), // Also populate phone field
      company: (formData.company || formData.organizationName || '').trim(),
      designation: (formData.role || formData.jobTitle || '').trim(),
      leadsource: `Monay Website - ${formData.formType || 'Unknown Form'}`,
      leadstatus: 'New',
      industry: formData.industry || '',
      website: formData.website || '',
      description: buildDescription(formData), // Now contains ALL form data
      
      // Address fields
      lane: formData.street || '',
      city: formData.city || '',
      state: formData.state || '',
      code: formData.postalcode || formData.zipCode || '',
      country: formData.country || ''
    };
    
    console.log('Creating lead with data:');
    console.log('- Email:', leadData.email);
    console.log('- Mobile:', leadData.mobile);
    console.log('- Phone:', leadData.phone);
    console.log('- Company:', leadData.company);
    console.log('Full lead data:', leadData);
    
    // IMPORTANT: elementType must be a separate parameter
    const createParams = new URLSearchParams();
    createParams.append('operation', 'create');
    createParams.append('sessionName', sessionId);
    createParams.append('elementType', 'Leads'); // Outside element
    createParams.append('element', JSON.stringify(leadData)); // Only lead data
    
    const createResponse = await fetch(`${vtigerUrl}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createParams.toString()
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success) {
      console.error('Failed to create lead:', createData);
      throw new Error('Failed to create lead: ' + (createData.error?.message || JSON.stringify(createData)));
    }
    
    console.log('Lead created successfully:');
    console.log('Result fields:', Object.keys(createData.result));
    console.log('Email field value:', createData.result.email);
    console.log('Mobile field value:', createData.result.mobile);
    console.log('Phone field value:', createData.result.phone);
    console.log('Company field value:', createData.result.company);
    console.log('Full result:', createData.result);
    
    // Step 4: Logout
    const logoutParams = new URLSearchParams();
    logoutParams.append('operation', 'logout');
    logoutParams.append('sessionName', sessionId);
    
    await fetch(`${vtigerUrl}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: logoutParams.toString()
    });
    
    return NextResponse.json({
      success: true,
      leadId: createData.result.id,
      leadNo: createData.result.lead_no,
      name: `${createData.result.firstname} ${createData.result.lastname}`,
      company: createData.result.company
    });
    
  } catch (error) {
    console.error('Error in Vtiger API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}