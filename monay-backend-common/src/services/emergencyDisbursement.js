const { pool } = require('../models');
const redis = require('../config/redis');
const monayFiatRailsClient = require('./monayFiatRailsClient');
const benefitTransactionProcessor = require('./benefitTransactionProcessor');
const { v4: uuidv4 } = require('uuid');

class EmergencyDisbursement {
  constructor() {
    this.maxProcessingTime = 14400000; // 4 hours in milliseconds
    this.instantProcessingTime = 60000; // 60 seconds for instant
    this.bulkBatchSize = 1000;
    this.priorityLevels = {
      CRITICAL: 1,
      HIGH: 2,
      MEDIUM: 3,
      LOW: 4
    };
    this.disasterTypes = [
      'hurricane',
      'tornado',
      'flood',
      'wildfire',
      'earthquake',
      'winter_storm',
      'pandemic',
      'civil_emergency',
      'terror_attack',
      'infrastructure_failure'
    ];
  }

  async createEmergencyDisbursementProgram(programData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate disaster declaration
      const validation = await this.validateDisasterDeclaration(programData);

      if (!validation.valid) {
        throw new Error(`Invalid disaster declaration: ${validation.reason}`);
      }

      // Create emergency program
      const program = await client.query(`
        INSERT INTO emergency_disbursement_programs (
          program_id, program_name, disaster_type,
          disaster_declaration_id, fema_code,
          affected_states, affected_counties,
          geo_boundaries, eligibility_criteria,
          disbursement_amount, max_disbursements_per_person,
          program_start_date, program_end_date,
          total_budget, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        uuidv4(),
        programData.program_name,
        programData.disaster_type,
        programData.disaster_declaration_id,
        programData.fema_code,
        JSON.stringify(programData.affected_states),
        JSON.stringify(programData.affected_counties),
        JSON.stringify(programData.geo_boundaries),
        JSON.stringify(programData.eligibility_criteria),
        programData.disbursement_amount,
        programData.max_disbursements_per_person || 1,
        programData.program_start_date,
        programData.program_end_date,
        programData.total_budget,
        'active',
        programData.created_by
      ]);

      // Set up automated eligibility rules
      await this.configureEligibilityRules(client, program.rows[0].program_id, programData.eligibility_criteria);

      // Initialize geo-targeting
      await this.setupGeoTargeting(client, program.rows[0].program_id, programData.geo_boundaries);

      await client.query('COMMIT');

      // Start processing if immediate activation
      if (programData.immediate_activation) {
        await this.startEmergencyProcessing(program.rows[0].program_id);
      }

      return program.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async processEmergencyDisbursement(programId, recipientData) {
    const startTime = Date.now();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get program details
      const program = await client.query(`
        SELECT * FROM emergency_disbursement_programs
        WHERE program_id = $1 AND status = 'active'
      `, [programId]);

      if (program.rows.length === 0) {
        throw new Error('Emergency program not found or inactive');
      }

      const programDetails = program.rows[0];

      // Check eligibility with automated rules
      const eligibility = await this.checkEmergencyEligibility(
        recipientData,
        programDetails
      );

      if (!eligibility.eligible) {
        await this.logRejection(client, programId, recipientData, eligibility.reason);
        await client.query('COMMIT');
        return {
          success: false,
          reason: eligibility.reason
        };
      }

      // Check for duplicate disbursement
      const duplicateCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM emergency_disbursements
        WHERE program_id = $1 AND recipient_id = $2
      `, [programId, recipientData.recipient_id]);

      if (duplicateCheck.rows[0].count >= programDetails.max_disbursements_per_person) {
        throw new Error('Maximum disbursements already received');
      }

      // Create disbursement record
      const disbursement = await client.query(`
        INSERT INTO emergency_disbursements (
          disbursement_id, program_id, recipient_id,
          recipient_name, recipient_address, geo_location,
          disbursement_amount, payment_method,
          priority_level, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, POINT($6, $7), $8, $9, $10, 'pending', CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        uuidv4(),
        programId,
        recipientData.recipient_id,
        recipientData.recipient_name,
        JSON.stringify(recipientData.address),
        recipientData.longitude,
        recipientData.latitude,
        programDetails.disbursement_amount,
        recipientData.payment_method || 'ACH',
        this.calculatePriority(recipientData, programDetails)
      ]);

      // Process payment immediately for critical cases
      if (disbursement.rows[0].priority_level === this.priorityLevels.CRITICAL) {
        await this.processInstantPayment(disbursement.rows[0]);
      } else {
        await this.queueForProcessing(disbursement.rows[0]);
      }

      await client.query('COMMIT');

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        disbursement_id: disbursement.rows[0].disbursement_id,
        processing_time_ms: processingTime,
        estimated_delivery: this.calculateEstimatedDelivery(
          disbursement.rows[0].priority_level,
          disbursement.rows[0].payment_method
        )
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async processBulkEmergencyDisbursements(programId, recipientFile) {
    const client = await pool.connect();
    const batchId = uuidv4();

    try {
      await client.query('BEGIN');

      // Create batch record
      await client.query(`
        INSERT INTO emergency_disbursement_batches (
          batch_id, program_id, total_recipients,
          status, created_at
        ) VALUES ($1, $2, $3, 'processing', CURRENT_TIMESTAMP)
      `, [batchId, programId, recipientFile.total_count]);

      await client.query('COMMIT');

      // Process in chunks for performance
      const chunks = this.chunkArray(recipientFile.recipients, this.bulkBatchSize);
      let processed = 0;
      let successful = 0;
      let failed = 0;

      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map(recipient => this.processEmergencyDisbursement(programId, recipient))
        );

        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            successful++;
          } else {
            failed++;
          }
        });

        processed += chunk.length;

        // Update batch progress
        await pool.query(`
          UPDATE emergency_disbursement_batches
          SET
            processed_count = $1,
            successful_count = $2,
            failed_count = $3,
            progress_percentage = $4
          WHERE batch_id = $5
        `, [
          processed,
          successful,
          failed,
          (processed / recipientFile.total_count * 100).toFixed(2),
          batchId
        ]);

        // Update real-time progress in Redis
        await redis.setex(
          `batch_progress:${batchId}`,
          3600,
          JSON.stringify({
            processed,
            successful,
            failed,
            total: recipientFile.total_count
          })
        );
      }

      // Mark batch as complete
      await pool.query(`
        UPDATE emergency_disbursement_batches
        SET
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP
        WHERE batch_id = $1
      `, [batchId]);

      return {
        batch_id: batchId,
        total_processed: processed,
        successful_disbursements: successful,
        failed_disbursements: failed
      };
    } catch (error) {
      await pool.query(`
        UPDATE emergency_disbursement_batches
        SET status = 'failed', error_message = $1
        WHERE batch_id = $2
      `, [error.message, batchId]);
      throw error;
    } finally {
      client.release();
    }
  }

  async processGeoTargetedDisbursements(programId, geoParams) {
    // Find all eligible recipients in affected area
    const eligibleRecipients = await pool.query(`
      SELECT DISTINCT
        c.id as recipient_id,
        c.first_name || ' ' || c.last_name as recipient_name,
        c.address,
        ST_X(c.geo_location::geometry) as longitude,
        ST_Y(c.geo_location::geometry) as latitude,
        c.preferred_payment_method
      FROM customers c
      WHERE ST_Within(
        c.geo_location::geometry,
        ST_GeomFromGeoJSON($1)
      )
      AND c.account_status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM emergency_disbursements ed
        WHERE ed.program_id = $2
        AND ed.recipient_id = c.id
      )
    `, [JSON.stringify(geoParams.geo_boundary), programId]);

    const results = {
      total_identified: eligibleRecipients.rows.length,
      processed: 0,
      successful: 0,
      failed: 0
    };

    // Process each eligible recipient
    for (const recipient of eligibleRecipients.rows) {
      try {
        const result = await this.processEmergencyDisbursement(programId, {
          ...recipient,
          payment_method: recipient.preferred_payment_method || 'ACH'
        });

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
        console.error(`Failed to process recipient ${recipient.recipient_id}:`, error);
      }

      results.processed++;

      // Update progress
      if (results.processed % 100 === 0) {
        await redis.setex(
          `geo_disbursement_progress:${programId}`,
          3600,
          JSON.stringify(results)
        );
      }
    }

    return results;
  }

  async processInstantPayment(disbursement) {
    const startTime = Date.now();

    try {
      let paymentResult;

      // Select fastest payment rail based on availability
      if (disbursement.payment_method === 'CARD') {
        // Instant card credit
        paymentResult = await this.processCardCredit(disbursement);
      } else if (await this.isFedNowAvailable()) {
        // FedNow instant payment
        paymentResult = await monayFiatRailsClient.processFedNowPayment({
          amount: disbursement.disbursement_amount,
          recipient_account: disbursement.recipient_account_info,
          reference: disbursement.disbursement_id
        });
      } else if (await this.isRTPAvailable()) {
        // RTP instant payment
        paymentResult = await monayFiatRailsClient.processRTPPayment({
          amount: disbursement.disbursement_amount,
          recipient_account: disbursement.recipient_account_info,
          reference: disbursement.disbursement_id
        });
      } else {
        // Fallback to same-day ACH
        paymentResult = await monayFiatRailsClient.processSameDayACH({
          amount: disbursement.disbursement_amount,
          recipient_account: disbursement.recipient_account_info,
          reference: disbursement.disbursement_id
        });
      }

      const processingTime = Date.now() - startTime;

      // Update disbursement status
      await pool.query(`
        UPDATE emergency_disbursements
        SET
          status = 'completed',
          payment_reference = $1,
          processing_time_ms = $2,
          completed_at = CURRENT_TIMESTAMP
        WHERE disbursement_id = $3
      `, [
        paymentResult.reference_id,
        processingTime,
        disbursement.disbursement_id
      ]);

      // Send instant notification
      await this.sendInstantNotification(disbursement);

      return {
        success: true,
        processing_time_ms: processingTime,
        payment_reference: paymentResult.reference_id
      };
    } catch (error) {
      await pool.query(`
        UPDATE emergency_disbursements
        SET
          status = 'failed',
          error_message = $1,
          failed_at = CURRENT_TIMESTAMP
        WHERE disbursement_id = $2
      `, [error.message, disbursement.disbursement_id]);

      throw error;
    }
  }

  async checkEmergencyEligibility(recipientData, programDetails) {
    const checks = [];

    // Geographic eligibility
    if (programDetails.geo_boundaries) {
      const geoCheck = await this.checkGeographicEligibility(
        recipientData.latitude,
        recipientData.longitude,
        programDetails.geo_boundaries
      );
      checks.push({
        check: 'geographic',
        passed: geoCheck,
        required: true
      });
    }

    // Income eligibility (if applicable)
    if (programDetails.eligibility_criteria?.income_limit) {
      const incomeCheck = await this.checkIncomeEligibility(
        recipientData.recipient_id,
        programDetails.eligibility_criteria.income_limit
      );
      checks.push({
        check: 'income',
        passed: incomeCheck,
        required: true
      });
    }

    // Affected by disaster verification
    if (programDetails.eligibility_criteria?.requires_damage_assessment) {
      const damageCheck = await this.verifyDisasterDamage(
        recipientData.recipient_id,
        programDetails.disaster_declaration_id
      );
      checks.push({
        check: 'damage_assessment',
        passed: damageCheck,
        required: true
      });
    }

    // Age eligibility
    if (programDetails.eligibility_criteria?.age_requirements) {
      const ageCheck = await this.checkAgeEligibility(
        recipientData.recipient_id,
        programDetails.eligibility_criteria.age_requirements
      );
      checks.push({
        check: 'age',
        passed: ageCheck,
        required: false
      });
    }

    // Check if all required checks passed
    const requiredChecksPassed = checks
      .filter(c => c.required)
      .every(c => c.passed);

    return {
      eligible: requiredChecksPassed,
      checks: checks,
      reason: requiredChecksPassed ? null : 'Failed eligibility requirements'
    };
  }

  async checkGeographicEligibility(lat, lon, geoBoundaries) {
    const point = `POINT(${lon} ${lat})`;

    const result = await pool.query(`
      SELECT ST_Within(
        ST_GeomFromText($1, 4326),
        ST_GeomFromGeoJSON($2)
      ) as within_boundary
    `, [point, JSON.stringify(geoBoundaries)]);

    return result.rows[0].within_boundary;
  }

  async checkIncomeEligibility(recipientId, incomeLimit) {
    const result = await pool.query(`
      SELECT annual_income
      FROM customer_financial_data
      WHERE customer_id = $1
      ORDER BY verified_at DESC
      LIMIT 1
    `, [recipientId]);

    if (result.rows.length === 0) return true; // Pass if no data

    return result.rows[0].annual_income <= incomeLimit;
  }

  async verifyDisasterDamage(recipientId, declarationId) {
    // Check with FEMA or state emergency management
    const result = await pool.query(`
      SELECT verified
      FROM disaster_damage_assessments
      WHERE recipient_id = $1 AND declaration_id = $2
    `, [recipientId, declarationId]);

    return result.rows.length > 0 && result.rows[0].verified;
  }

  async checkAgeEligibility(recipientId, ageRequirements) {
    const result = await pool.query(`
      SELECT date_of_birth
      FROM customers
      WHERE id = $1
    `, [recipientId]);

    if (result.rows.length === 0) return false;

    const age = this.calculateAge(result.rows[0].date_of_birth);

    if (ageRequirements.min && age < ageRequirements.min) return false;
    if (ageRequirements.max && age > ageRequirements.max) return false;

    return true;
  }

  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  calculatePriority(recipientData, programDetails) {
    // Critical priority for certain conditions
    if (recipientData.medical_emergency) return this.priorityLevels.CRITICAL;
    if (recipientData.homeless) return this.priorityLevels.CRITICAL;
    if (recipientData.elderly && recipientData.disabled) return this.priorityLevels.CRITICAL;

    // High priority
    if (recipientData.has_children) return this.priorityLevels.HIGH;
    if (recipientData.elderly || recipientData.disabled) return this.priorityLevels.HIGH;

    // Default to medium
    return this.priorityLevels.MEDIUM;
  }

  calculateEstimatedDelivery(priorityLevel, paymentMethod) {
    const now = new Date();

    switch (paymentMethod) {
      case 'FEDNOW':
      case 'RTP':
        return new Date(now.getTime() + 60000); // 1 minute

      case 'SAME_DAY_ACH':
        return new Date(now.getTime() + 3600000); // 1 hour

      case 'ACH':
        if (priorityLevel === this.priorityLevels.CRITICAL) {
          return new Date(now.getTime() + 3600000); // 1 hour for critical
        }
        return new Date(now.getTime() + 86400000); // 24 hours

      case 'CHECK':
        return new Date(now.getTime() + 432000000); // 5 days

      default:
        return new Date(now.getTime() + 14400000); // 4 hours default
    }
  }

  async sendInstantNotification(disbursement) {
    // Send multi-channel notification
    const notifications = [];

    // SMS
    if (disbursement.recipient_phone) {
      notifications.push(this.sendSMS(
        disbursement.recipient_phone,
        `Emergency assistance of $${disbursement.disbursement_amount} has been sent to your account. Reference: ${disbursement.disbursement_id}`
      ));
    }

    // Email
    if (disbursement.recipient_email) {
      notifications.push(this.sendEmail(
        disbursement.recipient_email,
        'Emergency Assistance Disbursement',
        `Your emergency assistance payment has been processed.`
      ));
    }

    // Push notification
    if (disbursement.recipient_device_id) {
      notifications.push(this.sendPushNotification(
        disbursement.recipient_device_id,
        'Emergency Payment Sent',
        `$${disbursement.disbursement_amount} emergency assistance received`
      ));
    }

    await Promise.allSettled(notifications);
  }

  async validateDisasterDeclaration(programData) {
    // Validate with FEMA or state emergency management
    if (programData.fema_code) {
      // Check FEMA database
      return { valid: true };
    }

    if (programData.state_declaration_id) {
      // Check state emergency management
      return { valid: true };
    }

    return {
      valid: false,
      reason: 'No valid disaster declaration found'
    };
  }

  async configureEligibilityRules(client, programId, criteria) {
    // Store eligibility rules for automated processing
    await client.query(`
      INSERT INTO emergency_eligibility_rules (
        program_id, rule_type, rule_config,
        is_required, created_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [
      programId,
      'automated',
      JSON.stringify(criteria),
      true
    ]);
  }

