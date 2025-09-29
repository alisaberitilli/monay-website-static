import EventEmitter from 'events';
import { Pool } from 'pg';
import crypto from 'crypto';

class LoyaltyProgramManagementService extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Program types
    this.programTypes = {
      POINTS: 'points_based',
      TIERED: 'tiered_membership',
      CASHBACK: 'cashback',
      COALITION: 'coalition',
      HYBRID: 'hybrid'
    };

    // Tier levels
    this.tierLevels = {
      BRONZE: { level: 1, multiplier: 1.0, minSpend: 0 },
      SILVER: { level: 2, multiplier: 1.25, minSpend: 1000 },
      GOLD: { level: 3, multiplier: 1.5, minSpend: 5000 },
      PLATINUM: { level: 4, multiplier: 2.0, minSpend: 10000 },
      DIAMOND: { level: 5, multiplier: 3.0, minSpend: 25000 }
    };

    // Earning categories
    this.earningCategories = {
      DINING: { code: 'DINING', multiplier: 3 },
      TRAVEL: { code: 'TRAVEL', multiplier: 2 },
      GAS: { code: 'GAS', multiplier: 2 },
      GROCERY: { code: 'GROCERY', multiplier: 2 },
      ONLINE: { code: 'ONLINE', multiplier: 1.5 },
      DEFAULT: { code: 'DEFAULT', multiplier: 1 }
    };
  }

  /**
   * Create new loyalty program
   */
  async createLoyaltyProgram(enterpriseId, programData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate program ID
      const programId = this.generateProgramId();

      // Create main program
      const programQuery = `
        INSERT INTO loyalty_programs (
          id, program_id, enterprise_id,
          program_name, program_type,
          status, start_date, end_date,
          terms_conditions, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const programValues = [
        crypto.randomUUID(),
        programId,
        enterpriseId,
        programData.name,
        programData.type || this.programTypes.POINTS,
        'active',
        programData.startDate || new Date(),
        programData.endDate || null,
        programData.termsConditions || '',
        JSON.stringify({
          description: programData.description,
          branding: programData.branding || {},
          settings: programData.settings || {},
          partnerships: programData.partnerships || []
        })
      ];

      const programResult = await client.query(programQuery, programValues);
      const program = programResult.rows[0];

      // Create earning rules
      await this.createEarningRules(program.id, programData.earningRules || [], client);

      // Create tier structure
      await this.createTierStructure(program.id, programData.tiers || this.tierLevels, client);

      // Create initial rewards catalog
      if (programData.rewards && programData.rewards.length > 0) {
        await this.createRewardsCatalog(program.id, programData.rewards, client);
      }

      // Set up campaign if provided
      if (programData.campaign) {
        await this.createCampaign(program.id, programData.campaign, client);
      }

      await client.query('COMMIT');

      this.emit('programCreated', {
        programId: program.id,
        enterpriseId,
        programName: programData.name
      });

      return {
        success: true,
        program,
        programId
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating loyalty program:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Enroll member in loyalty program
   */
  async enrollMember(programId, memberData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if already enrolled
      const existingQuery = `
        SELECT * FROM loyalty_members
        WHERE program_id = $1 AND user_id = $2
      `;
      const existingResult = await client.query(existingQuery, [programId, memberData.userId]);

      if (existingResult.rows.length > 0) {
        throw new Error('Member already enrolled in program');
      }

      // Generate member number
      const memberNumber = this.generateMemberNumber();

      // Create member record
      const memberQuery = `
        INSERT INTO loyalty_members (
          id, program_id, user_id,
          member_number, tier_level,
          points_balance, lifetime_points,
          enrollment_date, status,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const memberValues = [
        crypto.randomUUID(),
        programId,
        memberData.userId,
        memberNumber,
        'BRONZE',
        memberData.welcomeBonus || 0,
        memberData.welcomeBonus || 0,
        new Date(),
        'active',
        JSON.stringify({
          referredBy: memberData.referredBy || null,
          enrollmentChannel: memberData.channel || 'web',
          preferences: memberData.preferences || {}
        })
      ];

      const memberResult = await client.query(memberQuery, memberValues);
      const member = memberResult.rows[0];

      // Record welcome bonus transaction if applicable
      if (memberData.welcomeBonus > 0) {
        await this.recordPointsTransaction(
          member.id,
          'credit',
          memberData.welcomeBonus,
          'Welcome bonus',
          null,
          client
        );
      }

      // Process referral bonus if applicable
      if (memberData.referredBy) {
        await this.processReferralBonus(programId, memberData.referredBy, member.id, client);
      }

      await client.query('COMMIT');

      this.emit('memberEnrolled', {
        memberId: member.id,
        programId,
        memberNumber
      });

      return {
        success: true,
        member,
        memberNumber
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error enrolling member:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Accrue points for transaction
   */
  async accruePoints(memberId, transactionData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get member and program details
      const memberQuery = `
        SELECT m.*, p.*
        FROM loyalty_members m
        JOIN loyalty_programs p ON m.program_id = p.id
        WHERE m.id = $1 AND m.status = 'active'
      `;
      const memberResult = await client.query(memberQuery, [memberId]);

      if (memberResult.rows.length === 0) {
        throw new Error('Active member not found');
      }

      const member = memberResult.rows[0];

      // Calculate base points
      let points = await this.calculatePoints(
        member.program_id,
        transactionData,
        member.tier_level,
        client
      );

      // Apply promotional multipliers
      const promotionalMultiplier = await this.getPromotionalMultiplier(
        member.program_id,
        transactionData,
        client
      );
      points = Math.floor(points * promotionalMultiplier);

      // Check for bonus events
      const bonusPoints = await this.checkBonusEvents(
        member.program_id,
        transactionData,
        client
      );
      points += bonusPoints;

      // Update member points
      const newBalance = parseInt(member.points_balance) + points;
      const newLifetime = parseInt(member.lifetime_points) + points;

      await client.query(
        `UPDATE loyalty_members
         SET points_balance = $1,
             lifetime_points = $2,
             last_activity_date = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newBalance, newLifetime, memberId]
      );

      // Record transaction
      const transactionId = await this.recordPointsTransaction(
        memberId,
        'credit',
        points,
        `Purchase at ${transactionData.merchantName}`,
        transactionData.transactionId,
        client
      );

      // Check for tier upgrade
      const tierUpgrade = await this.checkTierUpgrade(memberId, newLifetime, client);

      // Check for achievement badges
      const achievements = await this.checkAchievements(memberId, transactionData, client);

      await client.query('COMMIT');

      this.emit('pointsAccrued', {
        memberId,
        points,
        newBalance,
        transactionId
      });

      return {
        success: true,
        pointsEarned: points,
        newBalance,
        tierUpgrade,
        achievements
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error accruing points:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calculate points based on rules
   */
  async calculatePoints(programId, transaction, tierLevel, client) {
    // Get earning rules
    const rulesQuery = `
      SELECT * FROM loyalty_earning_rules
      WHERE program_id = $1 AND status = 'active'
      ORDER BY priority DESC
    `;
    const rulesResult = await client.query(rulesQuery, [programId]);

    let basePoints = Math.floor(transaction.amount); // 1 point per dollar default
    let categoryMultiplier = 1;

    // Apply category-specific rules
    for (const rule of rulesResult.rows) {
      const conditions = JSON.parse(rule.conditions || '{}');

      // Check MCC code
      if (conditions.mcc_codes && conditions.mcc_codes.includes(transaction.mccCode)) {
        categoryMultiplier = Math.max(categoryMultiplier, rule.multiplier);
      }

      // Check merchant
      if (conditions.merchants && conditions.merchants.includes(transaction.merchantId)) {
        categoryMultiplier = Math.max(categoryMultiplier, rule.multiplier);
      }

      // Check category
      if (conditions.category === transaction.category) {
        categoryMultiplier = Math.max(categoryMultiplier, rule.multiplier);
      }
    }

    // Apply tier multiplier
    const tierMultiplier = this.tierLevels[tierLevel]?.multiplier || 1;

    return Math.floor(basePoints * categoryMultiplier * tierMultiplier);
  }

  /**
   * Get promotional multiplier
   */
  async getPromotionalMultiplier(programId, transaction, client) {
    const campaignQuery = `
      SELECT * FROM loyalty_campaigns
      WHERE program_id = $1
      AND status = 'active'
      AND start_date <= CURRENT_TIMESTAMP
      AND end_date >= CURRENT_TIMESTAMP
    `;
    const campaignResult = await client.query(campaignQuery, [programId]);

    let maxMultiplier = 1;

    for (const campaign of campaignResult.rows) {
      const rules = JSON.parse(campaign.campaign_rules || '{}');

      // Check if transaction qualifies
      if (this.transactionQualifies(transaction, rules)) {
        maxMultiplier = Math.max(maxMultiplier, campaign.bonus_multiplier || 1);
      }
    }

    return maxMultiplier;
  }

  /**
   * Check for bonus events
   */
  async checkBonusEvents(programId, transaction, client) {
    let bonusPoints = 0;

    // Birthday bonus
    const birthdayQuery = `
      SELECT u.date_of_birth, p.metadata
      FROM loyalty_members m
      JOIN users u ON m.user_id = u.id
      JOIN loyalty_programs p ON m.program_id = p.id
      WHERE m.program_id = $1
      AND EXTRACT(MONTH FROM u.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM u.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
    `;
    const birthdayResult = await client.query(birthdayQuery, [programId]);

    if (birthdayResult.rows.length > 0) {
      const settings = JSON.parse(birthdayResult.rows[0].metadata || '{}').settings || {};
      bonusPoints += settings.birthdayBonus || 500;
    }

    // Milestone bonuses (every 10th transaction)
    const countQuery = `
      SELECT COUNT(*) as transaction_count
      FROM loyalty_points_transactions
      WHERE member_id IN (SELECT id FROM loyalty_members WHERE program_id = $1)
      AND transaction_type = 'credit'
    `;
    const countResult = await client.query(countQuery, [programId]);
    const count = parseInt(countResult.rows[0].transaction_count);

    if (count % 10 === 0) {
      bonusPoints += 100; // Milestone bonus
    }

    return bonusPoints;
  }

  /**
   * Check if transaction qualifies for campaign
   */
  transactionQualifies(transaction, rules) {
    // Check minimum amount
    if (rules.minAmount && transaction.amount < rules.minAmount) {
      return false;
    }

    // Check maximum amount
    if (rules.maxAmount && transaction.amount > rules.maxAmount) {
      return false;
    }

    // Check categories
    if (rules.categories && !rules.categories.includes(transaction.category)) {
      return false;
    }

    // Check days of week
    if (rules.daysOfWeek) {
      const dayOfWeek = new Date().getDay();
      if (!rules.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check time of day
    if (rules.timeOfDay) {
      const hour = new Date().getHours();
      if (hour < rules.timeOfDay.start || hour > rules.timeOfDay.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check for tier upgrade
   */
  async checkTierUpgrade(memberId, lifetimePoints, client) {
    const currentTierQuery = `
      SELECT tier_level FROM loyalty_members WHERE id = $1
    `;
    const currentResult = await client.query(currentTierQuery, [memberId]);
    const currentTier = currentResult.rows[0].tier_level;

    let newTier = 'BRONZE';
    for (const [tier, config] of Object.entries(this.tierLevels)) {
      if (lifetimePoints >= config.minSpend) {
        newTier = tier;
      }
    }

    if (newTier !== currentTier && this.tierLevels[newTier].level > this.tierLevels[currentTier].level) {
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

      return {
        upgraded: true,
        oldTier: currentTier,
        newTier
      };
    }

    return { upgraded: false };
  }

  /**
   * Check for achievements
   */
  async checkAchievements(memberId, transaction, client) {
    const achievements = [];

    // First purchase achievement
    const firstPurchaseQuery = `
      SELECT COUNT(*) as count
      FROM loyalty_points_transactions
      WHERE member_id = $1 AND transaction_type = 'credit'
    `;
    const firstResult = await client.query(firstPurchaseQuery, [memberId]);

    if (parseInt(firstResult.rows[0].count) === 1) {
      achievements.push({
        type: 'FIRST_PURCHASE',
        name: 'First Purchase',
        description: 'Made your first purchase',
        badgeUrl: '/badges/first-purchase.png'
      });
    }

    // Big spender achievement
    if (transaction.amount >= 1000) {
      achievements.push({
        type: 'BIG_SPENDER',
        name: 'Big Spender',
        description: 'Single transaction over $1000',
        badgeUrl: '/badges/big-spender.png'
      });
    }

    // Weekend warrior (transaction on weekend)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      achievements.push({
        type: 'WEEKEND_WARRIOR',
        name: 'Weekend Warrior',
        description: 'Shopping on the weekend',
        badgeUrl: '/badges/weekend-warrior.png'
      });
    }

    // Record achievements
    for (const achievement of achievements) {
      await client.query(
        `INSERT INTO loyalty_achievements (
          member_id, achievement_type, achievement_data, earned_date
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING`,
        [memberId, achievement.type, JSON.stringify(achievement)]
      );
    }

    return achievements;
  }

  /**
   * Record points transaction
   */
  async recordPointsTransaction(memberId, type, points, description, referenceId, client) {
    const query = `
      INSERT INTO loyalty_points_transactions (
        id, member_id, transaction_type,
        points_amount, description,
        reference_transaction_id, transaction_date
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id
    `;

    const result = await client.query(query, [
      crypto.randomUUID(),
      memberId,
      type,
      points,
      description,
      referenceId
    ]);

    return result.rows[0].id;
  }

  /**
   * Process referral bonus
   */
  async processReferralBonus(programId, referrerId, referredId, client) {
    // Get referrer
    const referrerQuery = `
      SELECT * FROM loyalty_members
      WHERE id = $1 AND program_id = $2
    `;
    const referrerResult = await client.query(referrerQuery, [referrerId, programId]);

    if (referrerResult.rows.length === 0) {
      return;
    }

    const referrer = referrerResult.rows[0];
    const bonusPoints = 500; // Referral bonus

    // Update referrer points
    await client.query(
      `UPDATE loyalty_members
       SET points_balance = points_balance + $1,
           lifetime_points = lifetime_points + $1
       WHERE id = $2`,
      [bonusPoints, referrerId]
    );

    // Record transaction
    await this.recordPointsTransaction(
      referrerId,
      'credit',
      bonusPoints,
      'Referral bonus',
      referredId,
      client
    );

    this.emit('referralBonusAwarded', {
      referrerId,
      referredId,
      points: bonusPoints
    });
  }

  /**
   * Create earning rules
   */
  async createEarningRules(programId, rules, client) {
    for (const rule of rules) {
      const query = `
        INSERT INTO loyalty_earning_rules (
          id, program_id, rule_name,
          rule_type, multiplier,
          conditions, priority,
          start_date, end_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      await client.query(query, [
        crypto.randomUUID(),
        programId,
        rule.name,
        rule.type || 'category',
        rule.multiplier || 1,
        JSON.stringify(rule.conditions || {}),
        rule.priority || 0,
        rule.startDate || new Date(),
        rule.endDate || null,
        'active'
      ]);
    }
  }

  /**
   * Create tier structure
   */
  async createTierStructure(programId, tiers, client) {
    for (const [tierName, config] of Object.entries(tiers)) {
      const query = `
        INSERT INTO loyalty_program_tiers (
          program_id, tier_name, tier_level,
          points_threshold, benefits,
          multiplier
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await client.query(query, [
        programId,
        tierName,
        config.level,
        config.minSpend,
        JSON.stringify(config.benefits || []),
        config.multiplier
      ]);
    }
  }

  /**
   * Create rewards catalog
   */
  async createRewardsCatalog(programId, rewards, client) {
    for (const reward of rewards) {
      const query = `
        INSERT INTO loyalty_rewards_catalog (
          id, program_id, reward_name,
          reward_type, points_required,
          cash_value, description,
          terms_conditions, inventory_count,
          status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      await client.query(query, [
        crypto.randomUUID(),
        programId,
        reward.name,
        reward.type || 'voucher',
        reward.pointsRequired,
        reward.cashValue || null,
        reward.description,
        reward.terms || '',
        reward.inventory || null,
        'available',
        JSON.stringify({
          category: reward.category,
          imageUrl: reward.imageUrl,
          validityDays: reward.validityDays || 30
        })
      ]);
    }
  }

  /**
   * Create campaign
   */
  async createCampaign(programId, campaignData, client) {
    const query = `
      INSERT INTO loyalty_campaigns (
        id, program_id, campaign_name,
        campaign_type, description,
        start_date, end_date,
        bonus_multiplier, campaign_rules,
        budget, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await client.query(query, [
      crypto.randomUUID(),
      programId,
      campaignData.name,
      campaignData.type || 'bonus_points',
      campaignData.description,
      campaignData.startDate || new Date(),
      campaignData.endDate,
      campaignData.bonusMultiplier || 2,
      JSON.stringify(campaignData.rules || {}),
      campaignData.budget || null,
      'active'
    ]);
  }

  /**
   * Generate program ID
   */
  generateProgramId() {
    const prefix = 'LP';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate member number
   */
  generateMemberNumber() {
    const timestamp = Date.now().toString();
    return `M${timestamp.substr(-10)}`;
  }

  /**
   * Get member details with balance
   */
  async getMemberDetails(memberId) {
    const client = await this.pool.connect();

    try {
      const query = `
        SELECT m.*, p.program_name, p.program_type,
               COUNT(t.id) as total_transactions,
               COALESCE(SUM(CASE WHEN t.transaction_type = 'credit' THEN t.points_amount ELSE 0 END), 0) as total_earned,
               COALESCE(SUM(CASE WHEN t.transaction_type = 'debit' THEN t.points_amount ELSE 0 END), 0) as total_redeemed
        FROM loyalty_members m
        JOIN loyalty_programs p ON m.program_id = p.id
        LEFT JOIN loyalty_points_transactions t ON m.id = t.member_id
        WHERE m.id = $1
        GROUP BY m.id, p.program_name, p.program_type
      `;

      const result = await client.query(query, [memberId]);
      return result.rows[0];

    } catch (error) {
      console.error('Error getting member details:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get program analytics
   */
  async getProgramAnalytics(programId, dateRange) {
    const client = await this.pool.connect();

    try {
      const analyticsQuery = `
        SELECT
          COUNT(DISTINCT m.id) as total_members,
          COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.id END) as active_members,
          SUM(m.points_balance) as total_points_liability,
          AVG(m.points_balance) as average_balance,
          COUNT(DISTINCT t.id) as total_transactions,
          SUM(t.points_amount) as total_points_issued,
          COUNT(DISTINCT r.id) as total_redemptions,
          SUM(r.points_amount) as total_points_redeemed
        FROM loyalty_programs p
        LEFT JOIN loyalty_members m ON p.id = m.program_id
        LEFT JOIN loyalty_points_transactions t ON m.id = t.member_id AND t.transaction_type = 'credit'
        LEFT JOIN loyalty_redemptions r ON m.id = r.member_id AND r.status = 'completed'
        WHERE p.id = $1
        AND ($2::date IS NULL OR t.transaction_date >= $2)
        AND ($3::date IS NULL OR t.transaction_date <= $3)
      `;

      const result = await client.query(analyticsQuery, [
        programId,
        dateRange?.startDate || null,
        dateRange?.endDate || null
      ]);

      // Get tier distribution
      const tierQuery = `
        SELECT tier_level, COUNT(*) as count
        FROM loyalty_members
        WHERE program_id = $1
        GROUP BY tier_level
      `;
      const tierResult = await client.query(tierQuery, [programId]);

      return {
        ...result.rows[0],
        tierDistribution: tierResult.rows
      };

    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default LoyaltyProgramManagementService;