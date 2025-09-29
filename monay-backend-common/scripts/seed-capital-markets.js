import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/monay',
});

// Capital markets data
const capitalMarketsData = {
  // Major stablecoins with market data
  stablecoins: [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      marketCap: 45823000000,
      dailyVolume: 8234567890,
      price: 1.0001,
      apy: 4.25,
      provider: 'tempo',
      chainSupport: ['Ethereum', 'Solana', 'Base', 'Tempo'],
      circulating: 45823000000,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      marketCap: 96542000000,
      dailyVolume: 65432109876,
      price: 0.9999,
      apy: 3.95,
      provider: 'tempo',
      chainSupport: ['Ethereum', 'Tron', 'BSC', 'Tempo'],
      circulating: 96542000000,
    },
    {
      symbol: 'PYUSD',
      name: 'PayPal USD',
      marketCap: 350000000,
      dailyVolume: 45678901,
      price: 1.0000,
      apy: 5.15,
      provider: 'tempo',
      chainSupport: ['Ethereum', 'Solana', 'Tempo'],
      circulating: 350000000,
    },
    {
      symbol: 'EURC',
      name: 'Euro Coin',
      marketCap: 235000000,
      dailyVolume: 12345678,
      price: 1.0856,
      apy: 2.75,
      provider: 'tempo',
      chainSupport: ['Ethereum', 'Avalanche', 'Tempo'],
      circulating: 235000000,
    },
    {
      symbol: 'USDB',
      name: 'USD Base',
      marketCap: 125000000,
      dailyVolume: 8901234,
      price: 1.0002,
      apy: 6.25,
      provider: 'tempo',
      chainSupport: ['Base', 'Tempo'],
      circulating: 125000000,
    },
  ],

  // Sample enterprise tokens on CaaS platform
  enterpriseTokens: [
    {
      symbol: 'APPL-T',
      name: 'Apple Treasury Token',
      companyId: 'apple-inc',
      totalSupply: 1000000000,
      circulatingSupply: 750000000,
      price: 1.0,
      marketCap: 750000000,
      dailyVolume: 5234567,
      rail: 'enterprise',
      compliance: 'ERC-3643',
    },
    {
      symbol: 'TSLA-T',
      name: 'Tesla Treasury Token',
      companyId: 'tesla-inc',
      totalSupply: 500000000,
      circulatingSupply: 250000000,
      price: 1.0,
      marketCap: 250000000,
      dailyVolume: 3456789,
      rail: 'enterprise',
      compliance: 'ERC-3643',
    },
    {
      symbol: 'AMZN-T',
      name: 'Amazon Treasury Token',
      companyId: 'amazon-com',
      totalSupply: 2000000000,
      circulatingSupply: 1500000000,
      price: 1.0,
      marketCap: 1500000000,
      dailyVolume: 12345678,
      rail: 'enterprise',
      compliance: 'ERC-3643',
    },
    {
      symbol: 'MSFT-T',
      name: 'Microsoft Treasury Token',
      companyId: 'microsoft-corp',
      totalSupply: 1500000000,
      circulatingSupply: 1000000000,
      price: 1.0,
      marketCap: 1000000000,
      dailyVolume: 8901234,
      rail: 'enterprise',
      compliance: 'ERC-3643',
    },
    {
      symbol: 'GOOGL-T',
      name: 'Google Treasury Token',
      companyId: 'alphabet-inc',
      totalSupply: 1750000000,
      circulatingSupply: 1250000000,
      price: 1.0,
      marketCap: 1250000000,
      dailyVolume: 9876543,
      rail: 'enterprise',
      compliance: 'ERC-3643',
    },
  ],

  // Sample transactions for activity
  sampleTransactions: [
    { from: 'Apple Inc', to: 'Supplier A', amount: 5000000, currency: 'USDC', type: 'B2B Payment' },
    { from: 'Tesla Inc', to: 'Battery Supplier', amount: 10000000, currency: 'USDT', type: 'Supply Chain' },
    { from: 'Amazon', to: 'Logistics Partner', amount: 3500000, currency: 'PYUSD', type: 'Logistics' },
    { from: 'Microsoft', to: 'Cloud Infrastructure', amount: 8000000, currency: 'USDC', type: 'Infrastructure' },
    { from: 'Google', to: 'Data Center', amount: 6500000, currency: 'USDT', type: 'Operations' },
    { from: 'JPMorgan', to: 'Trading Desk', amount: 50000000, currency: 'USDC', type: 'Trading' },
    { from: 'Goldman Sachs', to: 'Client Account', amount: 25000000, currency: 'EURC', type: 'Settlement' },
    { from: 'Bank of America', to: 'Corporate Treasury', amount: 15000000, currency: 'USDB', type: 'Treasury Ops' },
    { from: 'Wells Fargo', to: 'International Wire', amount: 12000000, currency: 'USDT', type: 'Cross-border' },
    { from: 'Citibank', to: 'FX Settlement', amount: 20000000, currency: 'EURC', type: 'FX Trade' },
  ],

  // Market metrics
  marketMetrics: {
    totalValueLocked: 125000000000,
    daily24hVolume: 85000000000,
    weeklyActiveUsers: 2500000,
    monthlyActiveUsers: 8500000,
    totalTransactions24h: 15000000,
    averageTransactionSize: 5667,
    averageGasPrice: 0.0001,
    networkTPS: 85000,
    pendingTransactions: 234,
  },

  // Network statistics by provider
  networkStats: {
    tempo: {
      status: 'operational',
      tps: 100000,
      finality: 87,
      avgFee: 0.0001,
      uptime: 99.99,
      nodes: 150,
      validators: 50,
      lastBlock: 12345678,
      gasPrice: 0.00001,
    },
    circle: {
      status: 'operational',
      tps: 1000,
      finality: 2500,
      avgFee: 0.05,
      uptime: 99.5,
      nodes: 25,
      validators: 10,
      lastBlock: 8765432,
      gasPrice: 0.001,
    },
    monay: {
      status: 'development',
      tps: 200000,
      finality: 50,
      avgFee: 0.00001,
      uptime: 0,
      nodes: 0,
      validators: 0,
      lastBlock: 0,
      gasPrice: 0,
    },
  },

  // Sample wallet balances for demo users
  demoWallets: [
    {
      name: 'Enterprise Demo Wallet',
      address: '0x' + crypto.randomBytes(20).toString('hex'),
      balances: {
        USDC: 10000000,
        USDT: 5000000,
        PYUSD: 2500000,
        EURC: 1000000,
        USDB: 500000,
      },
      type: 'enterprise',
    },
    {
      name: 'Consumer Demo Wallet',
      address: '0x' + crypto.randomBytes(20).toString('hex'),
      balances: {
        USDC: 10000,
        USDT: 5000,
        PYUSD: 2500,
        EURC: 1000,
        USDB: 500,
      },
      type: 'consumer',
    },
    {
      name: 'Treasury Demo Wallet',
      address: '0x' + crypto.randomBytes(20).toString('hex'),
      balances: {
        USDC: 100000000,
        USDT: 75000000,
        PYUSD: 25000000,
        EURC: 15000000,
        USDB: 10000000,
      },
      type: 'treasury',
    },
  ],

  // Yield/APY rates for different staking durations
  yieldRates: [
    { duration: '7d', apy: 2.5, minAmount: 100, currency: 'USDC' },
    { duration: '30d', apy: 3.5, minAmount: 500, currency: 'USDC' },
    { duration: '90d', apy: 4.5, minAmount: 1000, currency: 'USDC' },
    { duration: '180d', apy: 5.5, minAmount: 5000, currency: 'USDC' },
    { duration: '365d', apy: 6.5, minAmount: 10000, currency: 'USDC' },
  ],

  // Exchange rates for display
  exchangeRates: {
    'USD/EUR': 0.9211,
    'USD/GBP': 0.7892,
    'USD/JPY': 148.23,
    'USD/CHF': 0.8756,
    'USD/CAD': 1.3542,
    'USD/AUD': 1.5234,
    'USD/CNY': 7.2456,
    'EUR/GBP': 0.8572,
    'EUR/JPY': 160.98,
    'GBP/JPY': 187.85,
  },
};

