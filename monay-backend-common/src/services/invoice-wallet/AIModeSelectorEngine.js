/**
 * AI Mode Selector Engine
 * Intelligent wallet mode selection using machine learning
 *
 * @module AIModeSelectorEngine
 * @description Determines optimal wallet mode (ephemeral/persistent/adaptive) based on transaction parameters
 */

import logger from '../logger';

class AIModeSelectorEngine {
  constructor() {
    // Thresholds for mode selection
    this.thresholds = {
      ephemeral: 0.3,
      adaptive: 0.7,
      persistent: 0.7
    };

    // Feature weights for scoring
    this.weights = {
      amount: 0.25,
      customerHistory: 0.20,
      riskScore: 0.20,
      transactionType: 0.15,
      isRecurring: 0.20
    };
  }

  /**
   * Determine optimal wallet mode using AI scoring
   *
   * @param {Object} params - Transaction parameters
   * @returns {Promise<Object>} Mode decision with score and reasoning
   */
  async determineMode(params) {
    try {
      const score = await this.calculatePersistenceScore(params);
      let mode, reasoning;

      if (score < this.thresholds.ephemeral) {
        mode = 'ephemeral';
        reasoning = this.generateEphemeralReasoning(params, score);
      } else if (score >= this.thresholds.persistent) {
        mode = 'persistent';
        reasoning = this.generatePersistentReasoning(params, score);
      } else {
        mode = 'adaptive';
        reasoning = this.generateAdaptiveReasoning(params, score);
      }

      logger.info('AI mode selection completed', {
        mode,
        score,
        params: {
          amount: params.amount,
          riskScore: params.riskScore,
          isRecurring: params.isRecurring
        }
      });

      return {
        mode,
        score: Math.round(score * 100) / 100,
        reasoning,
        confidence: this.calculateConfidence(score, mode),
        features: this.extractFeatures(params)
      };
    } catch (error) {
      logger.error('AI mode selection failed', error);
      // Default to ephemeral for safety
      return {
        mode: 'ephemeral',
        score: 0,
        reasoning: 'Default selection due to AI error',
        confidence: 0.5
      };
    }
  }

  /**
   * Calculate persistence score (0-1)
   * Higher score = more likely to need persistent wallet
   *
   * @param {Object} params - Transaction parameters
   * @returns {Promise<number>} Persistence score
   */
  async calculatePersistenceScore(params) {
    let score = 0;

    // Amount factor (normalized)
    const amountScore = this.normalizeAmount(params.amount);
    score += amountScore * this.weights.amount;

    // Customer history factor
    const historyScore = await this.evaluateCustomerHistory(params.customerProfile);
    score += historyScore * this.weights.customerHistory;

    // Risk score factor (inverted - lower risk = higher persistence)
    const riskScore = 1 - (params.riskScore || 50) / 100;
    score += riskScore * this.weights.riskScore;

    // Transaction type factor
    const typeScore = this.evaluateTransactionType(params.transactionType);
    score += typeScore * this.weights.transactionType;

    // Recurring payment factor
    const recurringScore = params.isRecurring ? 1 : 0;
    score += recurringScore * this.weights.isRecurring;

    // Apply business rules
    score = this.applyBusinessRules(score, params);

    return Math.max(0, Math.min(1, score)); // Clamp to [0, 1]
  }

  /**
   * Normalize transaction amount to 0-1 scale
   *
   * @param {number} amount - Transaction amount
   * @returns {number} Normalized score
   */
  normalizeAmount(amount) {
    if (!amount) return 0.5;

    // Logarithmic scaling for better distribution
    const logAmount = Math.log10(amount + 1);
    const maxLog = Math.log10(1000000); // $1M as upper bound

    // Invert: smaller amounts = higher persistence score (consumer-like)
    return 1 - Math.min(logAmount / maxLog, 1);
  }

