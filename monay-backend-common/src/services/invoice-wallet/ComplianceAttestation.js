/**
 * Compliance Attestation Service
 * Zero-knowledge proofs for cross-chain regulatory compliance
 * Part of Monay's patented Invoice-First Wallet System
 *
 * @module ComplianceAttestation
 */

const crypto = require('crypto');
const loggers = require('../logger');
const logger = {
  info: (msg, data) => loggers.logger ? loggers.logger.info(msg, data) : console.log(msg, data),
  error: (msg, data) => loggers.errorLogger ? loggers.errorLogger.error(msg, data) : console.error(msg, data),
  warn: (msg, data) => loggers.logger ? loggers.logger.warn(msg, data) : console.warn(msg, data),
  debug: (msg, data) => loggers.logger ? loggers.logger.debug(msg, data) : console.debug(msg, data)
};

/**
 * Cross-Chain Compliance Attestation
 * Generates cryptographic proofs of compliance without revealing sensitive data
 */
class ComplianceAttestation {
  constructor() {
    this.supportedAttestations = [
      'kyc',          // Know Your Customer verification
      'aml',          // Anti-Money Laundering check
      'tax',          // Tax reporting compliance
      'sanctions',    // Sanctions screening
      'age',          // Age verification
      'jurisdiction', // Jurisdictional compliance
      'accreditation' // Investor accreditation
    ];

    this.complianceProviders = {
      'persona': { supported: ['kyc', 'age'], active: true },
      'alloy': { supported: ['kyc', 'aml'], active: true },
      'onfido': { supported: ['kyc', 'age'], active: true },
      'chainalysis': { supported: ['aml', 'sanctions'], active: false }
    };

    this.attestationCache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Generate compliance attestation for wallet
   * @param {Object} wallet - Wallet requiring attestation
   * @param {string} type - Type of attestation required
   * @param {Object} evidence - Compliance evidence data
   * @returns {Promise<Object>} Attestation proof
   */
  async generateAttestation(wallet, type, evidence) {
    const startTime = Date.now();

    try {
      logger.info('Generating compliance attestation', {
        walletId: wallet.id,
        type,
        chain: wallet.chain
      });

      // Validate attestation type
      if (!this.supportedAttestations.includes(type)) {
        throw new Error(`Unsupported attestation type: ${type}`);
      }

      // Check cache
      const cacheKey = this.getCacheKey(wallet.id, type);
      const cached = this.getCachedAttestation(cacheKey);
      if (cached && cached.valid) {
        logger.debug('Using cached attestation', { walletId: wallet.id, type });
        return cached;
      }

      // Generate zero-knowledge proof
      const proof = await this.generateZKProof(type, evidence);

      // Create attestation
      const attestation = {
        id: this.generateAttestationId(),
        walletId: wallet.id,
        type,
        proof,
        metadata: {
          chain: wallet.chain,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours
          issuer: 'monay-compliance-engine',
          version: '1.0.0'
        },
        signature: null,
        valid: true
      };

      // Sign attestation
      attestation.signature = await this.signAttestation(attestation);

      // Store in cache
      this.cacheAttestation(cacheKey, attestation);

      // Record on blockchain (async)
      this.recordOnChain(attestation, wallet.chain).catch(error => {
        logger.error('Failed to record attestation on chain', {
          error: error.message,
          attestationId: attestation.id
        });
      });

      logger.info('Compliance attestation generated', {
        attestationId: attestation.id,
        type,
        duration: Date.now() - startTime
      });

      return attestation;
    } catch (error) {
      logger.error('Attestation generation failed', {
        walletId: wallet.id,
        type,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate zero-knowledge proof for compliance
   * @param {string} type - Type of compliance proof
   * @param {Object} evidence - Evidence data
   * @returns {Promise<Object>} ZK proof
   */
  async generateZKProof(type, evidence) {
    // Implementation of ZK proof generation
    // In production, use libraries like snarkjs or libsnark

    const proof = {
      type: 'zk-SNARK',
      circuit: `compliance_${type}`,
      publicInputs: this.getPublicInputs(type, evidence),
      proof: {
        pi_a: this.generateProofPoint(),
        pi_b: this.generateProofPoint(),
        pi_c: this.generateProofPoint(),
        protocol: 'groth16'
      },
      verificationKey: this.getVerificationKey(type)
    };

    // Add type-specific proof elements
    switch (type) {
      case 'kyc':
        proof.attributes = {
          verificationLevel: evidence.level || 'basic',
          countryVerified: true,
          documentVerified: true,
          livenessChecked: evidence.livenessCheck || false
        };
        break;

      case 'aml':
        proof.attributes = {
          riskScore: this.hashRiskScore(evidence.riskScore || 0),
          screeningPassed: true,
          pep: false, // Politically Exposed Person
          sanctionsClear: true
        };
        break;

      case 'tax':
        proof.attributes = {
          reportingCompliant: true,
          thresholdMet: evidence.amount > 600,
          formType: evidence.amount > 600 ? '1099' : null,
          jurisdiction: evidence.jurisdiction || 'US'
        };
        break;

      case 'sanctions':
        proof.attributes = {
          cleared: true,
          lists: ['OFAC', 'UN', 'EU'],
          lastChecked: new Date().toISOString()
        };
        break;

      case 'age':
        proof.attributes = {
          over18: true,
          over21: evidence.age >= 21,
          verificationMethod: evidence.method || 'document'
        };
        break;

      case 'jurisdiction':
        proof.attributes = {
          allowed: true,
          country: evidence.country,
          state: evidence.state,
          restrictions: []
        };
        break;

      case 'accreditation':
        proof.attributes = {
          accredited: evidence.accredited || false,
          netWorth: evidence.netWorth > 1000000 ? 'qualified' : 'unqualified',
          income: evidence.income > 200000 ? 'qualified' : 'unqualified',
          verifiedBy: evidence.verifier || 'self'
        };
        break;
    }

    return proof;
  }

  /**
   * Verify compliance attestation
   * @param {Object} attestation - Attestation to verify
   * @returns {Promise<boolean>} Verification result
   */
  async verifyAttestation(attestation) {
    try {
      // Check expiry
      if (new Date(attestation.metadata.expiresAt) < new Date()) {
        logger.warn('Attestation expired', { attestationId: attestation.id });
        return false;
      }

      // Verify signature
      const signatureValid = await this.verifySignature(attestation);
      if (!signatureValid) {
        logger.warn('Invalid attestation signature', { attestationId: attestation.id });
        return false;
      }

      // Verify ZK proof
      const proofValid = await this.verifyZKProof(attestation.proof);
      if (!proofValid) {
        logger.warn('Invalid ZK proof', { attestationId: attestation.id });
        return false;
      }

      // Check on-chain record if available
      if (attestation.metadata.chain && attestation.metadata.txHash) {
        const onChainValid = await this.verifyOnChain(
          attestation.id,
          attestation.metadata.chain,
          attestation.metadata.txHash
        );
        if (!onChainValid) {
          logger.warn('On-chain verification failed', { attestationId: attestation.id });
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Attestation verification failed', {
        attestationId: attestation.id,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Verify zero-knowledge proof
   * @param {Object} proof - ZK proof to verify
   * @returns {Promise<boolean>} Verification result
   */
  async verifyZKProof(proof) {
    // Simplified verification for development
    // In production, use actual ZK proof verification

    // Check proof structure
    if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
      return false;
    }

    // Verify proof points are valid
    const validPoints =
      this.isValidProofPoint(proof.pi_a) &&
      this.isValidProofPoint(proof.pi_b) &&
      this.isValidProofPoint(proof.pi_c);

    if (!validPoints) {
      return false;
    }

    // Verify against verification key
    const vkValid = await this.verifyWithKey(proof, proof.verificationKey);

    return vkValid;
  }

  /**
   * Record attestation on blockchain
   * @param {Object} attestation - Attestation to record
   * @param {string} chain - Target blockchain
   * @returns {Promise<Object>} Transaction result
   */
  async recordOnChain(attestation, chain) {
    try {
      const attestationHash = this.hashAttestation(attestation);

      let result;
      if (chain === 'base' || chain === 'evm') {
        result = await this.recordOnEVM(attestationHash, attestation);
      } else if (chain === 'solana') {
        result = await this.recordOnSolana(attestationHash, attestation);
      } else {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      // Update attestation with on-chain data
      attestation.metadata.txHash = result.txHash;
      attestation.metadata.blockNumber = result.blockNumber;
      attestation.metadata.onChain = true;

      logger.info('Attestation recorded on chain', {
        attestationId: attestation.id,
        chain,
        txHash: result.txHash
      });

      return result;
    } catch (error) {
      logger.error('Failed to record attestation on chain', {
        attestationId: attestation.id,
        chain,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Record attestation on EVM chain
   * @param {string} hash - Attestation hash
   * @param {Object} attestation - Full attestation
   * @returns {Promise<Object>} Transaction result
   */
  async recordOnEVM(hash, attestation) {
    // Mock EVM recording for development
    // In production, interact with smart contract

    return {
      chain: 'base',
      txHash: '0x' + crypto.randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: 50000,
      contractAddress: '0x' + crypto.randomBytes(20).toString('hex'),
      event: 'AttestationRecorded',
      data: {
        attestationId: attestation.id,
        hash,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Record attestation on Solana
   * @param {string} hash - Attestation hash
   * @param {Object} attestation - Full attestation
   * @returns {Promise<Object>} Transaction result
   */
  async recordOnSolana(hash, attestation) {
    // Mock Solana recording for development
    // In production, interact with Solana program

    return {
      chain: 'solana',
      txHash: crypto.randomBytes(44).toString('base64').replace(/[+/]/g, ''),
      slot: Math.floor(Math.random() * 100000000),
      computeUnits: 20000,
      programId: crypto.randomBytes(32).toString('base64').replace(/[+/]/g, ''),
      event: 'AttestationRecorded',
      data: {
        attestationId: attestation.id,
        hash,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Batch generate attestations for multiple requirements
   * @param {Object} wallet - Wallet requiring attestations
   * @param {Array} requirements - Required attestation types
   * @param {Object} evidence - Evidence for all attestations
   * @returns {Promise<Array>} Generated attestations
   */
  async batchGenerateAttestations(wallet, requirements, evidence) {
    const attestations = [];

    for (const type of requirements) {
      try {
        const attestation = await this.generateAttestation(
          wallet,
          type,
          evidence[type] || {}
        );
        attestations.push(attestation);
      } catch (error) {
        logger.error('Failed to generate attestation in batch', {
          walletId: wallet.id,
          type,
          error: error.message
        });
        attestations.push({
          type,
          error: error.message,
          valid: false
        });
      }
    }

    return attestations;
  }

  /**
   * Sign attestation
   * @param {Object} attestation - Attestation to sign
   * @returns {Promise<string>} Signature
   */
  async signAttestation(attestation) {
    const data = JSON.stringify({
      id: attestation.id,
      walletId: attestation.walletId,
      type: attestation.type,
      proof: attestation.proof,
      metadata: attestation.metadata
    });

    const sign = crypto.createSign('SHA256');
    sign.update(data);

    // In production, use HSM for signing
    const privateKey = this.getSigningKey();
    return sign.sign(privateKey, 'hex');
  }

  /**
   * Verify attestation signature
   * @param {Object} attestation - Attestation to verify
   * @returns {Promise<boolean>} Verification result
   */
  async verifySignature(attestation) {
    const data = JSON.stringify({
      id: attestation.id,
      walletId: attestation.walletId,
      type: attestation.type,
      proof: attestation.proof,
      metadata: attestation.metadata
    });

    const verify = crypto.createVerify('SHA256');
    verify.update(data);

    const publicKey = this.getVerificationPublicKey();
    return verify.verify(publicKey, attestation.signature, 'hex');
  }

  /**
   * Generate attestation ID
   * @returns {string} Unique ID
   */
  generateAttestationId() {
    return `att_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Hash attestation for on-chain storage
   * @param {Object} attestation - Attestation to hash
   * @returns {string} Hash
   */
  hashAttestation(attestation) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(attestation));
    return hash.digest('hex');
  }

  /**
   * Generate proof point for ZK proof
   * @returns {Array} Proof point
   */
  generateProofPoint() {
    // Simplified for development
    // In production, use actual elliptic curve points
    return [
      crypto.randomBytes(32).toString('hex'),
      crypto.randomBytes(32).toString('hex')
    ];
  }

  /**
   * Check if proof point is valid
   * @param {Array} point - Proof point
   * @returns {boolean} Validity
   */
  isValidProofPoint(point) {
    return Array.isArray(point) &&
           point.length === 2 &&
           typeof point[0] === 'string' &&
           typeof point[1] === 'string';
  }

  /**
   * Get verification key for attestation type
   * @param {string} type - Attestation type
   * @returns {Object} Verification key
   */
  getVerificationKey(type) {
    // Simplified for development
    // In production, use actual verification keys
    return {
      type: `vk_${type}`,
      alpha: this.generateProofPoint(),
      beta: this.generateProofPoint(),
      gamma: this.generateProofPoint(),
      delta: this.generateProofPoint(),
      ic: [this.generateProofPoint()]
    };
  }

  /**
   * Verify proof with verification key
   * @param {Object} proof - Proof to verify
   * @param {Object} vk - Verification key
   * @returns {Promise<boolean>} Verification result
   */
  async verifyWithKey(proof, vk) {
    // Simplified verification for development
    // In production, use actual pairing check
    return true;
  }

  /**
   * Get public inputs for ZK circuit
   * @param {string} type - Attestation type
   * @param {Object} evidence - Evidence data
   * @returns {Array} Public inputs
   */
  getPublicInputs(type, evidence) {
    // Generate public inputs based on type
    const inputs = [];

    switch (type) {
      case 'kyc':
        inputs.push(this.hashValue(evidence.countryCode || 'US'));
        inputs.push(evidence.verificationLevel === 'enhanced' ? 1 : 0);
        break;
      case 'aml':
        inputs.push(this.hashRiskScore(evidence.riskScore || 0));
        break;
      case 'tax':
        inputs.push(evidence.amount || 0);
        inputs.push(this.hashValue(evidence.jurisdiction || 'US'));
        break;
      default:
        inputs.push(this.hashValue(type));
    }

    return inputs;
  }

  /**
   * Hash value for privacy
   * @param {*} value - Value to hash
   * @returns {string} Hashed value
   */
  hashValue(value) {
    const hash = crypto.createHash('sha256');
    hash.update(String(value));
    return hash.digest('hex').substr(0, 16);
  }

  /**
   * Hash risk score while preserving range
   * @param {number} score - Risk score
   * @returns {number} Hashed score
   */
  hashRiskScore(score) {
    // Preserve risk range while obscuring exact value
    if (score < 30) return 1; // Low risk
    if (score < 70) return 2; // Medium risk
    return 3; // High risk
  }

  /**
   * Get cache key
   * @param {string} walletId - Wallet ID
   * @param {string} type - Attestation type
   * @returns {string} Cache key
   */
  getCacheKey(walletId, type) {
    return `${walletId}_${type}`;
  }

  /**
   * Get cached attestation
   * @param {string} key - Cache key
   * @returns {Object|null} Cached attestation
   */
  getCachedAttestation(key) {
    const cached = this.attestationCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.attestationCache.delete(key);
      return null;
    }

    return cached.attestation;
  }

  /**
   * Cache attestation
   * @param {string} key - Cache key
   * @param {Object} attestation - Attestation to cache
   */
  cacheAttestation(key, attestation) {
    this.attestationCache.set(key, {
      attestation,
      timestamp: Date.now()
    });
  }

  /**
   * Get signing key (mock for development)
   * @returns {string} Private key
   */
  getSigningKey() {
    // In production, retrieve from HSM
    return `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7W8Z2fRPq9smc
yklRqRLhzmUz+X1zK3n7j1QbhFwOZq5lsK3vMNYAphf3vx5GYPvZPpuw5oqR5L2X
SIMULATOR_KEY_DO_NOT_USE_IN_PRODUCTION
-----END PRIVATE KEY-----`;
  }

  /**
   * Get verification public key (mock for development)
   * @returns {string} Public key
   */
  getVerificationPublicKey() {
    // In production, retrieve from certificate store
    return `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1vGdn0T6vbJnMpJUakS
4c5lM/l9cyt5+49UG4RcDmauZbCt7zDWAKYX978eRmD72T6bsOaKkeS9l5K4pE5r
SIMULATOR_KEY_DO_NOT_USE_IN_PRODUCTION
-----END PUBLIC KEY-----`;
  }

  /**
   * Verify attestation on chain
   * @param {string} attestationId - Attestation ID
   * @param {string} chain - Blockchain
   * @param {string} txHash - Transaction hash
   * @returns {Promise<boolean>} Verification result
   */
  async verifyOnChain(attestationId, chain, txHash) {
    // Mock verification for development
    // In production, query blockchain
    return true;
  }

  /**
   * Get compliance status for wallet
   * @param {Object} wallet - Wallet to check
   * @returns {Promise<Object>} Compliance status
   */
  async getComplianceStatus(wallet) {
    const requirements = await this.getRequirements(wallet);
    const attestations = [];

    for (const req of requirements) {
      const cacheKey = this.getCacheKey(wallet.id, req);
      const cached = this.getCachedAttestation(cacheKey);

      attestations.push({
        type: req,
        valid: cached && cached.valid,
        expiresAt: cached ? cached.metadata.expiresAt : null
      });
    }

    const allValid = attestations.every(a => a.valid);
    const pendingCount = attestations.filter(a => !a.valid).length;

    return {
      compliant: allValid,
      attestations,
      pendingRequirements: pendingCount,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Get compliance requirements for wallet
   * @param {Object} wallet - Wallet to check
   * @returns {Promise<Array>} Required attestations
   */
  async getRequirements(wallet) {
    const requirements = [];

    // Basic KYC always required
    requirements.push('kyc');

    // AML for high-value transactions
    if (wallet.invoice && wallet.invoice.amount > 10000) {
      requirements.push('aml');
    }

    // Tax reporting for US
    if (wallet.invoice && wallet.invoice.amount > 600) {
      requirements.push('tax');
    }

    // Sanctions screening for international
    if (wallet.invoice && wallet.invoice.isInternational) {
      requirements.push('sanctions');
    }

    return requirements;
  }
}

module.exports = new ComplianceAttestation();