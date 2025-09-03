/**
 * Production Vtiger integration that works with both:
 * 1. Local API routes (when running on Vercel/Netlify)
 * 2. External API (when running on static hosting like cPanel)
 */

export async function sendToVtigerProduction(formData: any, formType: string): Promise<any> {
  try {
    console.log('=== SENDING TO VTIGER (PRODUCTION) ===');
    console.log('Form type:', formType);
    
    // Determine API endpoint
    // If NEXT_PUBLIC_API_URL is set, use external API
    // Otherwise, use local API route
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/vtiger`
      : '/api/vtiger';
    
    console.log('Using API endpoint:', apiUrl);
    
    const response = await fetch(apiUrl, {
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
    
    // Handle rate limiting
    if (response.status === 429) {
      const errorData = await response.json();
      console.warn('Rate limit exceeded:', errorData.message);
      return {
        success: false,
        error: errorData.error || 'Too many requests. Please wait before submitting again.',
        retryAfter: errorData.retryAfter
      };
    }
    
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
    
    // Fallback to direct client-side integration if API fails
    // This is less secure but ensures forms always work
    if (process.env.NEXT_PUBLIC_VTIGER_URL && process.env.NEXT_PUBLIC_VTIGER_ACCESS_KEY) {
      console.log('Attempting fallback to direct integration...');
      try {
        const { sendToVtigerDirect } = await import('./vtiger-client-direct');
        return await sendToVtigerDirect(formData, formType);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
    
    return { success: false, error: error.message };
  }
}