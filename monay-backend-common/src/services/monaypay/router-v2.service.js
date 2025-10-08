/**
 * MonayPay Router v2 - Intelligent Rail Selection with Scoring
 * Implements dual-rail orchestration (fiat ↔ crypto)
 * Based on monay_wallet_redesign.md specifications
 */

import { getCrossRiverClient } from '../providers/cross-river/client-mock.js';
import { getBitGoClient } from '../providers/bitgo/client-mock.js';
import BusinessRuleEngine from '../business-rule-engine/index.js';

export class RouterV2 {
  constructor(config = {}) {
    // Provider clients
    this.crossRiver = getCrossRiverClient();
    this.bitgo = getBitGoClient();

    // Scoring weights (configurable)
    this.weights = {
      cost: config.weightCost || 0.30,
      time: config.weightTime || 0.25,
      fx: config.weightFx || 0.15,
      liquidity: config.weightLiquidity || 0.10,
      policy: config.weightPolicy || 0.15,
      reliability: config.weightReliability || 0.05
    };

    // Rail configurations
    this.rails = {
      // Domestic fiat rails
      ach: {
        provider: 'crossRiver',
        type: 'fiat',
        domestic: true,
        cost: 0.15,
        timeMinutes: 1440, // 1 day
        reliability: 0.99,
        limits: { min: 0.01, max: 100000 }
      },
      fednow: {
        provider: 'crossRiver',
        type: 'fiat',
        domestic: true,
        cost: 0.50,
        timeMinutes: 0.5, // 30 seconds
        reliability: 0.98,
        limits: { min: 0.01, max: 100000 }
      },
      rtp: {
        provider: 'crossRiver',
        type: 'fiat',
        domestic: true,
        cost: 0.45,
        timeMinutes: 0.5, // 30 seconds
        reliability: 0.97,
        limits: { min: 0.01, max: 100000 }
      },
      wire: {
        provider: 'crossRiver',
        type: 'fiat',
        domestic: false,
        cost: 25.00,
        timeMinutes: 2880, // 2 days
        reliability: 0.99,
        limits: { min: 100, max: 10000000 }
      },

      // Crypto rails
      usdc_ethereum: {
        provider: 'bitgo',
        type: 'crypto',
        domestic: null, // borderless
        cost: 2.50, // gas estimate
        timeMinutes: 5,
        reliability: 0.95,
        limits: { min: 0.01, max: 10000000 }
      },
      usdc_solana: {
        provider: 'bitgo',
        type: 'crypto',
        domestic: null,
        cost: 0.05,
        timeMinutes: 1,
        reliability: 0.96,
        limits: { min: 0.01, max: 10000000 }
      },
      pyusd: {
        provider: 'bitgo',
        type: 'crypto',
        domestic: null,
        cost: 1.50,
        timeMinutes: 5,
        reliability: 0.94,
        limits: { min: 0.01, max: 1000000 }
      }
    };

    // Circuit breaker states
    this.circuitBreakers = new Map();

    // BRE integration
    this.bre = new BusinessRuleEngine();
  }

