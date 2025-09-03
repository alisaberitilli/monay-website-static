const crypto = require('crypto');

// Rate limiting store
const rateLimitStore = new Map();

// Simple rate limiter
function checkRateLimit(ip) {
  const now = Date.now();
  const limit = 3; // 3 requests per minute
  const window = 60000; // 1 minute
  
  const key = `vtiger-${ip}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + window });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please wait 1 minute before submitting again.' 
    });
  }
  
  try {
    const formData = req.body;
    
    // Get Vtiger configuration from environment variables
    const VTIGER_URL = process.env.VTIGER_URL || 'http://localhost:8000';
    const VTIGER_USERNAME = process.env.VTIGER_USERNAME || 'admin';
    const VTIGER_ACCESS_KEY = process.env.VTIGER_ACCESS_KEY || 'crsogur4p4yvzyur';
    
    // Step 1: Get challenge token
    const challengeUrl = `${VTIGER_URL}/webservice.php?operation=getchallenge&username=${VTIGER_USERNAME}`;
    const challengeResponse = await fetch(challengeUrl);
    const challengeData = await challengeResponse.json();
    
    if (!challengeData.success) {
      throw new Error('Failed to get challenge token from Vtiger');
    }
    
    const token = challengeData.result.token;
    
    // Step 2: Create MD5 hash
    const accessKeyHash = crypto
      .createHash('md5')
      .update(token + VTIGER_ACCESS_KEY)
      .digest('hex');
    
    // Step 3: Login
    const loginParams = new URLSearchParams();
    loginParams.append('operation', 'login');
    loginParams.append('username', VTIGER_USERNAME);
    loginParams.append('accessKey', accessKeyHash);
    
    const loginResponse = await fetch(`${VTIGER_URL}/webservice.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: loginParams
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error('Failed to login to Vtiger');
    }
    
    const sessionName = loginData.result.sessionName;
    const userId = loginData.result.userId;
    
    // Step 4: Build lead data
    const buildDescription = (data) => {
      const lines = [
        '=== FORM SUBMISSION DETAILS ===',
        `Form Type: ${data.formType || 'Unknown'}`,
        `Submission Date: ${new Date().toLocaleString()}`,
        `Source URL: ${data.pageUrl || 'Unknown'}`,
        '',
        '--- FORM DATA ---'
      ];
      
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'formType' && key !== 'pageUrl' && value) {
          lines.push(`${key}: ${value}`);
        }
      });
      
      return lines.join('\n');
    };
    
    const leadData = {
      lastname: formData.lastName || formData.lastname || 'Unknown',
      assigned_user_id: userId,
      firstname: formData.firstName || formData.firstname || '',
      company: formData.company || formData.organizationName || '',
      email: formData.email || '',
      phone: formData.phone || formData.mobileNumber || '',
      website: formData.website || '',
      description: buildDescription(formData),
      leadsource: 'Website',
      leadstatus: 'Cold',
      cf_913: '1',
      cf_915: '10000',
      cf_917: '5000',
      cf_919: '5000'
    };
    
    // Step 5: Create lead
    const createParams = new URLSearchParams();
    createParams.append('operation', 'create');
    createParams.append('sessionName', sessionName);
    createParams.append('element', JSON.stringify(leadData));
    createParams.append('elementType', 'Leads');
    
    const createResponse = await fetch(`${VTIGER_URL}/webservice.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: createParams
    });
    
    const createData = await createResponse.json();
    
    if (createData.success) {
      return res.status(200).json({
        success: true,
        leadId: createData.result.id,
        leadNo: createData.result.lead_no,
        name: `${createData.result.firstname} ${createData.result.lastname}`,
        company: createData.result.company
      });
    } else {
      throw new Error(createData.error?.message || 'Failed to create lead');
    }
    
  } catch (error) {
    console.error('Vtiger API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};