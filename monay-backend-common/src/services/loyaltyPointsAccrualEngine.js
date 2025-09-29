import EventEmitter from 'events';
import { Pool } from 'pg';
import crypto from 'crypto';

class LoyaltyPointsAccrualEngine extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Accrual types
    this.accrualTypes = {
      PURCHASE: 'purchase',
      BONUS: 'bonus',
      REFERRAL: 'referral',
      WELCOME: 'welcome',
      BIRTHDAY: 'birthday',
      MILESTONE: 'milestone',
      CHALLENGE: 'challenge',
      SOCIAL: 'social_engagement',
      REVIEW: 'product_review',
      SURVEY: 'survey_completion'
    };

    // MCC category mappings for bonus points
    this.mccCategories = {
      // Dining
      '5812': { category: 'DINING', multiplier: 3 },
      '5813': { category: 'DINING', multiplier: 3 },
      '5814': { category: 'DINING', multiplier: 3 },

      // Travel
      '3000-3999': { category: 'TRAVEL', multiplier: 2 },
      '4511': { category: 'TRAVEL', multiplier: 2 },

      // Gas
      '5541': { category: 'GAS', multiplier: 2 },
      '5542': { category: 'GAS', multiplier: 2 },

      // Grocery
      '5411': { category: 'GROCERY', multiplier: 2 },
      '5422': { category: 'GROCERY', multiplier: 2 },

      // Online Shopping
      '5964': { category: 'ONLINE', multiplier: 1.5 },
      '5999': { category: 'ONLINE', multiplier: 1.5 }
    };

    // Points calculation rules
    this.calculationRules = {
      BASE_RATE: 1, // 1 point per dollar
      MIN_TRANSACTION: 0.01,
      MAX_TRANSACTION: 10000,
      ROUNDING: 'floor' // floor, ceil, round
    };
  }

  /**
   * Process transaction for points accrual
   */
  async processTransaction(transactionData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Validate transaction
      const validation = await this.validateTransaction(transactionData, client);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Get member details
      const member = await this.getMemberDetails(transactionData.memberId, client);
      if (!member) {
        throw new Error('Member not found');
      }

      // Check for duplicate transaction
      const isDuplicate = await this.checkDuplicateTransaction(transactionData, client);
      if (isDuplicate) {
        throw new Error('Duplicate transaction');
      }

      // Calculate base points
      let points = await this.calculateBasePoints(transactionData, member, client);

      // Apply multipliers
      points = await this.applyMultipliers(points, transactionData, member, client);

      // Apply bonus rules
      const bonuses = await this.applyBonusRules(transactionData, member, client);
      const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus.points, 0);

      // Calculate final points
      const finalPoints = Math.floor(points + totalBonus);

      // Create accrual record
      const accrualId = await this.createAccrualRecord({
        memberId: member.id,
        transactionId: transactionData.transactionId,
        basePoints: Math.floor(points),
        bonusPoints: totalBonus,
        totalPoints: finalPoints,
        transactionAmount: transactionData.amount,
        merchantName: transactionData.merchantName,
        mccCode: transactionData.mccCode,
        accrualType: this.accrualTypes.PURCHASE,
        metadata: {
          bonuses,
          multipliers: await this.getAppliedMultipliers(transactionData, member, client)
        }
      }, client);

      // Update member balance
      await this.updateMemberBalance(member.id, finalPoints, client);

      // Check for milestones
      const milestones = await this.checkMilestones(member.id, finalPoints, client);

      // Check for tier progress
      const tierProgress = await this.checkTierProgress(member.id, client);

      // Process any triggered bonuses
      if (milestones.length > 0) {
        await this.processMilestoneBonuses(member.id, milestones, client);
      }

      await client.query('COMMIT');

      this.emit('pointsAccrued', {
        memberId: member.id,
        accrualId,
        points: finalPoints,
        basePoints: Math.floor(points),
        bonusPoints: totalBonus,
        milestones,
        tierProgress
      });

      return {
        success: true,
        accrualId,
        pointsEarned: finalPoints,
        breakdown: {
          base: Math.floor(points),
          bonus: totalBonus,
          total: finalPoints
        },
        bonuses,
        milestones,
        tierProgress,
        newBalance: member.points_balance + finalPoints
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate transaction
   */
  async validateTransaction(transaction, client) {
    // Check amount
    if (transaction.amount < this.calculationRules.MIN_TRANSACTION) {
      return { valid: false, reason: 'Transaction amount too small' };
    }

    if (transaction.amount > this.calculationRules.MAX_TRANSACTION) {
      return { valid: false, reason: 'Transaction amount exceeds maximum' };
    }

    // Check transaction date (not future dated)
    if (new Date(transaction.transactionDate) > new Date()) {
      return { valid: false, reason: 'Future dated transaction' };
    }

    // Check if transaction is within accrual window (30 days)
    const daysSinceTransaction = Math.floor(
      (new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceTransaction > 30) {
      return { valid: false, reason: 'Transaction outside accrual window' };
    }

    return { valid: true };
  }

  /**
   * Get member details
   */
  async getMemberDetails(memberId, client) {
    const query = `
      SELECT m.*, p.metadata as program_metadata
      FROM loyalty_members m
      JOIN loyalty_programs p ON m.program_id = p.id
      WHERE m.id = $1 AND m.status = 'active'
    `;

    const result = await client.query(query, [memberId]);
    return result.rows[0];
  }

  /**
   * Check for duplicate transaction
   */
  async checkDuplicateTransaction(transaction, client) {
    const query = `
      SELECT id FROM loyalty_points_accruals
      WHERE reference_transaction_id = $1
    `;

    const result = await client.query(query, [transaction.transactionId]);
    return result.rows.length > 0;
  }

  /**
   * Calculate base points
   */
  async calculateBasePoints(transaction, member, client) {
    // Get program earning rules
    const rulesQuery = `
      SELECT * FROM loyalty_earning_rules
      WHERE program_id = $1
      AND status = 'active'
      AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
      AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
      ORDER BY priority DESC
    `;

    const rulesResult = await client.query(rulesQuery, [member.program_id]);
    const rules = rulesResult.rows;

    // Start with base rate
    let rate = this.calculationRules.BASE_RATE;

    // Apply MCC-based multiplier
    const mccMultiplier = this.getMCCMultiplier(transaction.mccCode);
    if (mccMultiplier > 1) {
      rate = rate * mccMultiplier;
    }

    // Apply merchant-specific rules
    for (const rule of rules) {
      const conditions = JSON.parse(rule.conditions || '{}');

      if (conditions.merchants && conditions.merchants.includes(transaction.merchantId)) {
        rate = Math.max(rate, rule.multiplier);
      }

      if (conditions.min_amount && transaction.amount >= conditions.min_amount) {
        rate = Math.max(rate, rule.multiplier);
      }
    }

    return transaction.amount * rate;
  }

  /**
   * Get MCC multiplier
   */
  getMCCMultiplier(mccCode) {
    // Direct match
    if (this.mccCategories[mccCode]) {
      return this.mccCategories[mccCode].multiplier;
    }

    // Range match
    for (const [range, config] of Object.entries(this.mccCategories)) {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        const code = Number(mccCode);
        if (code >= min && code <= max) {
          return config.multiplier;
        }
      }
    }

    return 1; // Default multiplier
  }

  /**
   * Apply multipliers
   */
  async applyMultipliers(points, transaction, member, client) {
    let multipliedPoints = points;

    // Tier multiplier
    const tierMultiplier = await this.getTierMultiplier(member.tier_level);
    multipliedPoints *= tierMultiplier;

    // Campaign multipliers
    const campaignMultiplier = await this.getCampaignMultiplier(
      member.program_id,
      transaction,
      client
    );
    multipliedPoints *= campaignMultiplier;

    // Day of week multiplier
    const dayMultiplier = await this.getDayOfWeekMultiplier(
      member.program_id,
      transaction.transactionDate,
      client
    );
    multipliedPoints *= dayMultiplier;

    // Time-based multiplier (happy hours)
    const timeMultiplier = await this.getTimeBasedMultiplier(
      member.program_id,
      transaction.transactionDate,
      client
    );
    multipliedPoints *= timeMultiplier;

    return multipliedPoints;
  }

  /**
   * Get tier multiplier
   */
  async getTierMultiplier(tierLevel) {
    const multipliers = {
      BRONZE: 1.0,
      SILVER: 1.25,
      GOLD: 1.5,
      PLATINUM: 2.0,
      DIAMOND: 3.0
    };

    return multipliers[tierLevel] || 1.0;
  }

  /**
   * Get campaign multiplier
   */
  async getCampaignMultiplier(programId, transaction, client) {
    const query = `
      SELECT * FROM loyalty_campaigns
      WHERE program_id = $1
      AND status = 'active'
      AND start_date <= $2
      AND end_date >= $2
      AND campaign_type = 'bonus_multiplier'
    `;

    const result = await client.query(query, [
      programId,
      transaction.transactionDate
    ]);

    let maxMultiplier = 1;

    for (const campaign of result.rows) {
      const rules = JSON.parse(campaign.campaign_rules || '{}');

      // Check if transaction qualifies
      if (!rules.mcc_codes || rules.mcc_codes.includes(transaction.mccCode)) {
        maxMultiplier = Math.max(maxMultiplier, campaign.bonus_multiplier || 1);
      }
    }

    return maxMultiplier;
  }

  /**
   * Get day of week multiplier
   */
  async getDayOfWeekMultiplier(programId, transactionDate, client) {
    const dayOfWeek = new Date(transactionDate).getDay();

    // Check for special day promotions
    const query = `
      SELECT * FROM loyalty_special_promotions
      WHERE program_id = $1
      AND promotion_type = 'day_of_week'
      AND day_of_week = $2
      AND status = 'active'
    `;

    const result = await client.query(query, [programId, dayOfWeek]);

    if (result.rows.length > 0) {
      return result.rows[0].multiplier || 1;
    }

    // Weekend bonus (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 1.5;
    }

    return 1;
  }

  /**
   * Get time-based multiplier
   */
  async getTimeBasedMultiplier(programId, transactionDate, client) {
    const hour = new Date(transactionDate).getHours();

    // Happy hour bonus (3 PM - 6 PM)
    if (hour >= 15 && hour <= 18) {
      return 1.5;
    }

    // Late night bonus (10 PM - 2 AM)
    if (hour >= 22 || hour <= 2) {
      return 1.25;
    }

    return 1;
  }

  /**
   * Apply bonus rules
   */
  async applyBonusRules(transaction, member, client) {
    const bonuses = [];

    // First transaction bonus
    if (await this.isFirstTransaction(member.id, client)) {
      bonuses.push({
        type: 'FIRST_TRANSACTION',
        points: 500,
        description: 'First transaction bonus'
      });
    }

    // Birthday bonus
    if (await this.isBirthdayTransaction(member.user_id, transaction.transactionDate, client)) {
      bonuses.push({
        type: 'BIRTHDAY',
        points: 1000,
        description: 'Birthday bonus'
      });
    }

    // Round number bonus
    if (transaction.amount % 100 === 0 && transaction.amount >= 100) {
      bonuses.push({
        type: 'ROUND_NUMBER',
        points: 100,
        description: 'Round number bonus'
      });
    }

    // Streak bonus
    const streakBonus = await this.calculateStreakBonus(member.id, client);
    if (streakBonus > 0) {
      bonuses.push({
        type: 'STREAK',
        points: streakBonus,
        description: `${streakBonus / 50} day streak bonus`
      });
    }

    // Challenge completion bonus
    const challengeBonus = await this.checkChallengeCompletion(
      member.id,
      transaction,
      client
    );
    if (challengeBonus) {
      bonuses.push(challengeBonus);
    }

    return bonuses;
  }

  /**
   * Check if first transaction
   */
  async isFirstTransaction(memberId, client) {
    const query = `
      SELECT COUNT(*) as count
      FROM loyalty_points_accruals
      WHERE member_id = $1
    `;

    const result = await client.query(query, [memberId]);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Check if birthday transaction
   */
  async isBirthdayTransaction(userId, transactionDate, client) {
    const query = `
      SELECT date_of_birth FROM users WHERE id = $1
    `;

    const result = await client.query(query, [userId]);

    if (result.rows.length === 0 || !result.rows[0].date_of_birth) {
      return false;
    }

    const dob = new Date(result.rows[0].date_of_birth);
    const txDate = new Date(transactionDate);

    return dob.getMonth() === txDate.getMonth() &&
           dob.getDate() === txDate.getDate();
  }

  /**
   * Calculate streak bonus
   */
  async calculateStreakBonus(memberId, client) {
    const query = `
      WITH daily_transactions AS (
        SELECT DATE(transaction_date) as tx_date
        FROM loyalty_points_accruals
        WHERE member_id = $1
        GROUP BY DATE(transaction_date)
        ORDER BY tx_date DESC
      ),
      streaks AS (
        SELECT tx_date,
               tx_date - (ROW_NUMBER() OVER (ORDER BY tx_date))::int as streak_group
        FROM daily_transactions
      )
      SELECT COUNT(*) as streak_days
      FROM streaks
      WHERE streak_group = (
        SELECT streak_group
        FROM streaks
        ORDER BY tx_date DESC
        LIMIT 1
      )
    `;

    const result = await client.query(query, [memberId]);
    const streakDays = parseInt(result.rows[0]?.streak_days || 0);

    // 50 points per day of streak, max 500 points
    return Math.min(streakDays * 50, 500);
  }

  /**
   * Check challenge completion
   */
  async checkChallengeCompletion(memberId, transaction, client) {
    const query = `
      SELECT * FROM loyalty_challenges
      WHERE program_id = (SELECT program_id FROM loyalty_members WHERE id = $1)
      AND status = 'active'
      AND start_date <= CURRENT_TIMESTAMP
      AND end_date >= CURRENT_TIMESTAMP
    `;

    const result = await client.query(query, [memberId]);

    for (const challenge of result.rows) {
      const requirements = JSON.parse(challenge.requirements || '{}');

      // Check if transaction meets challenge requirements
      if (requirements.min_amount && transaction.amount >= requirements.min_amount) {
        // Check progress
        const progressQuery = `
          SELECT * FROM loyalty_challenge_progress
          WHERE member_id = $1 AND challenge_id = $2
        `;
        const progressResult = await client.query(progressQuery, [memberId, challenge.id]);

        if (progressResult.rows.length === 0) {
          // First qualifying transaction for this challenge
          await client.query(
            `INSERT INTO loyalty_challenge_progress (
              member_id, challenge_id, progress, completed
            ) VALUES ($1, $2, 1, $3)`,
            [memberId, challenge.id, requirements.required_transactions === 1]
          );

          if (requirements.required_transactions === 1) {
            return {
              type: 'CHALLENGE',
              points: challenge.reward_points,
              description: `Completed challenge: ${challenge.name}`
            };
          }
        } else {
          // Update progress
          const progress = progressResult.rows[0];
          const newProgress = progress.progress + 1;

          if (newProgress >= requirements.required_transactions && !progress.completed) {
            await client.query(
              `UPDATE loyalty_challenge_progress
               SET progress = $1, completed = true, completed_date = CURRENT_TIMESTAMP
               WHERE member_id = $2 AND challenge_id = $3`,
              [newProgress, memberId, challenge.id]
            );

            return {
              type: 'CHALLENGE',
              points: challenge.reward_points,
              description: `Completed challenge: ${challenge.name}`
            };
          } else {
            await client.query(
              `UPDATE loyalty_challenge_progress
               SET progress = $1
               WHERE member_id = $2 AND challenge_id = $3`,
              [newProgress, memberId, challenge.id]
            );
          }
        }
      }
    }

    return null;
  }

  /**
   * Create accrual record
   */
  async createAccrualRecord(data, client) {
    const query = `
      INSERT INTO loyalty_points_accruals (
        id, member_id, reference_transaction_id,
        accrual_type, base_points, bonus_points,
        total_points, transaction_amount,
        merchant_name, mcc_code,
        transaction_date, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11)
      RETURNING id
    `;

    const result = await client.query(query, [
      crypto.randomUUID(),
      data.memberId,
      data.transactionId,
      data.accrualType,
      data.basePoints,
      data.bonusPoints,
      data.totalPoints,
      data.transactionAmount,
      data.merchantName,
      data.mccCode,
      JSON.stringify(data.metadata)
    ]);

    return result.rows[0].id;
  }

  /**
   * Update member balance
   */
  async updateMemberBalance(memberId, points, client) {
    await client.query(
      `UPDATE loyalty_members
       SET points_balance = points_balance + $1,
           lifetime_points = lifetime_points + $1,
           last_activity_date = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [points, memberId]
    );

    // Record in transaction ledger
    await client.query(
      `INSERT INTO loyalty_points_transactions (
        id, member_id, transaction_type,
        points_amount, description,
        transaction_date
      ) VALUES ($1, $2, 'credit', $3, 'Points earned', CURRENT_TIMESTAMP)`,
      [crypto.randomUUID(), memberId, points]
    );
  }

  /**
   * Check milestones
   */
  async checkMilestones(memberId, newPoints, client) {
    const milestones = [];

    // Get current totals
    const query = `
      SELECT points_balance, lifetime_points
      FROM loyalty_members
      WHERE id = $1
    `;
    const result = await client.query(query, [memberId]);
    const member = result.rows[0];

    // Check lifetime points milestones
    const lifetimeThresholds = [1000, 5000, 10000, 25000, 50000, 100000];
    for (const threshold of lifetimeThresholds) {
      if (member.lifetime_points >= threshold &&
          (member.lifetime_points - newPoints) < threshold) {
        milestones.push({
          type: 'LIFETIME_POINTS',
          threshold,
          reward: threshold / 100, // 1% bonus
          description: `Reached ${threshold.toLocaleString()} lifetime points`
        });
      }
    }

    // Check transaction count milestones
    const txCountQuery = `
      SELECT COUNT(*) as count
      FROM loyalty_points_accruals
      WHERE member_id = $1
    `;
    const txResult = await client.query(txCountQuery, [memberId]);
    const txCount = parseInt(txResult.rows[0].count);

    if (txCount % 10 === 0) {
      milestones.push({
        type: 'TRANSACTION_COUNT',
        count: txCount,
        reward: 100,
        description: `${txCount}th transaction milestone`
      });
    }

    return milestones;
  }

  /**
   * Check tier progress
   */
  async checkTierProgress(memberId, client) {
    const query = `
      SELECT m.tier_level, m.lifetime_points,
             t.tier_name, t.points_threshold
      FROM loyalty_members m
      JOIN loyalty_program_tiers t ON t.program_id = m.program_id
      WHERE m.id = $1
      ORDER BY t.points_threshold ASC
    `;

    const result = await client.query(query, [memberId]);

    if (result.rows.length === 0) {
      return null;
    }

    const currentTier = result.rows[0].tier_level;
    const lifetimePoints = result.rows[0].lifetime_points;

    // Find next tier
    let nextTier = null;
    let pointsToNext = null;

    for (const tier of result.rows) {
      if (tier.points_threshold > lifetimePoints) {
        nextTier = tier.tier_name;
        pointsToNext = tier.points_threshold - lifetimePoints;
        break;
      }
    }

    // Check if tier upgrade is due
    let newTier = currentTier;
    for (const tier of result.rows) {
      if (lifetimePoints >= tier.points_threshold) {
        newTier = tier.tier_name;
      }
    }

    if (newTier !== currentTier) {
      await client.query(
        `UPDATE loyalty_members
         SET tier_level = $1,
             tier_achieved_date = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newTier, memberId]
      );

      this.emit('tierUpgrade', {
        memberId,
        oldTier: currentTier,
        newTier
      });
    }

    return {
      currentTier: newTier,
      nextTier,
      pointsToNext,
      progress: nextTier ? ((lifetimePoints % pointsToNext) / pointsToNext * 100) : 100
    };
  }

  /**
   * Process milestone bonuses
   */
  async processMilestoneBonuses(memberId, milestones, client) {
    for (const milestone of milestones) {
      if (milestone.reward > 0) {
        await this.createAccrualRecord({
          memberId,
          transactionId: `MILESTONE-${Date.now()}`,
          basePoints: 0,
          bonusPoints: milestone.reward,
          totalPoints: milestone.reward,
          transactionAmount: 0,
          merchantName: 'Milestone Bonus',
          mccCode: null,
          accrualType: this.accrualTypes.MILESTONE,
          metadata: { milestone }
        }, client);

        await this.updateMemberBalance(memberId, milestone.reward, client);
      }
    }
  }

  /**
   * Get applied multipliers
   */
  async getAppliedMultipliers(transaction, member, client) {
    return {
      tier: await this.getTierMultiplier(member.tier_level),
      campaign: await this.getCampaignMultiplier(member.program_id, transaction, client),
      dayOfWeek: await this.getDayOfWeekMultiplier(member.program_id, transaction.transactionDate, client),
      timeOfDay: await this.getTimeBasedMultiplier(member.program_id, transaction.transactionDate, client),
      mcc: this.getMCCMultiplier(transaction.mccCode)
    };
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default LoyaltyPointsAccrualEngine;