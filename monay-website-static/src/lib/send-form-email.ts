export async function sendFormEmail(formData: any, formType: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        formType
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send form');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending form email:', error);
    throw error;
  }
}