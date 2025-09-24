/**
 * Invoice-First Wallet System Services
 * Export all invoice wallet related services
 *
 * @module invoice-wallet
 */

import WalletFactory from './WalletFactory.js';
import AIModeSelectorEngine from './AIModeSelectorEngine.js';
import EphemeralManager from './EphemeralManager.js';
import QuantumCrypto from './QuantumCrypto.js';

// Create singleton instances
const walletFactory = new WalletFactory();
const aiModeSelector = new AIModeSelectorEngine();
const ephemeralManager = new EphemeralManager();
const quantumCrypto = new QuantumCrypto();

export default {
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