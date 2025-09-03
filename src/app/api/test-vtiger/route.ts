import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    console.log('=== VTIGER API TEST ===');
    console.log('Received form data:', formData);
    
    // Test Vtiger connection
    const vtigerUrl = process.env.VTIGER_URL || 'http://localhost:8000';
    const username = process.env.VTIGER_USERNAME || 'admin';
    const accessKey = process.env.VTIGER_ACCESS_KEY || 'crsogur4p4yvzyur';
    
    console.log('Vtiger URL:', vtigerUrl);
    console.log('Username:', username);
    
    // Step 1: Get challenge
    const challengeResponse = await fetch(
      `${vtigerUrl}/webservice.php?operation=getchallenge&username=${username}`
    );
    const challengeData = await challengeResponse.json();
    
    if (!challengeData.success) {
      throw new Error('Failed to get challenge: ' + JSON.stringify(challengeData));
    }
    
    const token = challengeData.result.token;
    console.log('Got token:', token);
    
    // Step 2: Login
    const crypto = require('crypto');
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
    console.log('Logged in with session:', sessionId);
    
    // Step 3: Create lead with form data
    const leadData = {
      firstname: formData.firstName || 'Unknown',
      lastname: formData.lastName || 'Unknown',
      email: formData.email || '',
      phone: formData.phone || '',
      company: formData.company || 'Unknown Company',
      leadstatus: 'New',
      leadsource: 'Website - ' + (formData.formType || 'Unknown Form'),
      description: formData.message || 'No message provided',
      assigned_user_id: userId,
      // Required custom fields
      cf_913: '1',
      cf_915: '0',
      cf_917: '0',
      cf_919: '0'
    };
    
    console.log('Creating lead with data:', leadData);
    
    const createParams = new URLSearchParams();
    createParams.append('operation', 'create');
    createParams.append('sessionName', sessionId);
    createParams.append('element', JSON.stringify(leadData));
    createParams.append('elementType', 'Leads');
    
    const createResponse = await fetch(`${vtigerUrl}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createParams.toString()
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success) {
      throw new Error('Failed to create lead: ' + JSON.stringify(createData));
    }
    
    console.log('Lead created successfully:', createData.result);
    
    return NextResponse.json({
      success: true,
      leadId: createData.result.id,
      leadNo: createData.result.lead_no,
      data: createData.result
    });
    
  } catch (error) {
    console.error('Error in Vtiger API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}