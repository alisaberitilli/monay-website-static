import fs from 'fs';
import pkg from 'sequelize';
const { Sequelize, DataTypes } = pkg;
import path from 'path';
import config from '../config/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use PostgreSQL configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'alisaberi',
  password: process.env.DB_PASSWORD || '',
  db: process.env.DB_NAME || 'monay',
  dialect: process.env.DB_DIALECT || 'postgres',
  timezone: '+00:00'
};

const db = {};
let sequelize;
sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  timezone: dbConfig.timezone,
  logging: console.log,
  dialect: dbConfig.dialect,
  define: {
    // Global settings for all models
    underscored: true,  // Automatically convert camelCase to snake_case
    timestamps: true,   // Enable timestamps
    createdAt: 'created_at',  // Map createdAt to created_at
    updatedAt: 'updated_at',  // Map updatedAt to updated_at
    // This will make all model attributes use snake_case in the database
    // while keeping camelCase in JavaScript
  }
});

// Initialize models asynchronously
async function initializeModels() {
  // Load models using dynamic import (ES modules)
  const modelFiles = fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.endsWith('.js'));

  for (const file of modelFiles) {
    const modelPath = pathToFileURL(path.join(__dirname, file)).href;
    const { default: modelDefiner } = await import(modelPath);
    const model = modelDefiner(sequelize, DataTypes);
    db[model.name] = model;
  }

  // Set up associations after all models are loaded
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
    if (db[modelName].seedData) {
      db[modelName].seedData(config);
    }
  });

  return db;
}

// Export db with sequelize and Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.initializeModels = initializeModels;
db.QueryTypes = Sequelize.QueryTypes;

export default db;