interface VtigerConfig {
  url: string;
  username: string;
  accessKey: string;
}

interface VtigerLead {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  leadsource?: string;
  description?: string;
  website?: string;
  industry?: string;
  annualrevenue?: string;
  noofemployees?: string;
  assigned_user_id?: string;
}

/**
 * Vtiger CRM Integration
 * 
 * To use this integration, you need to:
 * 1. Set up environment variables for your Vtiger instance
 * 2. Get your access key from Vtiger: My Preferences > User Advanced Options > Webservice Access Key
 * 3. Enable Web Services in your Vtiger instance
 */
export class VtigerIntegration {
  private config: VtigerConfig;
  private sessionId: string | null = null;
  private userId: string | null = null;

  constructor(config?: VtigerConfig) {
    this.config = config || {
      url: process.env.VTIGER_URL || '',
      username: process.env.VTIGER_USERNAME || '',
      accessKey: process.env.VTIGER_ACCESS_KEY || ''
    };
  }

  /**
   * Get challenge token from Vtiger
   */
  private async getChallenge(): Promise<string> {
    const url = `${this.config.url}/webservice.php?operation=getchallenge&username=${this.config.username}`;
    console.log('Vtiger: Getting challenge from:', url);
    
    const response = await fetch(url, { method: 'GET' });

    const data = await response.json();
    console.log('Vtiger challenge response:', data);
    
    if (!data.success) {
      throw new Error(`Vtiger challenge failed: ${data.error?.message || JSON.stringify(data)}`);
    }

    return data.result.token;
  }

  /**
   * Login to Vtiger and get session ID
   */
  private async login(): Promise<string> {
    const token = await this.getChallenge();
    
    // Create MD5 hash of token + accessKey
    const crypto = require('crypto');
    const accessKeyHash = crypto
      .createHash('md5')
      .update(token + this.config.accessKey)
      .digest('hex');

    console.log('Vtiger: Logging in with username:', this.config.username);
    console.log('Vtiger: Access key hash:', accessKeyHash);

    const formData = new URLSearchParams();
    formData.append('operation', 'login');
    formData.append('username', this.config.username);
    formData.append('accessKey', accessKeyHash);

    const response = await fetch(`${this.config.url}/webservice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await response.json();
    console.log('Vtiger login response:', data);
    
    if (!data.success) {
      throw new Error(`Vtiger login failed: ${data.error?.message || JSON.stringify(data)}`);
    }

    this.sessionId = data.result.sessionName;
    this.userId = data.result.userId;
    console.log('Vtiger: Successfully logged in with session:', this.sessionId);
    console.log('Vtiger: User ID:', this.userId);
    
    if (!this.sessionId) {
      throw new Error('Vtiger login succeeded but no session ID was returned');
    }
    
    return this.sessionId;
  }

  /**
   * Create a lead in Vtiger
   */
  async createLead(formData: any, formType: string): Promise<any> {
    try {
      console.log('Vtiger: Creating lead for form type:', formType);
      console.log('Vtiger: Form data received:', formData);
      
      // Login if not already logged in
      if (!this.sessionId) {
        await this.login();
      }

      // Map form data to Vtiger lead format
      const lead: VtigerLead = {
        firstname: formData.firstName || 'Not Provided',
        lastname: formData.lastName || 'Not Provided',
        email: formData.email || '',
        phone: formData.phone || '',
        company: formData.company || formData.organizationName || 'Not Provided',
        designation: formData.role || formData.jobTitle || '',
        leadsource: 'Website',
        description: this.buildDescription(formData, formType),
        industry: formData.industry || '',
        annualrevenue: this.mapRevenue(formData),
        noofemployees: this.mapEmployees(formData),
        assigned_user_id: this.userId || '19x1' // Use the logged-in user ID
      };

      console.log('Vtiger: Mapped lead data:', lead);

      // Create the lead
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('operation', 'create');
      formDataToSend.append('sessionName', this.sessionId!);
      formDataToSend.append('element', JSON.stringify({
        ...lead,
        elementType: 'Leads'
      }));

      console.log('Vtiger: Sending create request to:', `${this.config.url}/webservice.php`);
      
      const response = await fetch(`${this.config.url}/webservice.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString()
      });

      const data = await response.json();
      console.log('Vtiger create lead response:', data);
      
