/**
 * Direct API Integration with Vtiger CRM
 * This replaces the complex WebService integration with a simple, secure API endpoint
 */

interface VtigerApiConfig {
  apiUrl: string;
  apiKey: string;
}

interface CrmSubmissionData {
  // Lead fields (always created)
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  website?: string;
  leadstatus?: string;
  leadsource?: string;
  description?: string;
  message?: string;
  designation?: string;
  industry?: string;
  revenue?: string;
  
  // Organization fields (created if company_name provided)
  company_name?: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;
  company_employees?: string;
  company_industry?: string;
  company_type?: string;
  company_street?: string;
  company_city?: string;
  company_state?: string;
  company_postalcode?: string;
  company_country?: string;
  
  // Contact fields (created if contact info provided)
  contact_firstname?: string;
  contact_lastname?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_mobile?: string;
  contact_title?: string;
  contact_department?: string;
  contact_street?: string;
  contact_city?: string;
  contact_state?: string;
  contact_postalcode?: string;
  contact_country?: string;
  
  // General address (used as fallback)
  street?: string;
  city?: string;
  state?: string;
  postalcode?: string;
  country?: string;
}

export class VtigerApiIntegration {
  private config: VtigerApiConfig;

  constructor(config?: VtigerApiConfig) {
    this.config = config || {
      apiUrl: process.env.NEXT_PUBLIC_VTIGER_API_URL || process.env.VTIGER_API_URL || '',
      apiKey: process.env.VTIGER_API_KEY || 'monay-api-key-2024'
    };
  }

