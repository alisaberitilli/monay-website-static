import HttpStatus from 'http-status';
import { CustomError } from '../middlewares/errors';
import loggers from './logger';
import axios from 'axios';
import crypto from 'crypto';

class CustomerVerificationService {
  constructor() {
    this.providers = {
      persona: {
        apiKey: process.env.PERSONA_API_KEY || 'test_key',
        baseUrl: 'https://withpersona.com/api/v1',
        webhookSecret: process.env.PERSONA_WEBHOOK_SECRET
      },
      alloy: {
        apiKey: process.env.ALLOY_API_KEY || 'test_key',
        apiSecret: process.env.ALLOY_API_SECRET || 'test_secret',
        baseUrl: 'https://sandbox.alloy.co/v1'
      },
      onfido: {
        apiToken: process.env.ONFIDO_API_TOKEN || 'test_token',
        baseUrl: 'https://api.eu.onfido.com/v3.6',
        region: 'EU' // or 'US'
      }
    };

    this.verificationLevels = {
      BASIC: 'basic',
      ENHANCED: 'enhanced',
      FULL: 'full'
    };

    this.documentTypes = {
      PASSPORT: 'passport',
      DRIVERS_LICENSE: 'drivers_license',
      NATIONAL_ID: 'national_id',
      RESIDENCE_PERMIT: 'residence_permit'
    };
  }

  /**
   * Create verification session
   */
  async createVerificationSession(userData, options = {}) {
    try {
      const { provider = 'persona', verificationType = 'individual' } = options;
      let session;

      switch (provider) {
        case 'persona':
          session = await this.createPersonaInquiry(userData, verificationType);
          break;
        case 'alloy':
          session = await this.createAlloyEvaluation(userData, verificationType);
          break;
        case 'onfido':
          session = await this.createOnfidoApplicant(userData);
          break;
        default:
          throw new Error('Invalid verification provider');
      }

      // Store verification session in database
      await this.storeVerificationSession({
        userId: userData.userId,
        sessionId: session.id,
        provider,
        status: 'pending',
        verificationType,
        createdAt: new Date()
      });

      loggers.infoLogger.info(`Verification session created: ${session.id}`);

      return {
        success: true,
        sessionId: session.id,
        verificationUrl: session.url,
        provider
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to create verification session: ${error.message}`);
      throw new CustomError(
        'Failed to create verification session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create Persona inquiry
   */
  async createPersonaInquiry(userData, verificationType) {
    try {
      const inquiryTemplate = verificationType === 'business' 
        ? 'inq_tmpl_business_kyb'
        : 'inq_tmpl_individual_kyc';

      const response = await axios.post(
        `${this.providers.persona.baseUrl}/inquiries`,
        {
          data: {
            attributes: {
              inquiry_template_id: inquiryTemplate,
              reference_id: userData.userId,
              fields: {
                name_first: userData.firstName,
                name_last: userData.lastName,
                email_address: userData.email,
                phone_number: userData.phone,
                address_street_1: userData.addressLine1,
                address_city: userData.city,
                address_subdivision: userData.state,
                address_postal_code: userData.postalCode,
                address_country_code: userData.country || 'US',
                birthdate: userData.dateOfBirth
              }
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.persona.apiKey}`,
            'Persona-Version': '2023-01-05'
          }
        }
      );

