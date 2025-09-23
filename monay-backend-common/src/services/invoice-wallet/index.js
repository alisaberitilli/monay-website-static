/**
 * Invoice-First Wallet System Services
 * Export all invoice wallet related services
 *
 * @module invoice-wallet
 */

const WalletFactory = require('./WalletFactory');
const AIModeSelectorEngine = require('./AIModeSelectorEngine');
const EphemeralManager = require('./EphemeralManager');
const QuantumCrypto = require('./QuantumCrypto');

// Create singleton instances
const walletFactory = new WalletFactory();
const aiModeSelector = new AIModeSelectorEngine();
const ephemeralManager = new EphemeralManager();
const quantumCrypto = new QuantumCrypto();

module.exports = {
  WalletFactory,
  AIModeSelectorEngine,
  EphemeralManager,
  QuantumCrypto,
  // Singleton instances for convenience
  walletFactory,
  aiModeSelector,
  ephemeralManager,
  quantumCrypto
};