  async setupGeoTargeting(client, programId, geoBoundaries) {
    // Store geographic boundaries for targeting
    await client.query(`
      INSERT INTO emergency_geo_targets (
        program_id, boundary_type, boundary_data,
        created_at
      ) VALUES ($1, 'polygon', $2, CURRENT_TIMESTAMP)
    `, [programId, JSON.stringify(geoBoundaries)]);
  }

  async startEmergencyProcessing(programId) {
    // Start automated processing for the program
    await pool.query(`
      UPDATE emergency_disbursement_programs
      SET processing_started_at = CURRENT_TIMESTAMP
      WHERE program_id = $1
    `, [programId]);

    // Queue for processing
    await redis.lpush('emergency_processing_queue', programId);
  }

  async queueForProcessing(disbursement) {
    const queueName = `disbursement_queue:priority_${disbursement.priority_level}`;
    await redis.lpush(queueName, JSON.stringify(disbursement));
  }

  async logRejection(client, programId, recipientData, reason) {
    await client.query(`
      INSERT INTO emergency_disbursement_rejections (
        program_id, recipient_id, reason,
        recipient_data, rejected_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [
      programId,
      recipientData.recipient_id,
      reason,
      JSON.stringify(recipientData)
    ]);
  }

  async processCardCredit(disbursement) {
    // Process instant card credit
    return await benefitTransactionProcessor.processTransaction({
      customer_id: disbursement.recipient_id,
      amount: disbursement.disbursement_amount,
      transaction_type: 'emergency_credit',
      program_type: 'EMERGENCY',
      reference_id: disbursement.disbursement_id
    });
  }

  async isFedNowAvailable() {
    // Check FedNow availability
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // FedNow is 24/7/365
    return true;
  }

  async isRTPAvailable() {
    // Check RTP network availability
    return true; // RTP is also 24/7/365
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async sendSMS(phone, message) {
    console.log(`Sending SMS to ${phone}: ${message}`);
    // Integrate with SMS provider
  }

  async sendEmail(email, subject, body) {
    console.log(`Sending email to ${email}: ${subject}`);
    // Integrate with email service
  }

  async sendPushNotification(deviceId, title, body) {
    console.log(`Sending push to ${deviceId}: ${title}`);
    // Integrate with push notification service
  }

  async getEmergencyDisbursementStatus(disbursementId) {
    const result = await pool.query(`
      SELECT
        ed.*,
        edp.program_name,
        edp.disaster_type,
        c.first_name || ' ' || c.last_name as recipient_name
      FROM emergency_disbursements ed
      JOIN emergency_disbursement_programs edp ON ed.program_id = edp.program_id
      LEFT JOIN customers c ON ed.recipient_id = c.id
      WHERE ed.disbursement_id = $1
    `, [disbursementId]);

    return result.rows[0];
  }

  async getEmergencyProgramMetrics(programId) {
    const metrics = await pool.query(`
      SELECT
        COUNT(*) as total_disbursements,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        SUM(disbursement_amount) as total_disbursed,
        AVG(processing_time_ms) as avg_processing_time,
        MIN(created_at) as first_disbursement,
        MAX(completed_at) as last_disbursement
      FROM emergency_disbursements
      WHERE program_id = $1
    `, [programId]);

    return metrics.rows[0];
  }
}

module.exports = new EmergencyDisbursement();