  /**
   * Submit data to Vtiger CRM via API
   * Creates Organization, Contact, and Lead as appropriate
   */
  async submitToCRM(formData: any, formType: string): Promise<any> {
    try {
      console.log('=== VTIGER API SUBMISSION START ===');
      console.log('Form type:', formType);
      console.log('API URL:', this.config.apiUrl);
      
      if (!this.config.apiUrl) {
        console.log('Vtiger API URL not configured - skipping CRM submission');
        return { success: false, message: 'CRM not configured' };
      }

      // Map form data to CRM submission format
      const crmData = this.mapFormDataToCRM(formData, formType);
      console.log('Mapped CRM data:', crmData);

      // Make API request
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(crmData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ CRM submission successful:', result);
        return result;
      } else {
        console.error('❌ CRM submission failed:', result);
        return { 
          success: false, 
          message: result.error || 'CRM submission failed',
          details: result 
        };
      }
    } catch (error) {
      console.error('❌ CRM API error:', error);
      // Don't throw - we want form submission to succeed even if CRM fails
      return { 
        success: false, 
        message: 'CRM connection error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      console.log('=== VTIGER API SUBMISSION END ===');
    }
  }

  /**
   * Map form data from Monay website to CRM API format
   */
  private mapFormDataToCRM(formData: any, formType: string): CrmSubmissionData {
    const crmData: CrmSubmissionData = {
      // Lead information (primary fields)
      firstname: formData.firstName || formData.firstname || '',
      lastname: formData.lastName || formData.lastname || 'Unknown',
      email: formData.email || '',
      phone: formData.phone || '',
      mobile: formData.mobile || '',
      website: formData.website || '',
      leadstatus: 'New',
      leadsource: `Monay Website - ${formType}`,
      
      // Build comprehensive description
      description: this.buildDescription(formData, formType),
      message: formData.message || '',
      
      // Job/Role information
      designation: formData.role || formData.jobTitle || formData.designation || '',
      industry: formData.industry || '',
      
      // Company information for Lead
      company: formData.company || formData.organizationName || formData.companyName || '',
    };

    // Organization data (if company provided)
    if (formData.company || formData.organizationName || formData.companyName) {
      crmData.company_name = formData.company || formData.organizationName || formData.companyName;
      crmData.company_website = formData.companyWebsite || formData.website || '';
      crmData.company_email = formData.companyEmail || formData.email || '';
      crmData.company_phone = formData.companyPhone || formData.phone || '';
      crmData.company_industry = formData.industry || '';
      crmData.company_employees = this.mapEmployeeCount(formData);
      crmData.company_type = formData.companyType || 'Customer';
    }

    // Contact data (create contact if we have name/email)
    if (formData.firstName || formData.lastName || formData.email) {
      crmData.contact_firstname = formData.firstName || formData.firstname || '';
      crmData.contact_lastname = formData.lastName || formData.lastname || 'Unknown';
      crmData.contact_email = formData.email || '';
      crmData.contact_phone = formData.phone || '';
      crmData.contact_mobile = formData.mobile || '';
      crmData.contact_title = formData.role || formData.jobTitle || formData.designation || '';
      crmData.contact_department = formData.department || '';
    }

    // Address information
    if (formData.address || formData.street) {
      crmData.street = formData.street || formData.address || '';
      crmData.city = formData.city || '';
      crmData.state = formData.state || '';
      crmData.postalcode = formData.postalCode || formData.zipCode || formData.postalcode || '';
      crmData.country = formData.country || '';
    }

    // Revenue mapping
    if (formData.transactionVolume || formData.monthlyTransactionVolume || formData.revenue) {
      crmData.revenue = this.mapRevenue(formData);
    }

    return crmData;
  }

  /**
   * Build comprehensive description from all form fields
   */
  private buildDescription(formData: any, formType: string): string {
    const lines: string[] = [
      `Lead source: ${formType}`,
      `Submission date: ${new Date().toISOString()}`,
      ''
    ];

    // Add message if provided
    if (formData.message) {
      lines.push('Message:', formData.message, '');
    }

    // Add use case information
    if (formData.useCase) {
      lines.push(`Use Case: ${formData.useCase}`);
    }

    // Add metrics
    if (formData.monthlyActiveUsers) {
      lines.push(`Monthly Active Users: ${formData.monthlyActiveUsers}`);
    }

    if (formData.transactionVolume || formData.monthlyTransactionVolume) {
      lines.push(`Transaction Volume: ${formData.transactionVolume || formData.monthlyTransactionVolume}`);
    }

    // Add product interests
    if (formData.interestedProducts && Array.isArray(formData.interestedProducts)) {
      lines.push(`Interested Products: ${formData.interestedProducts.join(', ')}`);
    }

    // Add timeline and budget
    if (formData.timeline) {
      lines.push(`Timeline: ${formData.timeline}`);
    }

    if (formData.budget) {
      lines.push(`Budget: ${formData.budget}`);
    }

    // Add country
    if (formData.country) {
      lines.push(`Country: ${formData.country}`);
    }

    // Add any additional fields not captured above
    const capturedFields = new Set([
      'firstName', 'lastname', 'email', 'phone', 'mobile', 'company', 
      'organizationName', 'companyName', 'message', 'useCase', 
      'monthlyActiveUsers', 'transactionVolume', 'monthlyTransactionVolume',
      'interestedProducts', 'timeline', 'budget', 'country', 'role',
      'jobTitle', 'designation', 'industry', 'website', 'address',
      'street', 'city', 'state', 'postalCode', 'zipCode', 'postalcode'
    ]);

    const additionalFields = Object.entries(formData)
      .filter(([key]) => !capturedFields.has(key))
      .map(([key, value]) => `${key}: ${value}`);

    if (additionalFields.length > 0) {
      lines.push('', 'Additional Information:', ...additionalFields);
    }

    return lines.join('\n');
  }

  /**
   * Map employee count to standard format
   */
  private mapEmployeeCount(formData: any): string {
    const size = formData.organizationSize || formData.companySize || formData.employees || '';
    
    if (typeof size === 'number') return size.toString();
    
    const sizeStr = size.toString().toLowerCase();
    if (sizeStr.includes('1-10') || sizeStr.includes('small')) return '1-10';
    if (sizeStr.includes('11-50')) return '11-50';
    if (sizeStr.includes('51-200') || sizeStr.includes('medium')) return '51-200';
    if (sizeStr.includes('201-500')) return '201-500';
    if (sizeStr.includes('501-1000')) return '501-1000';
    if (sizeStr.includes('1000+') || sizeStr.includes('1001') || sizeStr.includes('enterprise')) return '1000+';
    
    return size.toString();
  }

  /**
   * Map revenue to standard format
   */
  private mapRevenue(formData: any): string {
    const volume = formData.transactionVolume || formData.monthlyTransactionVolume || formData.revenue || '';
    const volumeStr = volume.toString().toUpperCase();
    
    if (volumeStr.includes('1M')) return '$1M - $10M';
    if (volumeStr.includes('10M')) return '$10M - $100M';
    if (volumeStr.includes('100M')) return '$100M - $1B';
    if (volumeStr.includes('1B') || volumeStr.includes('BILLION')) return '$1B+';
    
    return volume.toString();
  }
}

/**
 * Simple function to send form data to Vtiger CRM
 * This can be called from any form submission handler
 */
export async function sendToVtigerAPI(formData: any, formType: string): Promise<any> {
  const vtiger = new VtigerApiIntegration();
  const result = await vtiger.submitToCRM(formData, formType);
  
  if (result.success) {
    console.log('✅ Successfully submitted to CRM');
    console.log('Created entities:', result.entities);
  } else {
    console.warn('⚠️ CRM submission failed but form processing continues');
    console.warn('Reason:', result.message);
  }
  
  return result;
}