async function seedCapitalMarkets() {
  console.log('🌱 Seeding capital markets data...\n');

  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100),
        market_cap DECIMAL(20, 2),
        daily_volume DECIMAL(20, 2),
        price DECIMAL(10, 4),
        apy DECIMAL(5, 2),
        provider VARCHAR(50),
        chain_support TEXT[],
        circulating_supply DECIMAL(20, 2),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS enterprise_tokens (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100),
        company_id VARCHAR(100),
        total_supply DECIMAL(20, 2),
        circulating_supply DECIMAL(20, 2),
        price DECIMAL(10, 4),
        market_cap DECIMAL(20, 2),
        daily_volume DECIMAL(20, 2),
        rail VARCHAR(50),
        compliance VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS network_stats (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50),
        tps INTEGER,
        finality_ms INTEGER,
        avg_fee DECIMAL(10, 6),
        uptime DECIMAL(5, 2),
        nodes INTEGER,
        validators INTEGER,
        last_block BIGINT,
        gas_price DECIMAL(10, 8),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS yield_rates (
        id SERIAL PRIMARY KEY,
        duration VARCHAR(20),
        apy DECIMAL(5, 2),
        min_amount DECIMAL(20, 2),
        currency VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        pair VARCHAR(20) UNIQUE NOT NULL,
        rate DECIMAL(10, 6),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS market_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(100) UNIQUE NOT NULL,
        metric_value DECIMAL(20, 2),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // DO NOT clear existing data - only update/insert
    console.log('📝 Updating existing data (no deletion)...');

    // Insert stablecoin market data
    console.log('💰 Inserting stablecoin market data...');
    for (const coin of capitalMarketsData.stablecoins) {
      await pool.query(
        `INSERT INTO market_data (symbol, name, market_cap, daily_volume, price, apy, provider, chain_support, circulating_supply)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (symbol) DO UPDATE SET
           market_cap = $3, daily_volume = $4, price = $5, apy = $6, last_updated = CURRENT_TIMESTAMP`,
        [coin.symbol, coin.name, coin.marketCap, coin.dailyVolume, coin.price, coin.apy, coin.provider, coin.chainSupport, coin.circulating]
      );
    }

    // Insert enterprise tokens
    console.log('🏢 Inserting enterprise tokens...');
    for (const token of capitalMarketsData.enterpriseTokens) {
      await pool.query(
        `INSERT INTO enterprise_tokens (symbol, name, company_id, total_supply, circulating_supply, price, market_cap, daily_volume, rail, compliance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (symbol) DO UPDATE SET
           circulating_supply = $5, market_cap = $7, daily_volume = $8`,
        [token.symbol, token.name, token.companyId, token.totalSupply, token.circulatingSupply,
         token.price, token.marketCap, token.dailyVolume, token.rail, token.compliance]
      );
    }

    // Insert network statistics
    console.log('📊 Inserting network statistics...');
    for (const [provider, stats] of Object.entries(capitalMarketsData.networkStats)) {
      await pool.query(
        `INSERT INTO network_stats (provider, status, tps, finality_ms, avg_fee, uptime, nodes, validators, last_block, gas_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (provider) DO UPDATE SET
           status = $2, tps = $3, finality_ms = $4, avg_fee = $5, uptime = $6,
           nodes = $7, validators = $8, last_block = $9, gas_price = $10, last_updated = CURRENT_TIMESTAMP`,
        [provider, stats.status, stats.tps, stats.finality, stats.avgFee, stats.uptime,
         stats.nodes, stats.validators, stats.lastBlock, stats.gasPrice]
      );
    }

    // Insert yield rates
    console.log('📈 Inserting yield rates...');
    for (const rate of capitalMarketsData.yieldRates) {
      await pool.query(
        `INSERT INTO yield_rates (duration, apy, min_amount, currency)
         VALUES ($1, $2, $3, $4)`,
        [rate.duration, rate.apy, rate.minAmount, rate.currency]
      );
    }

    // Insert exchange rates
    console.log('💱 Inserting exchange rates...');
    for (const [pair, rate] of Object.entries(capitalMarketsData.exchangeRates)) {
      await pool.query(
        `INSERT INTO exchange_rates (pair, rate)
         VALUES ($1, $2)
         ON CONFLICT (pair) DO UPDATE SET rate = $2, last_updated = CURRENT_TIMESTAMP`,
        [pair, rate]
      );
    }

    // Insert market metrics
    console.log('📉 Inserting market metrics...');
    for (const [metric, value] of Object.entries(capitalMarketsData.marketMetrics)) {
      await pool.query(
        `INSERT INTO market_metrics (metric_name, metric_value)
         VALUES ($1, $2)
         ON CONFLICT (metric_name) DO UPDATE SET metric_value = $2, last_updated = CURRENT_TIMESTAMP`,
        [metric, value]
      );
    }

    // Create sample transactions in existing tables
    console.log('💳 Creating sample transactions...');

    // Check if transactions table exists
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions')"
    );

    if (tableCheck.rows[0].exists) {
      // Add some sample transactions for display
      for (const tx of capitalMarketsData.sampleTransactions) {
        const txId = 'tx_' + crypto.randomBytes(16).toString('hex');
        await pool.query(
          `INSERT INTO transactions (id, from_address, to_address, amount, currency, type, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [txId, tx.from, tx.to, tx.amount, tx.currency, tx.type, 'completed']
        );
      }
    }

    // Create demo wallets if wallets table exists
    const walletCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wallets')"
    );

    if (walletCheck.rows[0].exists) {
      console.log('👛 Creating demo wallets...');
      for (const wallet of capitalMarketsData.demoWallets) {
        const walletId = 'wallet_' + crypto.randomBytes(16).toString('hex');

        // Create wallet
        await pool.query(
          `INSERT INTO wallets (id, name, address, type, created_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (address) DO NOTHING`,
          [walletId, wallet.name, wallet.address, wallet.type]
        );

        // Add balances if balance table exists
        const balanceCheck = await pool.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'balances')"
        );

        if (balanceCheck.rows[0].exists) {
          for (const [currency, amount] of Object.entries(wallet.balances)) {
            await pool.query(
              `INSERT INTO balances (wallet_id, currency, amount)
               VALUES ($1, $2, $3)
               ON CONFLICT (wallet_id, currency) DO UPDATE SET amount = $3`,
              [walletId, currency, amount]
            );
          }
        }
      }
    }

    // Create API endpoints for accessing this data
    console.log('\n✅ Capital markets data seeded successfully!\n');
    console.log('📌 Available API endpoints for this data:');
    console.log('   GET /api/stablecoin/market-data - Get stablecoin market data');
    console.log('   GET /api/stablecoin/network-stats - Get network statistics');
    console.log('   GET /api/stablecoin/yield-rates - Get current yield rates');
    console.log('   GET /api/stablecoin/exchange-rates - Get exchange rates');
    console.log('   GET /api/enterprise/tokens - Get enterprise tokens');
    console.log('   GET /api/metrics/market - Get market metrics\n');

    console.log('📊 Summary:');
    console.log(`   - ${capitalMarketsData.stablecoins.length} stablecoins with market data`);
    console.log(`   - ${capitalMarketsData.enterpriseTokens.length} enterprise tokens`);
    console.log(`   - ${Object.keys(capitalMarketsData.networkStats).length} network providers`);
    console.log(`   - ${capitalMarketsData.yieldRates.length} yield rate tiers`);
    console.log(`   - ${Object.keys(capitalMarketsData.exchangeRates).length} exchange rate pairs`);
    console.log(`   - ${capitalMarketsData.sampleTransactions.length} sample transactions`);
    console.log(`   - ${capitalMarketsData.demoWallets.length} demo wallets\n`);

  } catch (error) {
    console.error('❌ Error seeding capital markets data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedCapitalMarkets().then(() => {
  console.log('🎉 Capital markets seeding complete!');
  process.exit(0);
}).catch(error => {
  console.error('Failed to seed data:', error);
  process.exit(1);
});