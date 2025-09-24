const EventEmitter = require('events');
const { Pool } = require('pg');
const crypto = require('crypto');

class RewardsCatalogManagementService extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Reward types
    this.rewardTypes = {
      VOUCHER: 'voucher',
      GIFT_CARD: 'gift_card',
      MERCHANDISE: 'merchandise',
      EXPERIENCE: 'experience',
      CASHBACK: 'cashback',
      CHARITY: 'charity_donation',
      MILES: 'airline_miles',
      HOTEL: 'hotel_points',
      SUBSCRIPTION: 'subscription',
      DISCOUNT: 'discount_code'
    };

    // Reward categories
    this.rewardCategories = {
      TRAVEL: 'travel',
      DINING: 'dining',
      SHOPPING: 'shopping',
      ENTERTAINMENT: 'entertainment',
      WELLNESS: 'wellness',
      TECHNOLOGY: 'technology',
      HOME: 'home',
      CHARITY: 'charity',
      CASH: 'cash_equivalent'
    };

    // Fulfillment methods
    this.fulfillmentMethods = {
      DIGITAL: 'digital_delivery',
      PHYSICAL: 'physical_shipping',
      PICKUP: 'store_pickup',
      INSTANT: 'instant_credit',
      SCHEDULED: 'scheduled_delivery'
    };
  }

  /**
   * Create new reward in catalog
   */
  async createReward(programId, rewardData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Validate program exists
      const programQuery = 'SELECT * FROM loyalty_programs WHERE id = $1';
      const programResult = await client.query(programQuery, [programId]);

      if (programResult.rows.length === 0) {
        throw new Error('Loyalty program not found');
      }

      // Generate reward SKU
      const sku = this.generateRewardSKU(rewardData.type);

      // Create reward
      const rewardQuery = `
        INSERT INTO loyalty_rewards_catalog (
          id, program_id, reward_sku,
          reward_name, reward_type, category,
          points_required, cash_value,
          description, terms_conditions,
          inventory_count, min_tier_required,
          valid_from, valid_until,
          fulfillment_method, partner_merchant,
          status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;

      const rewardValues = [
        crypto.randomUUID(),
        programId,
        sku,
        rewardData.name,
        rewardData.type || this.rewardTypes.VOUCHER,
        rewardData.category || this.rewardCategories.SHOPPING,
        rewardData.pointsRequired,
        rewardData.cashValue || null,
        rewardData.description,
        rewardData.termsConditions || '',
        rewardData.inventory || null,
        rewardData.minTierRequired || 'BRONZE',
        rewardData.validFrom || new Date(),
        rewardData.validUntil || null,
        rewardData.fulfillmentMethod || this.fulfillmentMethods.DIGITAL,
        rewardData.partnerMerchant || null,
        'available',
        JSON.stringify({
          imageUrl: rewardData.imageUrl,
          thumbnailUrl: rewardData.thumbnailUrl,
          brandLogo: rewardData.brandLogo,
          validityDays: rewardData.validityDays || 30,
          maxRedemptionsPerMember: rewardData.maxRedemptionsPerMember || null,
          tags: rewardData.tags || [],
          deliveryInstructions: rewardData.deliveryInstructions || null,
          popularityScore: 0
        })
      ];

      const rewardResult = await client.query(rewardQuery, rewardValues);
      const reward = rewardResult.rows[0];

      // Create inventory tracking if physical merchandise
      if (rewardData.type === this.rewardTypes.MERCHANDISE && rewardData.inventory) {
        await this.createInventoryTracking(reward.id, rewardData.inventory, client);
      }

      // Set up partner integration if applicable
      if (rewardData.partnerMerchant) {
        await this.setupPartnerIntegration(reward.id, rewardData.partnerMerchant, client);
      }

      await client.query('COMMIT');

      this.emit('rewardCreated', {
        rewardId: reward.id,
        programId,
        rewardName: rewardData.name
      });

      return {
        success: true,
        reward,
        sku
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating reward:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update reward details
   */
  async updateReward(rewardId, updateData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (updateData.name !== undefined) {
        updateFields.push(`reward_name = $${paramCount++}`);
        updateValues.push(updateData.name);
      }

      if (updateData.pointsRequired !== undefined) {
        updateFields.push(`points_required = $${paramCount++}`);
        updateValues.push(updateData.pointsRequired);
      }

      if (updateData.inventory !== undefined) {
        updateFields.push(`inventory_count = $${paramCount++}`);
        updateValues.push(updateData.inventory);
      }

      if (updateData.status !== undefined) {
        updateFields.push(`status = $${paramCount++}`);
        updateValues.push(updateData.status);
      }

      if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        updateValues.push(updateData.description);
      }

      updateValues.push(rewardId);

      const updateQuery = `
        UPDATE loyalty_rewards_catalog
        SET ${updateFields.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);

      // Log price change if points requirement changed
      if (updateData.pointsRequired !== undefined) {
        await this.logPriceChange(rewardId, updateData.pointsRequired, client);
      }

      await client.query('COMMIT');

      this.emit('rewardUpdated', {
        rewardId,
        updates: updateData
      });

      return {
        success: true,
        reward: result.rows[0]
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating reward:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get rewards catalog
   */
  async getRewardsCatalog(programId, filters = {}) {
    const client = await this.pool.connect();

    try {
      let query = `
        SELECT r.*,
               COUNT(red.id) as redemption_count,
               AVG(red.rating) as average_rating
        FROM loyalty_rewards_catalog r
        LEFT JOIN loyalty_redemptions red ON r.id = red.reward_id
        WHERE r.program_id = $1
        AND r.status = 'available'
      `;

      const queryParams = [programId];
      let paramCount = 2;

      // Apply filters
      if (filters.category) {
        query += ` AND r.category = $${paramCount++}`;
        queryParams.push(filters.category);
      }

      if (filters.type) {
        query += ` AND r.reward_type = $${paramCount++}`;
        queryParams.push(filters.type);
      }

      if (filters.maxPoints) {
        query += ` AND r.points_required <= $${paramCount++}`;
        queryParams.push(filters.maxPoints);
      }

      if (filters.minTier) {
        query += ` AND r.min_tier_required = $${paramCount++}`;
        queryParams.push(filters.minTier);
      }

      query += `
        GROUP BY r.id
        ORDER BY ${filters.sortBy || 'r.points_required'} ${filters.sortOrder || 'ASC'}
      `;

      if (filters.limit) {
        query += ` LIMIT $${paramCount++}`;
        queryParams.push(filters.limit);
      }

      if (filters.offset) {
        query += ` OFFSET $${paramCount++}`;
        queryParams.push(filters.offset);
      }

      const result = await client.query(query, queryParams);

      // Get categories for filtering
      const categoriesQuery = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM loyalty_rewards_catalog
        WHERE program_id = $1 AND status = 'available'
        GROUP BY category
      `;
      const categoriesResult = await client.query(categoriesQuery, [programId]);

      return {
        rewards: result.rows,
        categories: categoriesResult.rows,
        total: result.rows.length
      };

    } catch (error) {
      console.error('Error getting catalog:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(memberId, limit = 10) {
    const client = await this.pool.connect();

    try {
      // Get member details and history
      const memberQuery = `
        SELECT m.*,
               array_agg(DISTINCT r.category) as past_categories,
               array_agg(DISTINCT r.reward_type) as past_types
        FROM loyalty_members m
        LEFT JOIN loyalty_redemptions red ON m.id = red.member_id
        LEFT JOIN loyalty_rewards_catalog r ON red.reward_id = r.id
        WHERE m.id = $1
        GROUP BY m.id
      `;
      const memberResult = await client.query(memberQuery, [memberId]);

      if (memberResult.rows.length === 0) {
        throw new Error('Member not found');
      }

      const member = memberResult.rows[0];

      // Get recommendations based on:
      // 1. Points balance
      // 2. Past redemption categories
      // 3. Tier level
      // 4. Popular rewards
      const recommendationsQuery = `
        WITH member_preferences AS (
          SELECT unnest($1::text[]) as preferred_category
        ),
        reward_scores AS (
          SELECT r.*,
                 COUNT(red.id) as popularity_score,
                 CASE
                   WHEN r.category = ANY($1::text[]) THEN 10
                   ELSE 0
                 END as preference_score,
                 CASE
                   WHEN r.points_required <= $2 THEN 20
                   WHEN r.points_required <= $2 * 1.5 THEN 10
                   ELSE 0
                 END as affordability_score
          FROM loyalty_rewards_catalog r
          LEFT JOIN loyalty_redemptions red ON r.id = red.reward_id
          WHERE r.program_id = $3
          AND r.status = 'available'
          AND r.points_required <= $2 * 2
          AND (r.min_tier_required IS NULL OR
               r.min_tier_required <= $4)
          GROUP BY r.id
        )
        SELECT *,
               (popularity_score + preference_score + affordability_score) as total_score
        FROM reward_scores
        ORDER BY total_score DESC, popularity_score DESC
        LIMIT $5
      `;

      const recommendations = await client.query(recommendationsQuery, [
        member.past_categories || [],
        member.points_balance,
        member.program_id,
        member.tier_level,
        limit
      ]);

      return {
        recommendations: recommendations.rows,
        memberBalance: member.points_balance,
        memberTier: member.tier_level
      };

    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check reward availability
   */
  async checkAvailability(rewardId) {
    const client = await this.pool.connect();

    try {
      const query = `
        SELECT *,
               CASE
                 WHEN inventory_count IS NULL THEN true
                 WHEN inventory_count > 0 THEN true
                 ELSE false
               END as in_stock,
               CASE
                 WHEN valid_until IS NULL THEN true
                 WHEN valid_until > CURRENT_TIMESTAMP THEN true
                 ELSE false
               END as valid
        FROM loyalty_rewards_catalog
        WHERE id = $1
      `;

      const result = await client.query(query, [rewardId]);

      if (result.rows.length === 0) {
        throw new Error('Reward not found');
      }

      const reward = result.rows[0];

      return {
        available: reward.status === 'available' && reward.in_stock && reward.valid,
        inStock: reward.in_stock,
        valid: reward.valid,
        inventory: reward.inventory_count,
        status: reward.status
      };

    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update inventory
   */
  async updateInventory(rewardId, quantity, operation = 'decrement') {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get current inventory
      const currentQuery = `
        SELECT inventory_count FROM loyalty_rewards_catalog WHERE id = $1
      `;
      const currentResult = await client.query(currentQuery, [rewardId]);

      if (currentResult.rows.length === 0) {
        throw new Error('Reward not found');
      }

      const currentInventory = currentResult.rows[0].inventory_count;

      if (currentInventory === null) {
        // Unlimited inventory
        await client.query('COMMIT');
        return { success: true, unlimited: true };
      }

      let newInventory;
      if (operation === 'decrement') {
        newInventory = currentInventory - quantity;
        if (newInventory < 0) {
          throw new Error('Insufficient inventory');
        }
      } else {
        newInventory = currentInventory + quantity;
      }

      // Update inventory
      await client.query(
        `UPDATE loyalty_rewards_catalog
         SET inventory_count = $1,
             status = CASE WHEN $1 = 0 THEN 'out_of_stock' ELSE status END
         WHERE id = $2`,
        [newInventory, rewardId]
      );

      // Log inventory change
      await client.query(
        `INSERT INTO loyalty_inventory_log (
          reward_id, operation, quantity,
          old_inventory, new_inventory, timestamp
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [rewardId, operation, quantity, currentInventory, newInventory]
      );

      await client.query('COMMIT');

      // Emit low inventory alert if needed
      if (newInventory < 10 && newInventory > 0) {
        this.emit('lowInventory', {
          rewardId,
          currentInventory: newInventory
        });
      }

      return {
        success: true,
        oldInventory: currentInventory,
        newInventory
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating inventory:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create inventory tracking
   */
  async createInventoryTracking(rewardId, initialQuantity, client) {
    await client.query(
      `INSERT INTO loyalty_inventory_tracking (
        reward_id, initial_quantity, current_quantity,
        reserved_quantity, last_restocked
      ) VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)`,
      [rewardId, initialQuantity, initialQuantity]
    );
  }

  /**
   * Setup partner integration
   */
  async setupPartnerIntegration(rewardId, partnerData, client) {
    await client.query(
      `INSERT INTO loyalty_partner_integrations (
        reward_id, partner_name, partner_api_endpoint,
        api_credentials, integration_type,
        sync_frequency, last_sync
      ) VALUES ($1, $2, $3, $4, $5, $6, NULL)`,
      [
        rewardId,
        partnerData.name,
        partnerData.apiEndpoint,
        this.encryptCredentials(partnerData.apiCredentials),
        partnerData.integrationType || 'api',
        partnerData.syncFrequency || 'daily'
      ]
    );
  }

  /**
   * Log price change
   */
  async logPriceChange(rewardId, newPoints, client) {
    // Get old price
    const oldPriceQuery = `
      SELECT points_required FROM loyalty_rewards_catalog WHERE id = $1
    `;
    const oldPriceResult = await client.query(oldPriceQuery, [rewardId]);
    const oldPoints = oldPriceResult.rows[0]?.points_required;

    await client.query(
      `INSERT INTO loyalty_price_history (
        reward_id, old_points, new_points,
        change_percentage, change_date
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [
        rewardId,
        oldPoints,
        newPoints,
        oldPoints ? ((newPoints - oldPoints) / oldPoints * 100) : 0
      ]
    );
  }

  /**
   * Get popular rewards
   */
  async getPopularRewards(programId, limit = 10) {
    const client = await this.pool.connect();

    try {
      const query = `
        SELECT r.*,
               COUNT(red.id) as redemption_count,
               AVG(red.rating) as average_rating,
               COUNT(DISTINCT red.member_id) as unique_redeemers
        FROM loyalty_rewards_catalog r
        LEFT JOIN loyalty_redemptions red ON r.id = red.reward_id
        WHERE r.program_id = $1
        AND r.status = 'available'
        AND red.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY r.id
        ORDER BY redemption_count DESC
        LIMIT $2
      `;

      const result = await client.query(query, [programId, limit]);
      return result.rows;

    } catch (error) {
      console.error('Error getting popular rewards:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get expiring rewards
   */
  async getExpiringRewards(programId, daysAhead = 30) {
    const client = await this.pool.connect();

    try {
      const query = `
        SELECT * FROM loyalty_rewards_catalog
        WHERE program_id = $1
        AND status = 'available'
        AND valid_until IS NOT NULL
        AND valid_until BETWEEN CURRENT_TIMESTAMP
            AND CURRENT_TIMESTAMP + INTERVAL '${daysAhead} days'
        ORDER BY valid_until ASC
      `;

      const result = await client.query(query, [programId]);
      return result.rows;

    } catch (error) {
      console.error('Error getting expiring rewards:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Search rewards
   */
  async searchRewards(programId, searchTerm, filters = {}) {
    const client = await this.pool.connect();

    try {
      const searchQuery = `
        SELECT r.*,
               ts_rank_cd(
                 to_tsvector('english', r.reward_name || ' ' || r.description),
                 plainto_tsquery('english', $2)
               ) as relevance
        FROM loyalty_rewards_catalog r
        WHERE r.program_id = $1
        AND r.status = 'available'
        AND (
          r.reward_name ILIKE $3
          OR r.description ILIKE $3
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(r.metadata->'tags') tag
            WHERE tag ILIKE $3
          )
        )
        ORDER BY relevance DESC, r.points_required ASC
        LIMIT $4
      `;

      const result = await client.query(searchQuery, [
        programId,
        searchTerm,
        `%${searchTerm}%`,
        filters.limit || 20
      ]);

      return result.rows;

    } catch (error) {
      console.error('Error searching rewards:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate reward SKU
   */
  generateRewardSKU(type) {
    const typePrefix = {
      voucher: 'VCH',
      gift_card: 'GFT',
      merchandise: 'MER',
      experience: 'EXP',
      cashback: 'CSH',
      charity_donation: 'CHR',
      airline_miles: 'MLS',
      hotel_points: 'HTL',
      subscription: 'SUB',
      discount_code: 'DSC'
    };

    const prefix = typePrefix[type] || 'RWD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();

    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Encrypt credentials
   */
  encryptCredentials(credentials) {
    // In production, use proper encryption
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default RewardsCatalogManagementService;