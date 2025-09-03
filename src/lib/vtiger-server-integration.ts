/**
 * Server-side Vtiger integration
 * This calls our API route which handles the Vtiger REST API on the server
 * where environment variables work properly
 */

export async function sendToVtigerServer(formData: any, formType: string): Promise<any> {
  try {
    console.log('=== SENDING TO VTIGER SERVER ===');
    console.log('Form type:', formType);
    console.log('Form data being sent:', formData);
    
    const response = await fetch('/api/vtiger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        formType,
        pageUrl: typeof window !== 'undefined' ? window.location.href : ''
      })
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API returned error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Lead created successfully!');
      console.log('Lead ID:', result.leadId);
      console.log('Lead No:', result.leadNo);
      console.log('Name:', result.name);
      console.log('Company:', result.company);
    } else {
      console.error('❌ Failed to create lead:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error calling Vtiger API:', error);
    console.error('Full error details:', error);
    // Don't throw - we want form to succeed even if CRM fails
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}