      if (!data.success) {
        throw new Error(`Failed to create lead: ${data.error?.message || JSON.stringify(data)}`);
      }

      console.log('Vtiger: Lead created successfully with ID:', data.result?.id);
      return data.result;
    } catch (error) {
      console.error('Vtiger integration error:', error);
      // Don't throw - we want form submission to succeed even if CRM fails
      return null;
    }
  }

  /**
   * Build description field from form data
   */
  private buildDescription(formData: any, formType: string): string {
    let description = `Lead from ${formType}\n\n`;
    
    if (formData.message) {
      description += `Message: ${formData.message}\n\n`;
    }
    
    if (formData.useCase) {
      description += `Use Case: ${formData.useCase}\n`;
    }
    
    if (formData.monthlyActiveUsers) {
      description += `Monthly Active Users: ${formData.monthlyActiveUsers}\n`;
    }
    
    if (formData.transactionVolume) {
      description += `Transaction Volume: ${formData.transactionVolume}\n`;
    }
    
    if (formData.interestedProducts) {
      description += `Interested Products: ${formData.interestedProducts.join(', ')}\n`;
    }
    
    if (formData.timeline) {
      description += `Timeline: ${formData.timeline}\n`;
    }
    
    if (formData.budget) {
      description += `Budget: ${formData.budget}\n`;
    }

    description += `\nCountry: ${formData.country || 'Not specified'}`;
    
    return description;
  }

  /**
   * Map revenue range to Vtiger format
   */
  private mapRevenue(formData: any): string {
    const volume = formData.transactionVolume || formData.monthlyTransactionVolume || '';
    
    if (volume.includes('1M')) return '1000000';
    if (volume.includes('10M')) return '10000000';
    if (volume.includes('100M')) return '100000000';
    if (volume.includes('1B')) return '1000000000';
    
    return '';
  }

  /**
   * Map employee count to Vtiger format
   */
  private mapEmployees(formData: any): string {
    const size = formData.organizationSize || formData.companySize || '';
    
    if (size.includes('1-10')) return '10';
    if (size.includes('11-50')) return '50';
    if (size.includes('51-200')) return '200';
    if (size.includes('201-500')) return '500';
    if (size.includes('501-1000')) return '1000';
    if (size.includes('1000+') || size.includes('1001')) return '10000';
    
    return '';
  }

  /**
   * Logout from Vtiger
   */
  async logout(): Promise<void> {
    if (!this.sessionId) return;

    try {
      const formData = new URLSearchParams();
      formData.append('operation', 'logout');
      formData.append('sessionName', this.sessionId);

      await fetch(`${this.config.url}/webservice.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
    } catch (error) {
      console.error('Vtiger logout error:', error);
    } finally {
      this.sessionId = null;
    }
  }
}

/**
 * Send form data to Vtiger CRM
 */
export async function sendToVtiger(formData: any, formType: string): Promise<void> {
  console.log('=== VTIGER INTEGRATION START ===');
  console.log('Environment check:');
  console.log('VTIGER_URL:', process.env.VTIGER_URL ? 'Set' : 'Not set');
  console.log('VTIGER_USERNAME:', process.env.VTIGER_USERNAME ? 'Set' : 'Not set');
  console.log('VTIGER_ACCESS_KEY:', process.env.VTIGER_ACCESS_KEY ? 'Set (hidden)' : 'Not set');
  
  // Only proceed if Vtiger is configured
  if (!process.env.VTIGER_URL || !process.env.VTIGER_USERNAME || !process.env.VTIGER_ACCESS_KEY) {
    console.log('Vtiger not configured - skipping CRM integration');
    return;
  }

  console.log('Vtiger configuration found, proceeding with integration...');
  const vtiger = new VtigerIntegration();
  
  try {
    const lead = await vtiger.createLead(formData, formType);
    if (lead) {
      console.log(`✅ Lead created successfully in Vtiger!`);
      console.log(`Lead ID: ${lead.id}`);
      console.log(`Lead Details:`, lead);
    } else {
      console.log('⚠️ Lead creation returned null (check error logs above)');
    }
  } catch (error) {
    console.error('❌ Error in sendToVtiger:', error);
  } finally {
    await vtiger.logout();
    console.log('=== VTIGER INTEGRATION END ===');
  }
}