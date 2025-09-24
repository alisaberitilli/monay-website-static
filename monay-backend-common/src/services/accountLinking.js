import { pool } from '../models/index.js';
import redis from '../config/redis.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class AccountLinking {
  constructor() {
    this.linkingTokenExpiry = 300; // 5 minutes
    this.maxLinkedAccounts = 10;
    this.trustedProviders = [
      'login.gov',
      'id.me',
      'google',
      'apple',
      'microsoft',
      'facebook',
      'state_dmv',
      'irs.gov',
      'ssa.gov'
    ];
  }

  async initiateAccountLinking(primaryAccountId, linkingMethod) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if primary account exists and is eligible
      const primaryAccount = await client.query(`
        SELECT * FROM customers
        WHERE id = $1 AND account_status = 'active'
      `, [primaryAccountId]);

      if (primaryAccount.rows.length === 0) {
        throw new Error('Primary account not found or inactive');
      }

      // Generate secure linking token
      const linkingToken = this.generateLinkingToken();
      const linkingCode = this.generateLinkingCode();

      // Store linking request
      const linkingRequest = await client.query(`
        INSERT INTO account_linking_requests (
          primary_account_id, linking_token, linking_code,
          linking_method, status, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, 'pending',
          CURRENT_TIMESTAMP + INTERVAL '5 minutes', CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        primaryAccountId,
        linkingToken,
        linkingCode,
        linkingMethod
      ]);

      await client.query('COMMIT');

      // Cache the linking request for quick validation
      await redis.setex(
        `linking:${linkingToken}`,
        this.linkingTokenExpiry,
        JSON.stringify({
          primary_account_id: primaryAccountId,
          linking_code: linkingCode,
          method: linkingMethod
        })
      );

      return {
        linking_token: linkingToken,
        linking_code: linkingCode,
        expires_in: this.linkingTokenExpiry,
        qr_code: await this.generateQRCode(linkingToken),
        deep_link: this.generateDeepLink(linkingToken)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async linkFederalIdentity(accountId, identityProvider, federalIdentityData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate identity provider
      if (!this.trustedProviders.includes(identityProvider)) {
        throw new Error('Untrusted identity provider');
      }

      // Check for existing link
      const existingLink = await client.query(`
        SELECT * FROM linked_identities
        WHERE account_id = $1 AND provider = $2
      `, [accountId, identityProvider]);

      if (existingLink.rows.length > 0) {
        throw new Error('Identity already linked to this account');
      }

      // Verify the identity hasn't been linked to another account
      const duplicateCheck = await client.query(`
        SELECT * FROM linked_identities
        WHERE provider = $1 AND provider_user_id = $2
      `, [identityProvider, federalIdentityData.provider_user_id]);

      if (duplicateCheck.rows.length > 0) {
        throw new Error('This identity is already linked to another account');
      }

      // Store the linked identity
      const linkedIdentity = await client.query(`
        INSERT INTO linked_identities (
          account_id, provider, provider_user_id,
          identity_attributes, verification_level,
          trust_score, last_verified, is_primary,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8)
        RETURNING *
      `, [
        accountId,
        identityProvider,
        federalIdentityData.provider_user_id,
        JSON.stringify(federalIdentityData.attributes),
        federalIdentityData.verification_level || 'IAL2',
        this.calculateTrustScore(identityProvider, federalIdentityData),
        federalIdentityData.is_primary || false,
        JSON.stringify(federalIdentityData.metadata || {})
      ]);

      // Update account verification status if this is a federal identity
      if (['login.gov', 'id.me', 'irs.gov', 'ssa.gov'].includes(identityProvider)) {
        await client.query(`
          UPDATE customers
          SET
            federal_identity_verified = true,
            verification_level = GREATEST(verification_level, 'IAL2'),
            verified_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [accountId]);
      }

      // Log the linking event
      await client.query(`
        INSERT INTO account_linking_audit (
          account_id, action, provider, provider_user_id,
          ip_address, user_agent, success, created_at
        ) VALUES ($1, 'link', $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
      `, [
        accountId,
        identityProvider,
        federalIdentityData.provider_user_id,
        federalIdentityData.ip_address,
        federalIdentityData.user_agent
      ]);

      await client.query('COMMIT');

      return linkedIdentity.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async linkBenefitPrograms(accountId, programLinks) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const linkedPrograms = [];

      for (const program of programLinks) {
        // Verify program eligibility with external system
        const eligibility = await this.verifyProgramEligibility(
          accountId,
          program.program_type,
          program.credentials
        );

        if (!eligibility.eligible) {
          continue;
        }

        // Link the benefit program
        const link = await client.query(`
          INSERT INTO linked_benefit_programs (
            account_id, program_type, external_id,
            enrollment_date, eligibility_data,
            last_verification, status
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'active')
          ON CONFLICT (account_id, program_type)
          DO UPDATE SET
            external_id = EXCLUDED.external_id,
            eligibility_data = EXCLUDED.eligibility_data,
            last_verification = CURRENT_TIMESTAMP
          RETURNING *
        `, [
          accountId,
          program.program_type,
          program.external_id,
          program.enrollment_date,
          JSON.stringify(eligibility.data)
        ]);

        linkedPrograms.push(link.rows[0]);
      }

      await client.query('COMMIT');

      return {
        linked_count: linkedPrograms.length,
        programs: linkedPrograms
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async linkBankAccount(accountId, bankAccountData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate bank account using Plaid or similar
      const validation = await this.validateBankAccount(bankAccountData);

      if (!validation.valid) {
        throw new Error('Bank account validation failed');
      }

      // Encrypt sensitive bank data
      const encryptedAccountNumber = await this.encryptData(
        bankAccountData.account_number
      );
      const encryptedRoutingNumber = await this.encryptData(
        bankAccountData.routing_number
      );

      // Store linked bank account
      const linkedAccount = await client.query(`
        INSERT INTO linked_bank_accounts (
          account_id, bank_name, account_type,
          account_number_encrypted, routing_number_encrypted,
          account_holder_name, verification_method,
          verification_status, is_primary,
          plaid_access_token, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, bank_name, account_type,
          RIGHT(account_number_encrypted, 4) as last_four,
          verification_status, is_primary
      `, [
        accountId,
        validation.bank_name,
        bankAccountData.account_type,
        encryptedAccountNumber,
        encryptedRoutingNumber,
        bankAccountData.account_holder_name,
        bankAccountData.verification_method || 'micro_deposits',
        'pending',
        bankAccountData.is_primary || false,
        validation.access_token,
        JSON.stringify(bankAccountData.metadata || {})
      ]);

      // Initiate verification process
      if (bankAccountData.verification_method === 'micro_deposits') {
        await this.initiateMicroDeposits(linkedAccount.rows[0].id);
      }

      await client.query('COMMIT');

      return linkedAccount.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async linkStateAgency(accountId, stateAgencyData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate state agency credentials
      const validation = await this.validateStateAgencyAccess(
        stateAgencyData.state,
        stateAgencyData.agency,
        stateAgencyData.credentials
      );

      if (!validation.authorized) {
        throw new Error('State agency authorization failed');
      }

      // Store state agency link
      const link = await client.query(`
        INSERT INTO linked_state_agencies (
          account_id, state_code, agency_type,
          agency_account_id, authorization_token,
          permissions, expires_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        accountId,
        stateAgencyData.state,
        stateAgencyData.agency,
        validation.agency_account_id,
        validation.authorization_token,
        JSON.stringify(validation.permissions),
        validation.expires_at,
        JSON.stringify(stateAgencyData.metadata || {})
      ]);

      // Fetch and store initial data from state agency
      await this.syncStateAgencyData(link.rows[0].id);

      await client.query('COMMIT');

      return link.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async mergeAccounts(primaryAccountId, secondaryAccountIds) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate all accounts exist and belong to same person
      const validation = await this.validateAccountMerge(
        primaryAccountId,
        secondaryAccountIds
      );

      if (!validation.can_merge) {
        throw new Error(`Cannot merge accounts: ${validation.reason}`);
      }

      const mergeResults = {
        transactions_moved: 0,
        benefits_consolidated: 0,
        cards_transferred: 0,
        documents_migrated: 0
      };

      for (const secondaryId of secondaryAccountIds) {
        // Move transactions
        const txResult = await client.query(`
          UPDATE transactions
          SET customer_id = $1
          WHERE customer_id = $2
        `, [primaryAccountId, secondaryId]);
        mergeResults.transactions_moved += txResult.rowCount;

        // Consolidate benefits
        const benefitResult = await client.query(`
          UPDATE government_benefits
          SET customer_id = $1
          WHERE customer_id = $2
          AND NOT EXISTS (
            SELECT 1 FROM government_benefits
            WHERE customer_id = $1
            AND program_type = government_benefits.program_type
          )
        `, [primaryAccountId, secondaryId]);
        mergeResults.benefits_consolidated += benefitResult.rowCount;

        // Transfer cards
        const cardResult = await client.query(`
          UPDATE cards
          SET user_id = $1
          WHERE user_id = $2
        `, [primaryAccountId, secondaryId]);
        mergeResults.cards_transferred += cardResult.rowCount;

        // Mark secondary account as merged
        await client.query(`
          UPDATE customers
          SET
            account_status = 'merged',
            merged_into = $1,
            merged_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [primaryAccountId, secondaryId]);

        // Create merge audit record
        await client.query(`
          INSERT INTO account_merge_audit (
            primary_account_id, secondary_account_id,
            merge_type, data_transferred, performed_by
          ) VALUES ($1, $2, 'full', $3, $4)
        `, [
          primaryAccountId,
          secondaryId,
          JSON.stringify(mergeResults),
          'system'
        ]);
      }

      await client.query('COMMIT');

      return {
        primary_account_id: primaryAccountId,
        merged_count: secondaryAccountIds.length,
        results: mergeResults
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async unlinkAccount(accountId, providerToUnlink) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if this is the last identity provider
      const linkedCount = await client.query(`
        SELECT COUNT(*) as count
        FROM linked_identities
        WHERE account_id = $1
      `, [accountId]);

      if (linkedCount.rows[0].count <= 1) {
        throw new Error('Cannot unlink the last identity provider');
      }

      // Remove the link
      await client.query(`
        DELETE FROM linked_identities
        WHERE account_id = $1 AND provider = $2
      `, [accountId, providerToUnlink]);

      // Log the unlinking
      await client.query(`
        INSERT INTO account_linking_audit (
          account_id, action, provider, success
        ) VALUES ($1, 'unlink', $2, true)
      `, [accountId, providerToUnlink]);

      await client.query('COMMIT');

      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getLinkedAccounts(accountId) {
    const result = await pool.query(`
      SELECT
        li.provider,
        li.provider_user_id,
        li.verification_level,
        li.trust_score,
        li.last_verified,
        li.is_primary,
        COUNT(bt.id) as transaction_count,
        SUM(bt.amount) as total_amount
      FROM linked_identities li
      LEFT JOIN benefit_transactions bt ON bt.customer_id = $1
      WHERE li.account_id = $1
      GROUP BY li.id, li.provider, li.provider_user_id,
        li.verification_level, li.trust_score,
        li.last_verified, li.is_primary
      ORDER BY li.is_primary DESC, li.trust_score DESC
    `, [accountId]);

    const bankAccounts = await pool.query(`
      SELECT
        bank_name,
        account_type,
        RIGHT(account_number_encrypted, 4) as last_four,
        verification_status,
        is_primary
      FROM linked_bank_accounts
      WHERE account_id = $1
      ORDER BY is_primary DESC
    `, [accountId]);

    const benefitPrograms = await pool.query(`
      SELECT
        program_type,
        external_id,
        enrollment_date,
        last_verification,
        status
      FROM linked_benefit_programs
      WHERE account_id = $1
      ORDER BY enrollment_date DESC
    `, [accountId]);

    return {
      identity_providers: result.rows,
      bank_accounts: bankAccounts.rows,
      benefit_programs: benefitPrograms.rows
    };
  }

  async syncLinkedAccountData(accountId) {
    const linkedAccounts = await this.getLinkedAccounts(accountId);
    const syncResults = [];

    // Sync each identity provider
    for (const provider of linkedAccounts.identity_providers) {
      try {
        const syncResult = await this.syncProviderData(
          accountId,
          provider.provider,
          provider.provider_user_id
        );
        syncResults.push({
          provider: provider.provider,
          status: 'success',
          data_synced: syncResult
        });
      } catch (error) {
        syncResults.push({
          provider: provider.provider,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update last sync timestamp
    await pool.query(`
      UPDATE customers
      SET last_sync = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [accountId]);

    return syncResults;
  }

  async syncProviderData(accountId, provider, providerUserId) {
    // This would integrate with actual provider APIs
    const mockData = {
      profile_updates: 0,
      transactions_imported: 0,
      documents_fetched: 0
    };

    // In production, this would call provider-specific APIs
    switch (provider) {
      case 'login.gov':
        // Sync federal identity data
        break;
      case 'id.me':
        // Sync military/veteran status
        break;
      case 'irs.gov':
        // Sync tax information
        break;
      case 'ssa.gov':
        // Sync social security benefits
        break;
    }

    return mockData;
  }

  calculateTrustScore(provider, identityData) {
    let score = 0;

    // Provider trust levels
    const providerScores = {
      'login.gov': 100,
      'id.me': 95,
      'irs.gov': 100,
      'ssa.gov': 100,
      'state_dmv': 90,
      'google': 70,
      'apple': 75,
      'microsoft': 70,
      'facebook': 60
    };

    score += providerScores[provider] || 50;

    // Verification level bonus
    if (identityData.verification_level === 'IAL3') score += 20;
    else if (identityData.verification_level === 'IAL2') score += 10;

    // Document verification bonus
    if (identityData.attributes?.document_verified) score += 15;

    // Biometric verification bonus
    if (identityData.attributes?.biometric_verified) score += 15;

    return Math.min(score, 150); // Cap at 150
  }

  generateLinkingToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateLinkingCode() {
    // Generate 6-digit code for manual entry
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateQRCode(linkingToken) {
    // In production, use a QR code library
    const url = `https://app.monay.com/link/${linkingToken}`;
    return `QR:${url}`;
  }

  generateDeepLink(linkingToken) {
    return `monay://link/${linkingToken}`;
  }

  async validateBankAccount(bankAccountData) {
    // In production, integrate with Plaid or similar
    return {
      valid: true,
      bank_name: 'Chase Bank',
      access_token: 'plaid_token_' + uuidv4()
    };
  }

  async initiateMicroDeposits(linkedAccountId) {
    // Initiate micro deposits for verification
    const amounts = [
      Math.floor(Math.random() * 99) / 100,
      Math.floor(Math.random() * 99) / 100
    ];

    await pool.query(`
      INSERT INTO micro_deposits (
        linked_account_id, amount_1, amount_2,
        initiated_at, expires_at
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '3 days')
    `, [linkedAccountId, amounts[0], amounts[1]]);

    return amounts;
  }

  async encryptData(data) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  async validateStateAgencyAccess(state, agency, credentials) {
    // In production, integrate with state agency APIs
    return {
      authorized: true,
      agency_account_id: `${state}_${agency}_${uuidv4()}`,
      authorization_token: crypto.randomBytes(32).toString('hex'),
      permissions: ['read', 'verify'],
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
  }

  async syncStateAgencyData(linkId) {
    // Sync initial data from state agency
    console.log('Syncing state agency data for link:', linkId);
  }

  async validateAccountMerge(primaryId, secondaryIds) {
    // Validate that accounts can be merged
    const primary = await pool.query(`
      SELECT * FROM customers WHERE id = $1
    `, [primaryId]);

    if (primary.rows.length === 0) {
      return { can_merge: false, reason: 'Primary account not found' };
    }

    for (const secondaryId of secondaryIds) {
      const secondary = await pool.query(`
        SELECT * FROM customers WHERE id = $1
      `, [secondaryId]);

      if (secondary.rows.length === 0) {
        return { can_merge: false, reason: `Secondary account ${secondaryId} not found` };
      }

      // Check SSN match or other identity verification
      if (primary.rows[0].ssn_hash !== secondary.rows[0].ssn_hash) {
        return { can_merge: false, reason: 'Identity mismatch' };
      }
    }

    return { can_merge: true };
  }

  async verifyProgramEligibility(accountId, programType, credentials) {
    // In production, verify with actual program systems
    return {
      eligible: true,
      data: {
        verified_at: new Date(),
        eligibility_period: '2025-01-01 to 2025-12-31'
      }
    };
  }
}

export default new AccountLinking();