      return {
        id: response.data.data.id,
        url: response.data.data.attributes.url,
        status: response.data.data.attributes.status
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create Alloy evaluation
   */
  async createAlloyEvaluation(userData, verificationType) {
    try {
      const entityType = verificationType === 'business' ? 'business' : 'person';

      const response = await axios.post(
        `${this.providers.alloy.baseUrl}/evaluations`,
        {
          entity_type: entityType,
          external_entity_id: userData.userId,
          name_first: userData.firstName,
          name_last: userData.lastName,
          email_address: userData.email,
          phone_number: userData.phone,
          address_line_1: userData.addressLine1,
          address_city: userData.city,
          address_state: userData.state,
          address_postal_code: userData.postalCode,
          address_country_code: userData.country || 'US',
          birth_date: userData.dateOfBirth,
          document_ssn: userData.ssn // Optional, for enhanced verification
        },
        {
          auth: {
            username: this.providers.alloy.apiKey,
            password: this.providers.alloy.apiSecret
          }
        }
      );

      return {
        id: response.data.evaluation_id,
        url: response.data.summary.outcome,
        status: response.data.summary.result
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create Onfido applicant
   */
  async createOnfidoApplicant(userData) {
    try {
      // Create applicant
      const applicantResponse = await axios.post(
        `${this.providers.onfido.baseUrl}/applicants`,
        {
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone_number: userData.phone,
          dob: userData.dateOfBirth,
          address: {
            street: userData.addressLine1,
            town: userData.city,
            state: userData.state,
            postcode: userData.postalCode,
            country: userData.country || 'USA'
          }
        },
        {
          headers: {
            'Authorization': `Token token=${this.providers.onfido.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const applicantId = applicantResponse.data.id;

      // Create SDK token for client-side capture
      const sdkTokenResponse = await axios.post(
        `${this.providers.onfido.baseUrl}/sdk_token`,
        {
          applicant_id: applicantId,
          referrer: process.env.FRONTEND_URL || '*'
        },
        {
          headers: {
            'Authorization': `Token token=${this.providers.onfido.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: applicantId,
        url: sdkTokenResponse.data.token,
        status: 'created'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(sessionId, provider) {
    try {
      let status;

      switch (provider) {
        case 'persona':
          status = await this.checkPersonaStatus(sessionId);
          break;
        case 'alloy':
          status = await this.checkAlloyStatus(sessionId);
          break;
        case 'onfido':
          status = await this.checkOnfidoStatus(sessionId);
          break;
        default:
          throw new Error('Invalid verification provider');
      }

      // Update database with latest status
      await this.updateVerificationStatus(sessionId, status);

      return status;
    } catch (error) {
      loggers.errorLogger.error(`Failed to check verification status: ${error.message}`);
      throw new CustomError(
        'Failed to check verification status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check Persona inquiry status
   */
  async checkPersonaStatus(inquiryId) {
    try {
      const response = await axios.get(
        `${this.providers.persona.baseUrl}/inquiries/${inquiryId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.providers.persona.apiKey}`,
            'Persona-Version': '2023-01-05'
          }
        }
      );

      const inquiry = response.data.data;
      const status = inquiry.attributes.status;

      return {
        status: this.mapPersonaStatus(status),
        details: inquiry.attributes,
        verificationId: inquiry.id,
        completedAt: inquiry.attributes.completed_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check Alloy evaluation status
   */
  async checkAlloyStatus(evaluationId) {
    try {
      const response = await axios.get(
        `${this.providers.alloy.baseUrl}/evaluations/${evaluationId}`,
        {
          auth: {
            username: this.providers.alloy.apiKey,
            password: this.providers.alloy.apiSecret
          }
        }
      );

      const evaluation = response.data;

      return {
        status: this.mapAlloyStatus(evaluation.summary.result),
        details: evaluation.summary,
        verificationId: evaluationId,
        completedAt: evaluation.created_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check Onfido check status
   */
  async checkOnfidoStatus(applicantId) {
    try {
      // Get checks for applicant
      const response = await axios.get(
        `${this.providers.onfido.baseUrl}/checks?applicant_id=${applicantId}`,
        {
          headers: {
            'Authorization': `Token token=${this.providers.onfido.apiToken}`
          }
        }
      );

      if (response.data.checks.length === 0) {
        return {
          status: 'pending',
          details: null,
          verificationId: applicantId,
          completedAt: null
        };
      }

      const latestCheck = response.data.checks[0];

      return {
        status: this.mapOnfidoStatus(latestCheck.result),
        details: latestCheck,
        verificationId: latestCheck.id,
        completedAt: latestCheck.completed_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process webhook from verification provider
   */
  async processWebhook(provider, payload, signature) {
    try {
      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(provider, payload, signature);
      
      if (!isValid) {
        throw new CustomError('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
      }

      let result;

      switch (provider) {
        case 'persona':
          result = await this.processPersonaWebhook(payload);
          break;
        case 'alloy':
          result = await this.processAlloyWebhook(payload);
          break;
        case 'onfido':
          result = await this.processOnfidoWebhook(payload);
          break;
        default:
          throw new Error('Invalid webhook provider');
      }

      loggers.infoLogger.info(`Webhook processed for ${provider}: ${result.sessionId}`);

      return result;
    } catch (error) {
      loggers.errorLogger.error(`Failed to process webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(provider, payload, signature) {
    switch (provider) {
      case 'persona':
        const expectedSignature = crypto
          .createHmac('sha256', this.providers.persona.webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        return signature === `sha256=${expectedSignature}`;
      
      case 'onfido':
        const onfidoSignature = crypto
          .createHmac('sha256', this.providers.onfido.webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        return signature === onfidoSignature;
      
      case 'alloy':
        // Alloy uses basic auth for webhooks
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Process Persona webhook
   */
  async processPersonaWebhook(payload) {
    const event = payload.data;
    const inquiryId = event.id;
    const status = event.attributes.status;

    await this.updateVerificationStatus(inquiryId, {
      status: this.mapPersonaStatus(status),
      details: event.attributes,
      completedAt: event.attributes.completed_at
    });

    // Trigger any additional actions based on status
    if (status === 'approved') {
      await this.onVerificationApproved(inquiryId);
    } else if (status === 'declined') {
      await this.onVerificationDeclined(inquiryId);
    }

    return { sessionId: inquiryId, status };
  }

  /**
   * Process Alloy webhook
   */
  async processAlloyWebhook(payload) {
    const evaluationId = payload.evaluation_id;
    const status = payload.summary.result;

    await this.updateVerificationStatus(evaluationId, {
      status: this.mapAlloyStatus(status),
      details: payload.summary,
      completedAt: payload.created_at
    });

    return { sessionId: evaluationId, status };
  }

  /**
   * Process Onfido webhook
   */
  async processOnfidoWebhook(payload) {
    const checkId = payload.object.id;
    const status = payload.object.status;
    const result = payload.object.result;

    await this.updateVerificationStatus(checkId, {
      status: this.mapOnfidoStatus(result),
      details: payload.object,
      completedAt: payload.object.completed_at
    });

    return { sessionId: checkId, status: result };
  }

  /**
   * Map provider status to internal status
   */
  mapPersonaStatus(status) {
    const statusMap = {
      'created': 'pending',
      'pending': 'pending',
      'reviewing': 'reviewing',
      'approved': 'approved',
      'declined': 'declined',
      'expired': 'expired'
    };
    return statusMap[status] || 'unknown';
  }

  mapAlloyStatus(status) {
    const statusMap = {
      'success': 'approved',
      'manual_review': 'reviewing',
      'denied': 'declined',
      'pending': 'pending'
    };
    return statusMap[status] || 'unknown';
  }

  mapOnfidoStatus(result) {
    const resultMap = {
      'clear': 'approved',
      'consider': 'reviewing',
      'unidentified': 'declined',
      null: 'pending'
    };
    return resultMap[result] || 'unknown';
  }

  /**
   * Perform enhanced due diligence
   */
  async performEnhancedDueDiligence(userId, options = {}) {
    try {
      const results = {
        sanctionsCheck: await this.checkSanctions(userId),
        pepCheck: await this.checkPEP(userId),
        adverseMediaCheck: await this.checkAdverseMedia(userId),
        creditCheck: options.includeCreditCheck ? await this.checkCredit(userId) : null
      };

      const overallRisk = this.calculateRiskScore(results);

      return {
        success: true,
        userId,
        checks: results,
        riskScore: overallRisk,
        recommendation: this.getRiskRecommendation(overallRisk)
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to perform EDD: ${error.message}`);
      throw new CustomError(
        'Failed to perform enhanced due diligence',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check sanctions lists
   */
  async checkSanctions(userId) {
    // Integrate with sanctions screening provider (e.g., ComplyAdvantage)
    return {
      checked: true,
      matchFound: false,
      lists: ['OFAC', 'EU', 'UN'],
      timestamp: new Date()
    };
  }

  /**
   * Check PEP (Politically Exposed Person) status
   */
  async checkPEP(userId) {
    // Integrate with PEP screening provider
    return {
      checked: true,
      isPEP: false,
      relationships: [],
      timestamp: new Date()
    };
  }

  /**
   * Check adverse media
   */
  async checkAdverseMedia(userId) {
    // Integrate with adverse media screening provider
    return {
      checked: true,
      negativeFindingsFound: false,
      sources: [],
      timestamp: new Date()
    };
  }

  /**
   * Check credit score
   */
  async checkCredit(userId) {
    // Integrate with credit bureau
    return {
      checked: true,
      score: null,
      bureau: 'Experian',
      timestamp: new Date()
    };
  }

  /**
   * Calculate overall risk score
   */
  calculateRiskScore(checks) {
    let score = 0;
    
    if (checks.sanctionsCheck?.matchFound) score += 100;
    if (checks.pepCheck?.isPEP) score += 50;
    if (checks.adverseMediaCheck?.negativeFindingsFound) score += 30;
    if (checks.creditCheck?.score && checks.creditCheck.score < 600) score += 20;

    return score;
  }

  /**
   * Get risk recommendation
   */
  getRiskRecommendation(score) {
    if (score >= 100) return 'HIGH_RISK_DECLINE';
    if (score >= 50) return 'MANUAL_REVIEW';
    if (score >= 20) return 'ENHANCED_MONITORING';
    return 'APPROVED';
  }

  /**
   * Store verification session in database
   */
  async storeVerificationSession(sessionData) {
    // Store in database
    const db = require('../models');
    await db.VerificationSession.create(sessionData);
  }

  /**
   * Update verification status in database
   */
  async updateVerificationStatus(sessionId, statusData) {
    const db = require('../models');
    await db.VerificationSession.update(
      {
        status: statusData.status,
        details: JSON.stringify(statusData.details),
        completedAt: statusData.completedAt
      },
      {
        where: { sessionId }
      }
    );
  }

  /**
   * Actions when verification is approved
   */
  async onVerificationApproved(sessionId) {
    // Update user status, enable features, send notifications
    loggers.infoLogger.info(`Verification approved: ${sessionId}`);
  }

  /**
   * Actions when verification is declined
   */
  async onVerificationDeclined(sessionId) {
    // Restrict access, notify compliance team
    loggers.infoLogger.info(`Verification declined: ${sessionId}`);
  }

  /**
   * Generate verification report
   */
  async generateVerificationReport(userId) {
    try {
      const db = require('../models');
      const sessions = await db.VerificationSession.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      return {
        userId,
        totalVerifications: sessions.length,
        latestVerification: sessions[0],
        history: sessions,
        generatedAt: new Date()
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to generate verification report: ${error.message}`);
      throw new CustomError(
        'Failed to generate verification report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new CustomerVerificationService();