  /**
   * Create a payment intent and select optimal rail
   */
  async createIntent(params) {
    const {
      amount,
      currency = 'USD',
      source,
      destination,
      type = 'transfer', // transfer, invoice, request-to-pay
      metadata = {}
    } = params;

    // Generate intent ID
    const intentId = `intent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get eligible rails
    const eligibleRails = await this.getEligibleRails(params);

    // Score each rail
    const scores = await this.scoreRails(eligibleRails, params);

    // Select best rail
    const selectedRail = this.selectBestRail(scores);

    // Get fallback chain
    const fallbackRails = this.getFallbackChain(scores, selectedRail);

    // Create intent record
    const intent = {
      id: intentId,
      amount,
      currency,
      source,
      destination,
      type,
      selectedRail: selectedRail.name,
      fallbackRails,
      scoreBreakdown: selectedRail.scoreBreakdown,
      quote: await this.getQuote(selectedRail, params),
      estimatedSettlement: this.getEstimatedSettlement(selectedRail),
      status: 'created',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 min expiry
      metadata
    };

    // Store intent (in production, this would go to database)
    this.storeIntent(intent);

    return intent;
  }

  /**
   * Execute a payment intent
   */
  async executeIntent(intentId) {
    const intent = await this.getIntent(intentId);

    if (!intent) {
      throw new Error(`Intent ${intentId} not found`);
    }

    if (intent.status !== 'created') {
      throw new Error(`Intent ${intentId} is not executable (status: ${intent.status})`);
    }

    if (new Date(intent.expiresAt) < new Date()) {
      throw new Error(`Intent ${intentId} has expired`);
    }

    // Try primary rail
    let result = await this.executeOnRail(intent.selectedRail, intent);

    // If primary fails, try fallbacks
    if (!result.success && intent.fallbackRails.length > 0) {
      for (const fallbackRail of intent.fallbackRails) {
        console.log(`Primary rail ${intent.selectedRail} failed, trying ${fallbackRail}`);
        result = await this.executeOnRail(fallbackRail, intent);
        if (result.success) {
          intent.selectedRail = fallbackRail; // Update to successful rail
          break;
        }
      }
    }

    // Update intent status
    intent.status = result.success ? 'executed' : 'failed';
    intent.executionResult = result;
    intent.executedAt = new Date().toISOString();

    this.storeIntent(intent);

    return {
      intentId,
      success: result.success,
      transactionId: result.transactionId,
      rail: intent.selectedRail,
      status: intent.status,
      result
    };
  }

  /**
   * Get eligible rails based on transaction parameters
   */
  async getEligibleRails(params) {
    const { amount, source, destination, currency } = params;
    const eligible = [];

    for (const [name, rail] of Object.entries(this.rails)) {
      // Check amount limits
      if (amount < rail.limits.min || amount > rail.limits.max) {
        continue;
      }

      // Check circuit breaker
      if (this.isCircuitOpen(name)) {
        continue;
      }

      // Check BRE compliance
      const breCheck = await this.checkBRECompliance(name, params);
      if (!breCheck.allowed) {
        continue;
      }

      // Check domestic/international
      if (this.isCrossBorder(source, destination) && rail.domestic === true) {
        continue;
      }

      eligible.push({ name, ...rail, breCompliance: breCheck });
    }

    return eligible;
  }

  /**
   * Score rails using the scoring algorithm
   * score(rail) = w_cost·f_cost + w_time·f_time + w_fx·f_fx + w_liq·f_liq + w_policy·f_policy + w_reliab·f_reliab
   */
  async scoreRails(rails, params) {
    const scores = [];

    for (const rail of rails) {
      const scoreBreakdown = {
        cost: this.scoreCost(rail, params.amount),
        time: this.scoreTime(rail),
        fx: this.scoreFx(rail, params),
        liquidity: await this.scoreLiquidity(rail, params),
        policy: this.scorePolicy(rail),
        reliability: this.scoreReliability(rail)
      };

      const totalScore =
        this.weights.cost * scoreBreakdown.cost +
        this.weights.time * scoreBreakdown.time +
        this.weights.fx * scoreBreakdown.fx +
        this.weights.liquidity * scoreBreakdown.liquidity +
        this.weights.policy * scoreBreakdown.policy +
        this.weights.reliability * scoreBreakdown.reliability;

      scores.push({
        ...rail,
        scoreBreakdown,
        totalScore
      });
    }

    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Score functions (0-1 scale, higher is better)
   */
  scoreCost(rail, amount) {
    // Convert cost to percentage of transaction
    const costPercent = (rail.cost / amount) * 100;

    // Inverse scoring - lower cost = higher score
    if (costPercent < 0.1) return 1.0;
    if (costPercent < 0.5) return 0.9;
    if (costPercent < 1.0) return 0.7;
    if (costPercent < 2.0) return 0.5;
    if (costPercent < 5.0) return 0.3;
    return 0.1;
  }

  scoreTime(rail) {
    // Faster = higher score
    if (rail.timeMinutes < 1) return 1.0;      // < 1 min
    if (rail.timeMinutes < 5) return 0.9;      // < 5 min
    if (rail.timeMinutes < 30) return 0.7;     // < 30 min
    if (rail.timeMinutes < 60) return 0.5;     // < 1 hour
    if (rail.timeMinutes < 1440) return 0.3;   // < 1 day
    return 0.1;
  }

  scoreFx(rail, params) {
    // If not cross-border, FX doesn't matter
    if (!this.isCrossBorder(params.source, params.destination)) {
      return 1.0;
    }

    // For cross-border, prefer stablecoins (no FX spread)
    if (rail.type === 'crypto') return 0.9;

    // Fiat rails have FX spread
    return 0.5;
  }

  async scoreLiquidity(rail, params) {
    // Check available liquidity
    // In production, this would check actual liquidity pools

    if (rail.type === 'crypto') {
      // Check BitGo wallet balance
      return 0.8; // Mock: assume good liquidity
    }

    // Check Cross River FBO balance
    return 0.9; // Mock: assume good liquidity
  }

  scorePolicy(rail) {
    // BRE compliance already checked in eligibility
    // This scores based on policy preference
    return rail.breCompliance?.score || 0.8;
  }

  scoreReliability(rail) {
    // Use historical reliability
    return rail.reliability || 0.95;
  }

  /**
   * Execute payment on selected rail
   */
  async executeOnRail(railName, intent) {
    const rail = this.rails[railName];

    try {
      let result;

      switch (railName) {
        case 'ach':
          result = await this.crossRiver.createACHTransfer({
            amount: intent.amount,
            recipientAccount: intent.destination.account,
            recipientRouting: intent.destination.routing,
            recipientName: intent.destination.name,
            description: intent.metadata.description || 'Transfer'
          });
          break;

        case 'fednow':
          result = await this.crossRiver.createFedNowTransfer({
            amount: intent.amount,
            recipientAccount: intent.destination.account,
            recipientRouting: intent.destination.routing,
            recipientName: intent.destination.name
          });
          break;

        case 'rtp':
          result = await this.crossRiver.createRTPTransfer({
            amount: intent.amount,
            recipientAccount: intent.destination.account,
            recipientRouting: intent.destination.routing,
            recipientName: intent.destination.name
          });
          break;

        case 'wire':
          result = await this.crossRiver.createWireTransfer({
            amount: intent.amount,
            recipientAccount: intent.destination.account,
            recipientBank: intent.destination.bank,
            swiftCode: intent.destination.swift,
            recipientName: intent.destination.name
          });
          break;

        case 'usdc_ethereum':
        case 'usdc_solana':
        case 'pyusd':
          result = await this.bitgo.createTransfer({
            sourceWalletId: intent.source.walletId,
            destinationAddress: intent.destination.address,
            amount: intent.amount,
            coin: railName.split('_')[0],
            memo: intent.metadata.memo
          });
          break;

        default:
          throw new Error(`Unknown rail: ${railName}`);
      }

      // Update circuit breaker on success
      this.updateCircuitBreaker(railName, true);

      return {
        success: true,
        transactionId: result.transactionId || result.transferId,
        rail: railName,
        details: result
      };

    } catch (error) {
      // Update circuit breaker on failure
      this.updateCircuitBreaker(railName, false);

      return {
        success: false,
        error: error.message,
        rail: railName
      };
    }
  }

  /**
   * Helper functions
   */
  selectBestRail(scores) {
    return scores[0]; // Already sorted by score
  }

  getFallbackChain(scores, selectedRail) {
    return scores
      .filter(rail => rail.name !== selectedRail.name)
      .slice(0, 2) // Take top 2 fallbacks
      .map(rail => rail.name);
  }

  getQuote(rail, params) {
    return {
      amount: params.amount,
      currency: params.currency,
      fee: rail.cost,
      total: params.amount + rail.cost,
      estimatedTime: `${rail.timeMinutes} minutes`,
      provider: rail.provider
    };
  }

  getEstimatedSettlement(rail) {
    const settlementTime = Date.now() + (rail.timeMinutes * 60 * 1000);
    return new Date(settlementTime).toISOString();
  }

  isCrossBorder(source, destination) {
    // Simplified check - in production would use actual country codes
    return source.country !== destination.country;
  }

  async checkBRECompliance(railName, params) {
    // Check with Business Rule Engine
    // In production, this would make actual BRE call
    return {
      allowed: true,
      score: 0.8,
      rules: ['AML_CHECK', 'SANCTIONS_CHECK', 'VELOCITY_CHECK']
    };
  }

  /**
   * Circuit breaker management
   */
  isCircuitOpen(railName) {
    const breaker = this.circuitBreakers.get(railName);
    if (!breaker) return false;

    // Circuit opens after 3 consecutive failures
    return breaker.consecutiveFailures >= 3;
  }

  updateCircuitBreaker(railName, success) {
    let breaker = this.circuitBreakers.get(railName);

    if (!breaker) {
      breaker = { consecutiveFailures: 0, lastFailure: null };
      this.circuitBreakers.set(railName, breaker);
    }

    if (success) {
      breaker.consecutiveFailures = 0;
    } else {
      breaker.consecutiveFailures++;
      breaker.lastFailure = new Date();
    }

    // Auto-reset circuit after 5 minutes
    if (breaker.lastFailure) {
      const timeSinceFailure = Date.now() - breaker.lastFailure.getTime();
      if (timeSinceFailure > 300000) { // 5 minutes
        breaker.consecutiveFailures = 0;
      }
    }
  }

  /**
   * Intent storage (in-memory for now, database in production)
   */
  intents = new Map();

  storeIntent(intent) {
    this.intents.set(intent.id, intent);
  }

  async getIntent(intentId) {
    return this.intents.get(intentId);
  }
}

// Singleton instance
let instance;

export function getRouter() {
  if (!instance) {
    instance = new RouterV2();
  }
  return instance;
}

export default RouterV2;