/**
 * Direct client-side Vtiger integration for static hosting (cPanel)
 * This bypasses the API route and calls Vtiger directly from the browser
 * Less secure but works on static hosting
 */

import crypto from 'crypto-js';

// WARNING: These should be in environment variables, not in code
// For production, use a proxy API or server-side solution
const VTIGER_CONFIG = {
  url: process.env.NEXT_PUBLIC_VTIGER_URL || 'http://localhost:8000',
  username: process.env.NEXT_PUBLIC_VTIGER_USERNAME || 'admin',
  accessKey: process.env.NEXT_PUBLIC_VTIGER_ACCESS_KEY || 'crsogur4p4yvzyur'
};

export async function sendToVtigerDirect(formData: any, formType: string): Promise<any> {
  try {
    console.log('=== DIRECT VTIGER INTEGRATION (Client-Side) ===');
    console.log('WARNING: This is less secure than server-side integration');
    
    // Step 1: Get challenge token
    const challengeUrl = `${VTIGER_CONFIG.url}/webservice.php?operation=getchallenge&username=${VTIGER_CONFIG.username}`;
    const challengeResponse = await fetch(challengeUrl);
    const challengeData = await challengeResponse.json();
    
    if (!challengeData.success) {
      throw new Error('Failed to get challenge token');
    }
    
    const token = challengeData.result.token;
    
    // Step 2: Generate access key hash
    const accessKeyHash = crypto.MD5(token + VTIGER_CONFIG.accessKey).toString();
    
    // Step 3: Login
    const loginParams = new URLSearchParams();
    loginParams.append('operation', 'login');
    loginParams.append('username', VTIGER_CONFIG.username);
    loginParams.append('accessKey', accessKeyHash);
    
    const loginResponse = await fetch(`${VTIGER_CONFIG.url}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: loginParams
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const sessionName = loginData.result.sessionName;
    const userId = loginData.result.userId;
    
    // Step 4: Create lead
    const leadData = {
      lastname: formData.lastName || formData.lastname || 'Unknown',
      assigned_user_id: userId,
      firstname: formData.firstName || formData.firstname || '',
      company: formData.company || formData.organizationName || '',
      email: formData.email || '',
      phone: formData.phone || formData.mobileNumber || '',
      website: formData.website || '',
      description: buildDescription(formData, formType),
      leadsource: 'Website',
      leadstatus: 'Cold',
      cf_913: '1',
      cf_915: '10000',
      cf_917: '5000',
      cf_919: '5000'
    };
    
    const createParams = new URLSearchParams();
    createParams.append('operation', 'create');
    createParams.append('sessionName', sessionName);
    createParams.append('element', JSON.stringify(leadData));
    createParams.append('elementType', 'Leads');
    
    const createResponse = await fetch(`${VTIGER_CONFIG.url}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createParams
    });
    
    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Lead created successfully via direct integration');
      return {
        success: true,
        leadId: createData.result.id,
        leadNo: createData.result.lead_no,
        name: `${createData.result.firstname} ${createData.result.lastname}`,
        company: createData.result.company
      };
    } else {
      throw new Error(createData.error?.message || 'Failed to create lead');
    }
    
  } catch (error) {
    console.error('❌ Direct Vtiger integration error:', error);
    return { 
      success: false, 
      error: error.message,
      note: 'Direct client-side integration failed. Consider using server-side API for better security.'
    };
  }
}

function buildDescription(data: any, formType: string): string {
  const lines: string[] = [
    '=== FORM SUBMISSION DETAILS ===',
    `Form Type: ${formType}`,
    `Submission Date: ${new Date().toLocaleString()}`,
    `Source URL: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    '',
    '--- FORM DATA ---'
  ];
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      lines.push(`${key}: ${value}`);
    }
  });
  
  return lines.join('\n');
}