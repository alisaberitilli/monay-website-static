import fs from 'fs';
import Sequelize from 'sequelize';
import path from 'path';
import config from '../config';

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
});


fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].seedData) {
    db[modelName].seedData(config);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
