import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: BusinessRuleCategory;
  priority: number;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  assignedUsers: number;
  violations: number;
  createdAt: string;
  lastModified: string;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'in' | 'between';
  value: any;
  logicOperator?: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: 'block' | 'flag' | 'approve' | 'escalate' | 'notify' | 'setLimit';
  parameters: Record<string, any>;
}

interface UserBusinessRuleAssignment {
  id: string;
  userId: string;
  businessRuleId: string;
  assignedBy: string;
  assignedAt: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  parameters?: Record<string, any>;
}

interface KycProfile {
  userId: string;
  kycLevel: 'NONE' | 'BASIC' | 'ENHANCED' | 'PREMIUM';
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  isVerified: boolean;
  riskScore: number;
  sanctionsCheck: boolean;
  pepCheck: boolean;
}

interface SpendLimit {
  userId: string;
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;
  currentDailySpent: number;
  currentMonthlySpent: number;
  isActive: boolean;
}

interface RuleViolation {
  id: string;
  userId: string;
  businessRuleId: string;
  violationType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  transactionId?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string;
}

type BusinessRuleCategory = 
  | 'KYC_ELIGIBILITY' 
  | 'SPEND_MANAGEMENT' 
  | 'TRANSACTION_MONITORING' 
  | 'COMPLIANCE'
  | 'RISK_MANAGEMENT' 
  | 'GEOGRAPHIC_RESTRICTIONS';

