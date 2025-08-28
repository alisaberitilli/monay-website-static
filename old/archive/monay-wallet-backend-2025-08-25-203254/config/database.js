module.exports = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'alisaberi',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'monay_wallet',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.CI_DB_USERNAME || 'alisaberi',
    password: process.env.CI_DB_PASSWORD || '',
    database: process.env.CI_DB_NAME || 'monay_wallet_test',
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    logging: false,
  },
  staging: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
};