  /**
   * Evaluate customer history for persistence scoring
   *
   * @param {Object} customerProfile - Customer data
   * @returns {Promise<number>} History score
   */
  async evaluateCustomerHistory(customerProfile) {
    if (!customerProfile) return 0.3; // Unknown customer = low score

    let score = 0.5; // Base score

    // Previous successful transactions
    if (customerProfile.previousTransactions > 0) {
      score += Math.min(customerProfile.previousTransactions / 10, 0.3);
    }

    // Customer age (account age in days)
    if (customerProfile.accountAge) {
      const ageDays = customerProfile.accountAge;
      score += Math.min(ageDays / 365, 0.2); // Max 0.2 for 1+ year
    }

    // Verification status
    if (customerProfile.kycVerified) {
      score += 0.2;
    }

    // Payment history
    if (customerProfile.paymentSuccessRate) {
      score += customerProfile.paymentSuccessRate * 0.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Evaluate transaction type for persistence scoring
   *
   * @param {string} transactionType - Type of transaction
   * @returns {number} Type score
   */
  evaluateTransactionType(transactionType) {
    const typeScores = {
      'subscription': 1.0,
      'recurring': 0.9,
      'consumer_purchase': 0.8,
      'service_payment': 0.6,
      'b2b_invoice': 0.3,
      'high_value_transfer': 0.2,
      'one_time': 0.1
    };

    return typeScores[transactionType] || 0.5;
  }

  /**
   * Apply business rules to adjust score
   *
   * @param {number} score - Current score
   * @param {Object} params - Transaction parameters
   * @returns {number} Adjusted score
   */
  applyBusinessRules(score, params) {
    // Rule 1: Force ephemeral for very high amounts
    if (params.amount > 100000) {
      score = Math.min(score, 0.2);
    }

    // Rule 2: Force ephemeral for high-risk
    if (params.riskScore > 80) {
      score = Math.min(score, 0.15);
    }

    // Rule 3: Boost persistent for verified recurring
    if (params.isRecurring && params.customerProfile?.kycVerified) {
      score = Math.max(score, 0.8);
    }

    // Rule 4: Force ephemeral for sanctioned countries
    if (params.customerProfile?.country && this.isSanctionedCountry(params.customerProfile.country)) {
      score = 0.1;
    }

    return score;
  }

  /**
   * Calculate confidence level for the decision
   *
   * @param {number} score - Persistence score
   * @param {string} mode - Selected mode
   * @returns {number} Confidence level (0-1)
   */
  calculateConfidence(score, mode) {
    let distance;

    switch (mode) {
      case 'ephemeral':
        distance = this.thresholds.ephemeral - score;
        break;
      case 'persistent':
        distance = score - this.thresholds.persistent;
        break;
      case 'adaptive':
        distance = Math.min(
          Math.abs(score - 0.5),
          score - this.thresholds.ephemeral,
          this.thresholds.persistent - score
        );
        break;
      default:
        distance = 0;
    }

    // Convert distance to confidence (larger distance = higher confidence)
    return Math.min(Math.max(distance * 2, 0.5), 1);
  }

  /**
   * Extract features for model training/analysis
   *
   * @param {Object} params - Transaction parameters
   * @returns {Object} Feature vector
   */
  extractFeatures(params) {
    return {
      amount_normalized: this.normalizeAmount(params.amount),
      risk_score: (params.riskScore || 50) / 100,
      is_recurring: params.isRecurring ? 1 : 0,
      has_customer_history: params.customerProfile ? 1 : 0,
      kyc_verified: params.customerProfile?.kycVerified ? 1 : 0,
      transaction_count: params.customerProfile?.previousTransactions || 0,
      account_age_days: params.customerProfile?.accountAge || 0,
      transaction_type: params.transactionType || 'unknown'
    };
  }

  /**
   * Generate reasoning for ephemeral mode selection
   *
   * @param {Object} params - Transaction parameters
   * @param {number} score - Persistence score
   * @returns {string} Reasoning text
   */
  generateEphemeralReasoning(params, score) {
    const reasons = [];

    if (params.amount > 10000) {
      reasons.push('High-value transaction requiring maximum security');
    }

    if (params.riskScore > 60) {
      reasons.push('Elevated risk profile detected');
    }

    if (!params.customerProfile) {
      reasons.push('New customer without transaction history');
    }

    if (!params.isRecurring) {
      reasons.push('One-time payment structure');
    }

    return reasons.join('. ') || 'Ephemeral wallet recommended for enhanced security';
  }

  /**
   * Generate reasoning for persistent mode selection
   *
   * @param {Object} params - Transaction parameters
   * @param {number} score - Persistence score
   * @returns {string} Reasoning text
   */
  generatePersistentReasoning(params, score) {
    const reasons = [];

    if (params.isRecurring) {
      reasons.push('Recurring payment requires persistent wallet');
    }

    if (params.customerProfile?.previousTransactions > 5) {
      reasons.push('Established customer with transaction history');
    }

    if (params.amount < 1000) {
      reasons.push('Consumer-level transaction amount');
    }

    if (params.customerProfile?.kycVerified) {
      reasons.push('KYC-verified customer');
    }

    return reasons.join('. ') || 'Persistent wallet recommended for customer convenience';
  }

  /**
   * Generate reasoning for adaptive mode selection
   *
   * @param {Object} params - Transaction parameters
   * @param {number} score - Persistence score
   * @returns {string} Reasoning text
   */
  generateAdaptiveReasoning(params, score) {
    const reasons = [];

    reasons.push('Transaction parameters suggest potential for both modes');

    if (params.customerProfile?.previousTransactions > 0 && params.customerProfile?.previousTransactions < 5) {
      reasons.push('Customer showing initial engagement');
    }

    if (params.amount >= 1000 && params.amount <= 10000) {
      reasons.push('Medium-value transaction');
    }

    reasons.push('Adaptive mode allows flexibility based on payment outcome');

    return reasons.join('. ');
  }

  /**
   * Check if country is sanctioned
   *
   * @param {string} country - Country code
   * @returns {boolean} Is sanctioned
   */
  isSanctionedCountry(country) {
    const sanctionedCountries = [
      'IR', 'KP', 'SY', 'CU', 'VE', 'RU', 'MM', 'SD', 'ZW'
    ];
    return sanctionedCountries.includes(country);
  }

  /**
   * Analyze transaction for real-time risk
   *
   * @param {Object} transaction - Transaction data
   * @returns {Promise<Object>} Risk analysis
   */
  async analyzeTransaction(transaction) {
    const riskFactors = {
      velocity: await this.checkVelocity(transaction),
      pattern: await this.checkPattern(transaction),
      compliance: await this.checkCompliance(transaction)
    };

    const overallRisk = (
      riskFactors.velocity * 0.3 +
      riskFactors.pattern * 0.3 +
      riskFactors.compliance * 0.4
    );

    return {
      score: overallRisk,
      factors: riskFactors,
      recommendation: overallRisk > 0.7 ? 'block' : overallRisk > 0.4 ? 'review' : 'approve'
    };
  }

  /**
   * Check transaction velocity
   *
   * @param {Object} transaction - Transaction data
   * @returns {Promise<number>} Velocity risk score
   */
  async checkVelocity(transaction) {
    // Simplified velocity check
    // In production, check against historical data
    return 0.3; // Placeholder
  }

  /**
   * Check transaction pattern
   *
   * @param {Object} transaction - Transaction data
   * @returns {Promise<number>} Pattern risk score
   */
  async checkPattern(transaction) {
    // Simplified pattern check
    // In production, use ML model for anomaly detection
    return 0.2; // Placeholder
  }

  /**
   * Check compliance requirements
   *
   * @param {Object} transaction - Transaction data
   * @returns {Promise<number>} Compliance risk score
   */
  async checkCompliance(transaction) {
    // Simplified compliance check
    // In production, check against sanctions lists, etc.
    return 0.1; // Placeholder
  }

  /**
   * Get recommended mode based on persistence score
   *
   * @param {number} score - Persistence score
   * @returns {string} Recommended mode
   */
  getRecommendedMode(score) {
    if (score < this.thresholds.ephemeral) {
      return 'ephemeral';
    } else if (score >= this.thresholds.persistent) {
      return 'persistent';
    } else {
      return 'adaptive';
    }
  }

  /**
   * Record decision for model training
   *
   * @param {Object} decision - Decision data
   * @returns {Promise<void>}
   */
  async recordDecision(decision) {
    try {
      // Log for future model training
      logger.info('AI decision recorded', {
        mode: decision.mode,
        score: decision.score,
        features: decision.features,
        outcome: decision.outcome
      });

      // In production, store in database for model improvement
    } catch (error) {
      logger.error('Failed to record AI decision', error);
    }
  }
}

export default AIModeSelectorEngine;