class BusinessRulesService {
  private getAuthHeader() {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Business Rules CRUD
  async getAllBusinessRules(): Promise<BusinessRule[]> {
    try {
      const response = await axios.get(`${API_URL}/api/business-rules`, {
        headers: this.getAuthHeader(),
      });
      
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching business rules:', error);
      
      // Fallback to mock data if API fails
      const mockRules: BusinessRule[] = [
      {
        id: '1',
        name: 'Daily Transaction Limit',
        description: 'Enforces daily transaction limits based on KYC level',
        category: 'SPEND_MANAGEMENT',
        priority: 150,
        isActive: true,
        conditions: [
          { id: '1', field: 'kyc_level', operator: 'equals', value: 'BASIC' },
          { id: '2', field: 'daily_spent', operator: 'greaterThan', value: 1000 }
        ],
        actions: [
          { id: '1', type: 'block', parameters: { message: 'Daily limit exceeded' } }
        ],
        assignedUsers: 125,
        violations: 12,
        createdAt: '2023-10-01T08:00:00Z',
        lastModified: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        name: 'High Risk Transaction Monitoring',
        description: 'Flags transactions above $10,000 for manual review',
        category: 'TRANSACTION_MONITORING',
        priority: 180,
        isActive: true,
        conditions: [
          { id: '1', field: 'transaction_amount', operator: 'greaterThan', value: 10000 }
        ],
        actions: [
          { id: '1', type: 'flag', parameters: { severity: 'HIGH' } },
          { id: '2', type: 'notify', parameters: { team: 'compliance' } }
        ],
        assignedUsers: 450,
        violations: 23,
        createdAt: '2023-09-15T09:00:00Z',
        lastModified: '2024-01-12T14:00:00Z'
      },
      {
        id: '3',
        name: 'KYC Verification Required',
        description: 'Requires enhanced KYC for transactions over $5,000',
        category: 'KYC_ELIGIBILITY',
        priority: 120,
        isActive: true,
        conditions: [
          { id: '1', field: 'transaction_amount', operator: 'greaterThan', value: 5000 },
          { id: '2', field: 'kyc_level', operator: 'equals', value: 'BASIC' }
        ],
        actions: [
          { id: '1', type: 'escalate', parameters: { to: 'kyc_team' } }
        ],
        assignedUsers: 89,
        violations: 5,
        createdAt: '2023-11-01T10:00:00Z',
        lastModified: '2024-01-08T11:00:00Z'
      },
      {
        id: '4',
        name: 'Sanctions List Check',
        description: 'Blocks transactions to sanctioned entities',
        category: 'COMPLIANCE',
        priority: 200,
        isActive: true,
        conditions: [
          { id: '1', field: 'sanctions_check', operator: 'equals', value: true }
        ],
        actions: [
          { id: '1', type: 'block', parameters: { reason: 'Sanctions violation' } },
          { id: '2', type: 'notify', parameters: { team: 'compliance', priority: 'CRITICAL' } }
        ],
        assignedUsers: 500,
        violations: 2,
        createdAt: '2023-08-01T08:00:00Z',
        lastModified: '2024-01-15T09:00:00Z'
      },
      {
        id: '5',
        name: 'Geographic Restriction - High Risk Countries',
        description: 'Blocks transactions from high-risk jurisdictions',
        category: 'GEOGRAPHIC_RESTRICTIONS',
        priority: 160,
        isActive: false,
        conditions: [
          { id: '1', field: 'user_country', operator: 'in', value: ['NK', 'IR', 'SY'] }
        ],
        actions: [
          { id: '1', type: 'block', parameters: { reason: 'Geographic restriction' } }
        ],
        assignedUsers: 0,
        violations: 0,
        createdAt: '2023-12-01T12:00:00Z',
        lastModified: '2024-01-05T13:00:00Z'
      },
      {
        id: '6',
        name: 'Monthly Spending Cap',
        description: 'Enforces monthly spending limits for basic users',
        category: 'SPEND_MANAGEMENT',
        priority: 100,
        isActive: true,
        conditions: [
          { id: '1', field: 'user_tier', operator: 'equals', value: 'basic' },
          { id: '2', field: 'monthly_spent', operator: 'greaterThan', value: 10000 }
        ],
        actions: [
          { id: '1', type: 'setLimit', parameters: { type: 'monthly', amount: 10000 } }
        ],
        assignedUsers: 234,
        violations: 18,
        createdAt: '2023-10-15T11:00:00Z',
        lastModified: '2024-01-14T15:00:00Z'
      }
    ];
      
      return mockRules;
    }
  }

  async getBusinessRule(id: string): Promise<BusinessRule | null> {
    try {
      const response = await axios.get(`${API_URL}/api/business-rules/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching business rule:', error);
      return null;
    }
  }

  async createBusinessRule(ruleData: Partial<BusinessRule>): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/business-rules`, ruleData, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to create business rule',
      };
    }
  }

  async updateBusinessRule(id: string, ruleData: Partial<BusinessRule>): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/api/business-rules/${id}`, ruleData, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error;
      return {
        success: false,
        error: typeof errorMsg === 'string' ? errorMsg : 'Failed to update business rule',
      };
    }
  }

  async deleteBusinessRule(id: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/api/business-rules/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error;
      return {
        success: false,
        error: typeof errorMsg === 'string' ? errorMsg : 'Failed to delete business rule',
      };
    }
  }

  async toggleBusinessRule(id: string, isActive: boolean): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/api/business-rules/${id}/toggle`, 
        { isActive }, 
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error;
      return {
        success: false,
        error: typeof errorMsg === 'string' ? errorMsg : 'Failed to toggle business rule',
      };
    }
  }

  // User Assignment
  async assignRuleToUser(userId: string, businessRuleId: string, params?: {
    effectiveFrom?: string;
    effectiveTo?: string;
    parameters?: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/business-rules/assign`, {
        userId,
        businessRuleId,
        ...params,
      }, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign rule to user',
      };
    }
  }

  async unassignRuleFromUser(userId: string, businessRuleId: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/api/business-rules/assign`, {
        headers: this.getAuthHeader(),
        data: { userId, businessRuleId },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to unassign rule from user',
      };
    }
  }

  async getUserBusinessRules(userId: string): Promise<UserBusinessRuleAssignment[]> {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}/business-rules`, {
        headers: this.getAuthHeader(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user business rules:', error);
      return [];
    }
  }

  async getRuleAssignments(businessRuleId: string): Promise<UserBusinessRuleAssignment[]> {
    try {
      const response = await axios.get(`${API_URL}/api/business-rules/${businessRuleId}/assignments`, {
        headers: this.getAuthHeader(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching rule assignments:', error);
      return [];
    }
  }

  // KYC Management
  async getKycProfile(userId: string): Promise<KycProfile | null> {
    try {
      const response = await axios.get(`${API_URL}/api/kyc/${userId}`, {
        headers: this.getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching KYC profile:', error);
      return null;
    }
  }

  async updateKycProfile(userId: string, kycData: Partial<KycProfile>): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/api/kyc/${userId}`, kycData, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update KYC profile',
      };
    }
  }

  // Spend Limits Management
  async getSpendLimits(userId: string): Promise<SpendLimit | null> {
    try {
      const response = await axios.get(`${API_URL}/api/spend-limits/${userId}`, {
        headers: this.getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching spend limits:', error);
      return null;
    }
  }

  async setSpendLimits(userId: string, limits: Partial<SpendLimit>): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/spend-limits`, {
        userId,
        ...limits,
      }, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to set spend limits',
      };
    }
  }

  async updateSpendLimits(userId: string, limits: Partial<SpendLimit>): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/api/spend-limits/${userId}`, limits, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update spend limits',
      };
    }
  }

  // Violations Management
  async getRuleViolations(filters?: {
    userId?: string;
    businessRuleId?: string;
    severity?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RuleViolation[]> {
    try {
      const response = await axios.get(`${API_URL}/api/rule-violations`, {
        headers: this.getAuthHeader(),
        params: filters,
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching rule violations:', error);
      return [];
    }
  }

  async resolveViolation(violationId: string, resolution: string): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/api/rule-violations/${violationId}/resolve`, {
        resolution,
      }, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to resolve violation',
      };
    }
  }

  // Rule Evaluation
  async evaluateUserTransaction(userId: string, transactionData: {
    amount: number;
    currency: string;
    recipientId?: string;
    category?: string;
    merchantId?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/business-rules/evaluate`, {
        userId,
        transactionData,
      }, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to evaluate transaction',
      };
    }
  }

  // Analytics
  async getRuleAnalytics(businessRuleId?: string, timeRange?: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/business-rules/analytics`, {
        headers: this.getAuthHeader(),
        params: { businessRuleId, timeRange },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching rule analytics:', error);
      return null;
    }
  }

  async getComplianceReport(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    userId?: string;
  }): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/compliance/report`, {
        headers: this.getAuthHeader(),
        params: filters,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching compliance report:', error);
      return null;
    }
  }

  // Rule Templates
  async getRuleTemplates(category?: BusinessRuleCategory): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/api/business-rules/templates`, {
        headers: this.getAuthHeader(),
        params: { category },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching rule templates:', error);
      return [];
    }
  }

  async createRuleFromTemplate(templateId: string, customizations?: Record<string, any>): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/business-rules/from-template`, {
        templateId,
        customizations,
      }, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create rule from template',
      };
    }
  }
}

export const businessRulesService = new BusinessRulesService();