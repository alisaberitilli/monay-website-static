const { EventEmitter } = require('events');
const { Pool } = require('pg');
const crypto = require('crypto');

class PredictiveAnalyticsEngine extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);
    this.modelCache = new Map();
    this.predictionQueue = [];
    this.isProcessing = false;
  }

  // Customer Lifetime Value Prediction
  async predictCustomerLTV(userId, horizon = '365_days') {
    try {
      const client = await this.pool.connect();

      try {
        // Get customer historical data
        const customerData = await this.getCustomerData(client, userId);

        // Calculate LTV components
        const avgOrderValue = await this.calculateAverageOrderValue(client, userId);
        const purchaseFrequency = await this.calculatePurchaseFrequency(client, userId);
        const customerLifespan = await this.estimateCustomerLifespan(client, userId);
        const retentionRate = await this.calculateRetentionRate(client, userId);

        // Generate feature vector
        const features = {
          account_age_days: customerData.account_age_days,
          total_transactions: customerData.total_transactions,
          total_spent: customerData.total_spent,
          avg_transaction_amount: avgOrderValue,
          transaction_frequency: purchaseFrequency,
          days_since_last_transaction: customerData.days_since_last_transaction,
          product_categories_purchased: customerData.product_categories_purchased,
          customer_segment: customerData.customer_segment,
          engagement_score: customerData.engagement_score,
          support_tickets_count: customerData.support_tickets_count,
          retention_probability: retentionRate
        };

        // Calculate LTV predictions
        const predictions = {
          ltv_30_days: avgOrderValue * purchaseFrequency * 1 * retentionRate,
          ltv_90_days: avgOrderValue * purchaseFrequency * 3 * Math.pow(retentionRate, 3),
          ltv_180_days: avgOrderValue * purchaseFrequency * 6 * Math.pow(retentionRate, 6),
          ltv_365_days: avgOrderValue * purchaseFrequency * 12 * Math.pow(retentionRate, 12),
          ltv_lifetime: avgOrderValue * purchaseFrequency * customerLifespan * Math.pow(retentionRate, customerLifespan)
        };

        // Calculate confidence intervals
        const confidenceLevel = this.calculateConfidenceLevel(customerData);
        const lowerBound = predictions[`ltv_${horizon}`] * (1 - (1 - confidenceLevel));
        const upperBound = predictions[`ltv_${horizon}`] * (1 + (1 - confidenceLevel));

        // Determine customer segment
        const segment = this.determineCustomerSegment(predictions.ltv_365_days);

        // Store prediction
        await client.query(`
          INSERT INTO customer_ltv_predictions (
            user_id, ltv_30_days, ltv_90_days, ltv_180_days, ltv_365_days,
            ltv_lifetime, ltv_lower_bound, ltv_upper_bound, confidence_level,
            customer_segment, value_tier, prediction_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE)
          ON CONFLICT (user_id, prediction_date)
          DO UPDATE SET
            ltv_30_days = EXCLUDED.ltv_30_days,
            ltv_90_days = EXCLUDED.ltv_90_days,
            ltv_180_days = EXCLUDED.ltv_180_days,
            ltv_365_days = EXCLUDED.ltv_365_days,
            ltv_lifetime = EXCLUDED.ltv_lifetime,
            updated_at = CURRENT_TIMESTAMP
        `, [
          userId,
          predictions.ltv_30_days,
          predictions.ltv_90_days,
          predictions.ltv_180_days,
          predictions.ltv_365_days,
          predictions.ltv_lifetime,
          lowerBound,
          upperBound,
          confidenceLevel,
          segment,
          this.getValueTier(predictions.ltv_365_days)
        ]);

        this.emit('ltv_predicted', {
          userId,
          predictions,
          confidence: confidenceLevel,
          segment
        });

        return {
          success: true,
          predictions,
          confidence: confidenceLevel,
          segment,
          valueTier: this.getValueTier(predictions.ltv_365_days),
          features
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'predictCustomerLTV', error });
      throw error;
    }
  }

  // Churn Prediction
  async predictChurnRisk(userId) {
    try {
      const client = await this.pool.connect();

      try {
        // Get behavioral indicators
        const indicators = await this.getChurnIndicators(client, userId);

        // Calculate churn risk components
        const engagementRisk = this.calculateEngagementRisk(indicators);
        const transactionRisk = this.calculateTransactionDeclineRisk(indicators);
        const supportRisk = this.calculateSupportInteractionRisk(indicators);
        const competitorRisk = await this.calculateCompetitorActivityRisk(client, userId);

        // Combine risk scores
        const churnProbability = (
          engagementRisk * 0.3 +
          transactionRisk * 0.35 +
          supportRisk * 0.2 +
          competitorRisk * 0.15
        );

        // Identify retention opportunities
        const retentionActions = this.identifyRetentionActions(indicators, churnProbability);

        // Store prediction
        await client.query(`
          INSERT INTO predictive_analytics (
            user_id, prediction_type, prediction_value, prediction_probability,
            confidence_score, prediction_horizon_days, prediction_date,
            feature_values, metadata
          ) VALUES ($1, 'churn', $2, $3, $4, 30, CURRENT_DATE, $5, $6)
        `, [
          userId,
          churnProbability > 0.5 ? 1 : 0,
          churnProbability,
          this.calculateChurnConfidence(indicators),
          JSON.stringify(indicators),
          JSON.stringify({ retention_actions: retentionActions })
        ]);

        this.emit('churn_predicted', {
          userId,
          churnProbability,
          riskLevel: this.getChurnRiskLevel(churnProbability),
          retentionActions
        });

        return {
          success: true,
          churnProbability,
          riskLevel: this.getChurnRiskLevel(churnProbability),
          riskFactors: {
            engagement: engagementRisk,
            transaction: transactionRisk,
            support: supportRisk,
            competitor: competitorRisk
          },
          retentionActions,
          estimatedLostRevenue: await this.calculatePotentialLostRevenue(client, userId)
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'predictChurnRisk', error });
      throw error;
    }
  }

  // Credit Risk Assessment
  async assessCreditRisk(userId, requestedAmount) {
    try {
      const client = await this.pool.connect();

      try {
        // Get credit indicators
        const creditHistory = await this.getCreditHistory(client, userId);
        const financialProfile = await this.getFinancialProfile(client, userId);

        // Calculate risk components
        const paymentHistoryScore = this.calculatePaymentHistoryScore(creditHistory);
        const debtToIncomeRatio = this.calculateDebtToIncomeRatio(financialProfile);
        const utilizationRate = this.calculateCreditUtilization(financialProfile);
        const accountStability = this.calculateAccountStability(creditHistory);

        // Generate credit score
        const creditScore = Math.round(
          300 + (
            paymentHistoryScore * 0.35 +
            (1 - debtToIncomeRatio) * 0.30 +
            (1 - utilizationRate) * 0.15 +
            accountStability * 0.20
          ) * 550
        );

        // Calculate approval probability
        const approvalProbability = this.calculateApprovalProbability(
          creditScore,
          requestedAmount,
          financialProfile
        );

        // Determine credit limit
        const recommendedLimit = this.calculateRecommendedCreditLimit(
          creditScore,
          financialProfile
        );

        // Generate risk report
        const riskReport = {
          creditScore,
          riskLevel: this.getCreditRiskLevel(creditScore),
          approvalProbability,
          recommendedLimit,
          maxApprovedAmount: recommendedLimit * 0.8,
          requiredCollateral: requestedAmount > recommendedLimit ? requestedAmount - recommendedLimit : 0,
          interestRate: this.calculateInterestRate(creditScore),
          factors: {
            paymentHistory: paymentHistoryScore,
            debtToIncome: debtToIncomeRatio,
            creditUtilization: utilizationRate,
            accountStability: accountStability
          }
        };

        // Store assessment
        await client.query(`
          INSERT INTO predictive_analytics (
            user_id, prediction_type, prediction_value, prediction_probability,
            confidence_score, prediction_horizon_days, prediction_date,
            feature_values, metadata
          ) VALUES ($1, 'credit_risk', $2, $3, $4, 90, CURRENT_DATE, $5, $6)
        `, [
          userId,
          creditScore,
          approvalProbability,
          this.calculateCreditConfidence(creditHistory),
          JSON.stringify(financialProfile),
          JSON.stringify(riskReport)
        ]);

        this.emit('credit_assessed', {
          userId,
          creditScore,
          approvalProbability,
          recommendedLimit
        });

        return {
          success: true,
          ...riskReport,
          recommendations: this.generateCreditRecommendations(creditScore, financialProfile)
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'assessCreditRisk', error });
      throw error;
    }
  }

  // Spending Pattern Prediction
  async predictSpendingPatterns(userId, forecastDays = 30) {
    try {
      const client = await this.pool.connect();

      try {
        // Get historical spending data
        const spendingHistory = await this.getSpendingHistory(client, userId);

        // Analyze patterns
        const seasonalPatterns = this.analyzeSeasonalPatterns(spendingHistory);
        const categoryTrends = this.analyzeCategoryTrends(spendingHistory);
        const dayOfWeekPatterns = this.analyzeDayOfWeekPatterns(spendingHistory);

        // Generate forecast
        const forecast = [];
        const today = new Date();

        for (let i = 1; i <= forecastDays; i++) {
          const forecastDate = new Date(today);
          forecastDate.setDate(today.getDate() + i);

          const dayOfWeek = forecastDate.getDay();
          const monthDay = forecastDate.getDate();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isPayday = [1, 15].includes(monthDay);

          // Calculate expected spending
          const baseSpending = spendingHistory.daily_average;
          const seasonalAdjustment = seasonalPatterns[forecastDate.getMonth()];
          const dayOfWeekAdjustment = dayOfWeekPatterns[dayOfWeek];
          const paydayMultiplier = isPayday ? 1.5 : 1.0;

          const predictedAmount = baseSpending * seasonalAdjustment * dayOfWeekAdjustment * paydayMultiplier;

          forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            predictedAmount,
            confidence: 0.75 - (i * 0.01), // Confidence decreases with time
            categories: this.predictCategorySpending(categoryTrends, predictedAmount),
            isAnomaly: predictedAmount > baseSpending * 2
          });
        }

        // Calculate spending insights
        const insights = {
          totalPredictedSpending: forecast.reduce((sum, f) => sum + f.predictedAmount, 0),
          averageDailySpending: forecast.reduce((sum, f) => sum + f.predictedAmount, 0) / forecastDays,
          highSpendingDays: forecast.filter(f => f.isAnomaly).map(f => f.date),
          dominantCategories: this.identifyDominantCategories(categoryTrends),
          savingOpportunities: this.identifySavingOpportunities(spendingHistory, forecast)
        };

        // Store prediction
        await client.query(`
          INSERT INTO predictive_analytics (
            user_id, prediction_type, prediction_value, confidence_score,
            prediction_horizon_days, prediction_date, feature_values, metadata
          ) VALUES ($1, 'spending', $2, $3, $4, CURRENT_DATE, $5, $6)
        `, [
          userId,
          insights.totalPredictedSpending,
          0.75,
          forecastDays,
          JSON.stringify(spendingHistory),
          JSON.stringify({ forecast, insights })
        ]);

        return {
          success: true,
          forecast,
          insights,
          recommendations: this.generateSpendingRecommendations(insights)
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'predictSpendingPatterns', error });
      throw error;
    }
  }

  // Next Best Action Prediction
  async predictNextBestAction(userId) {
    try {
      const client = await this.pool.connect();

      try {
        // Get user context
        const userProfile = await this.getUserProfile(client, userId);
        const recentActivity = await this.getRecentActivity(client, userId);
        const productUsage = await this.getProductUsage(client, userId);

        // Score potential actions
        const actions = [];

        // Check for cross-sell opportunities
        if (!productUsage.has_credit_card && userProfile.credit_score > 650) {
          actions.push({
            type: 'cross_sell',
            action: 'offer_credit_card',
            probability: 0.72,
            expectedValue: 120,
            message: 'Pre-approved for premium credit card'
          });
        }

        // Check for limit increase eligibility
        if (userProfile.utilization_rate < 0.3 && userProfile.payment_history_score > 0.9) {
          actions.push({
            type: 'retention',
            action: 'credit_limit_increase',
            probability: 0.85,
            expectedValue: 50,
            message: 'Eligible for credit limit increase'
          });
        }

        // Check for reward redemption
        if (userProfile.loyalty_points > 10000) {
          actions.push({
            type: 'engagement',
            action: 'reward_redemption',
            probability: 0.65,
            expectedValue: 30,
            message: 'Redeem points for exclusive rewards'
          });
        }

        // Check for savings opportunity
        if (userProfile.average_balance > 5000) {
          actions.push({
            type: 'upsell',
            action: 'savings_account',
            probability: 0.58,
            expectedValue: 200,
            message: 'Earn higher interest with savings account'
          });
        }

        // Sort by expected value
        actions.sort((a, b) => (b.probability * b.expectedValue) - (a.probability * a.expectedValue));

        // Take top 3 actions
        const recommendedActions = actions.slice(0, 3);

        // Store recommendations
        await client.query(`
          INSERT INTO ai_recommendations (
            user_id, recommendation_type, recommendations,
            context_data, trigger_event, created_at, expires_at
          ) VALUES ($1, 'action', $2, $3, 'predictive_analysis',
                   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days')
        `, [
          userId,
          JSON.stringify(recommendedActions),
          JSON.stringify({ userProfile, recentActivity })
        ]);

        return {
          success: true,
          recommendedActions,
          userContext: {
            segment: userProfile.customer_segment,
            lifetimeValue: userProfile.lifetime_value,
            engagementLevel: userProfile.engagement_score
          }
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'predictNextBestAction', error });
      throw error;
    }
  }

  // Transaction Volume Forecasting
  async forecastTransactionVolume(enterpriseId, days = 7) {
    try {
      const client = await this.pool.connect();

      try {
        // Get historical transaction data
        const historicalData = await this.getHistoricalTransactionData(client, enterpriseId);

        // Decompose time series
        const trend = this.calculateTrend(historicalData);
        const seasonality = this.calculateSeasonality(historicalData);
        const holidays = await this.getUpcomingHolidays(client);

        // Generate forecast
        const forecast = [];
        const baseDate = new Date();

        for (let i = 1; i <= days; i++) {
          const forecastDate = new Date(baseDate);
          forecastDate.setDate(baseDate.getDate() + i);

          // Calculate components
          const trendComponent = trend.intercept + (trend.slope * i);
          const seasonalComponent = seasonality[forecastDate.getDay()];
          const holidayImpact = this.getHolidayImpact(forecastDate, holidays);

          // Combine components
          const predictedVolume = Math.max(0,
            trendComponent * seasonalComponent * holidayImpact
          );

          // Calculate confidence interval
          const stdDev = this.calculateStandardDeviation(historicalData);
          const confidenceInterval = {
            lower: predictedVolume - (1.96 * stdDev),
            upper: predictedVolume + (1.96 * stdDev)
          };

          forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            predictedVolume: Math.round(predictedVolume),
            confidenceInterval,
            components: {
              trend: trendComponent,
              seasonality: seasonalComponent,
              holiday: holidayImpact
            }
          });
        }

        // Calculate capacity planning metrics
        const capacityMetrics = {
          peakVolume: Math.max(...forecast.map(f => f.predictedVolume)),
          averageVolume: forecast.reduce((sum, f) => sum + f.predictedVolume, 0) / days,
          requiredThroughput: Math.max(...forecast.map(f => f.predictedVolume)) / 86400, // TPS
          recommendedScaling: this.calculateScalingRecommendation(forecast)
        };

        return {
          success: true,
          forecast,
          capacityMetrics,
          accuracy: this.calculateForecastAccuracy(historicalData),
          recommendations: this.generateCapacityRecommendations(capacityMetrics)
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'forecastTransactionVolume', error });
      throw error;
    }
  }

  // Helper methods
  async getCustomerData(client, userId) {
    const result = await client.query(`
      SELECT
        EXTRACT(DAY FROM CURRENT_TIMESTAMP - created_at) as account_age_days,
        COUNT(DISTINCT t.id) as total_transactions,
        SUM(t.amount) as total_spent,
        COUNT(DISTINCT t.merchant_id) as unique_merchants,
        ARRAY_AGG(DISTINCT t.category) as product_categories_purchased,
        EXTRACT(DAY FROM CURRENT_TIMESTAMP - MAX(t.created_at)) as days_since_last_transaction,
        u.customer_segment,
        u.engagement_score,
        COUNT(DISTINCT s.id) as support_tickets_count
      FROM users u
      LEFT JOIN transactions t ON t.user_id = u.id
      LEFT JOIN support_tickets s ON s.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.created_at, u.customer_segment, u.engagement_score
    `, [userId]);

    return result.rows[0];
  }

  async calculateAverageOrderValue(client, userId) {
    const result = await client.query(`
      SELECT AVG(amount) as avg_order_value
      FROM transactions
      WHERE user_id = $1 AND created_at > CURRENT_DATE - INTERVAL '90 days'
    `, [userId]);

    return parseFloat(result.rows[0]?.avg_order_value || 0);
  }

  async calculatePurchaseFrequency(client, userId) {
    const result = await client.query(`
      SELECT
        COUNT(*) / NULLIF(COUNT(DISTINCT DATE(created_at)), 0) as daily_frequency
      FROM transactions
      WHERE user_id = $1 AND created_at > CURRENT_DATE - INTERVAL '90 days'
    `, [userId]);

    return parseFloat(result.rows[0]?.daily_frequency || 0) * 30; // Monthly frequency
  }

  async estimateCustomerLifespan(client, userId) {
    // Simplified estimation based on customer segment
    const result = await client.query(`
      SELECT customer_segment, created_at
      FROM users WHERE id = $1
    `, [userId]);

    const segment = result.rows[0]?.customer_segment;
    const accountAge = (Date.now() - new Date(result.rows[0]?.created_at)) / (1000 * 60 * 60 * 24 * 30);

    // Base lifespan by segment
    const baseLifespan = {
      'premium': 60,
      'regular': 36,
      'basic': 24
    }[segment] || 24;

    // Adjust based on account age
    return Math.max(accountAge, baseLifespan);
  }

  async calculateRetentionRate(client, userId) {
    const result = await client.query(`
      SELECT
        COUNT(DISTINCT DATE_TRUNC('month', created_at)) as active_months,
        MIN(created_at) as first_transaction,
        MAX(created_at) as last_transaction
      FROM transactions
      WHERE user_id = $1
    `, [userId]);

    const data = result.rows[0];
    if (!data.first_transaction) return 0.5;

    const totalMonths = Math.max(1,
      (new Date(data.last_transaction) - new Date(data.first_transaction)) / (1000 * 60 * 60 * 24 * 30)
    );

    return Math.min(0.95, data.active_months / totalMonths);
  }

  calculateConfidenceLevel(customerData) {
    // Higher confidence with more data points
    const factors = [
      Math.min(1, customerData.total_transactions / 100),
      Math.min(1, customerData.account_age_days / 365),
      customerData.days_since_last_transaction < 30 ? 1 : 0.5,
      customerData.unique_merchants > 5 ? 1 : 0.7
    ];

    return factors.reduce((sum, f) => sum + f, 0) / factors.length;
  }

  determineCustomerSegment(ltv365) {
    if (ltv365 > 10000) return 'vip';
    if (ltv365 > 5000) return 'premium';
    if (ltv365 > 1000) return 'regular';
    return 'basic';
  }

  getValueTier(ltv) {
    if (ltv > 10000) return 'high';
    if (ltv > 1000) return 'medium';
    return 'low';
  }

  async getChurnIndicators(client, userId) {
    const result = await client.query(`
      SELECT
        EXTRACT(DAY FROM CURRENT_TIMESTAMP - MAX(t.created_at)) as days_since_last_transaction,
        COUNT(DISTINCT DATE_TRUNC('week', t.created_at)) as active_weeks,
        AVG(t.amount) as avg_transaction_amount,
        COUNT(s.id) as support_tickets,
        MAX(s.satisfaction_score) as last_satisfaction_score,
        COUNT(DISTINCT c.competitor_id) as competitor_interactions
      FROM users u
      LEFT JOIN transactions t ON t.user_id = u.id
      LEFT JOIN support_tickets s ON s.user_id = u.id
      LEFT JOIN competitor_activity c ON c.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    return result.rows[0];
  }

  calculateEngagementRisk(indicators) {
    const daysSinceLastActivity = indicators.days_since_last_transaction || 999;
    if (daysSinceLastActivity < 7) return 0.1;
    if (daysSinceLastActivity < 30) return 0.3;
    if (daysSinceLastActivity < 60) return 0.6;
    return 0.9;
  }

  calculateTransactionDeclineRisk(indicators) {
    const activeWeeks = indicators.active_weeks || 0;
    if (activeWeeks > 12) return 0.1;
    if (activeWeeks > 4) return 0.3;
    if (activeWeeks > 1) return 0.5;
    return 0.8;
  }

  calculateSupportInteractionRisk(indicators) {
    const satisfactionScore = indicators.last_satisfaction_score;
    if (!satisfactionScore) return 0.3;
    if (satisfactionScore >= 4) return 0.1;
    if (satisfactionScore >= 3) return 0.4;
    return 0.8;
  }

  async calculateCompetitorActivityRisk(client, userId) {
    // Simplified - would integrate with external data sources
    return 0.2;
  }

  identifyRetentionActions(indicators, churnProbability) {
    const actions = [];

    if (churnProbability > 0.7) {
      actions.push({
        type: 'urgent',
        action: 'personalized_offer',
        description: 'Send personalized retention offer'
      });
    }

    if (indicators.days_since_last_transaction > 30) {
      actions.push({
        type: 'engagement',
        action: 'reactivation_campaign',
        description: 'Launch reactivation email campaign'
      });
    }

    if (indicators.last_satisfaction_score < 3) {
      actions.push({
        type: 'support',
        action: 'customer_success_call',
        description: 'Schedule customer success call'
      });
    }

    return actions;
  }

  calculateChurnConfidence(indicators) {
    const dataQuality = indicators.active_weeks > 0 ? 0.8 : 0.4;
    return dataQuality;
  }

  getChurnRiskLevel(probability) {
    if (probability > 0.7) return 'critical';
    if (probability > 0.5) return 'high';
    if (probability > 0.3) return 'medium';
    return 'low';
  }

  async calculatePotentialLostRevenue(client, userId) {
    const result = await client.query(`
      SELECT AVG(amount) * 12 as annual_revenue
      FROM transactions
      WHERE user_id = $1 AND created_at > CURRENT_DATE - INTERVAL '365 days'
    `, [userId]);

    return parseFloat(result.rows[0]?.annual_revenue || 0);
  }

  // Additional helper methods would continue...
  async getCreditHistory(client, userId) {
    const result = await client.query(`
      SELECT * FROM credit_history WHERE user_id = $1
    `, [userId]);
    return result.rows;
  }

  async getFinancialProfile(client, userId) {
    const result = await client.query(`
      SELECT * FROM financial_profiles WHERE user_id = $1
    `, [userId]);
    return result.rows[0] || {};
  }

  calculatePaymentHistoryScore(creditHistory) {
    // Implementation would analyze payment patterns
    return 0.85;
  }

  calculateDebtToIncomeRatio(profile) {
    const debt = profile.total_debt || 0;
    const income = profile.monthly_income || 1;
    return Math.min(1, debt / income);
  }

  calculateCreditUtilization(profile) {
    const used = profile.credit_used || 0;
    const limit = profile.credit_limit || 1;
    return Math.min(1, used / limit);
  }

  calculateAccountStability(history) {
    // Implementation would analyze account age and consistency
    return 0.75;
  }

  calculateApprovalProbability(score, amount, profile) {
    const scoreFacto = score / 850;
    const amountFactor = 1 - (amount / (profile.monthly_income * 12));
    return scoreFacto * 0.7 + amountFactor * 0.3;
  }

  calculateRecommendedCreditLimit(score, profile) {
    const baseLimit = profile.monthly_income * 3;
    const scoreMultiplier = score / 500;
    return baseLimit * scoreMultiplier;
  }

  getCreditRiskLevel(score) {
    if (score > 750) return 'excellent';
    if (score > 650) return 'good';
    if (score > 550) return 'fair';
    return 'poor';
  }

  calculateInterestRate(score) {
    const baseRate = 24.99;
    const discount = (score - 300) / 550 * 15;
    return Math.max(4.99, baseRate - discount);
  }

  calculateCreditConfidence(history) {
    return history.length > 12 ? 0.9 : 0.6;
  }

  generateCreditRecommendations(score, profile) {
    const recommendations = [];

    if (score < 650) {
      recommendations.push('Improve payment history for better rates');
    }

    if (profile.credit_utilization > 0.3) {
      recommendations.push('Reduce credit utilization below 30%');
    }

    return recommendations;
  }

  async cleanup() {
    await this.pool.end();
  }
}

module.exports = PredictiveAnalyticsEngine;