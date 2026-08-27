// typeorm-cli.js
require('dotenv').config();
require('reflect-metadata');
const { DataSource } = require('typeorm');
const path = require('path');

module.exports = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, '../db/entities/*.js')],
  migrations: [path.join(__dirname, '../db/migrations/*.js')],
  synchronize: false, // ❌ matikan auto-sync
  logging: true,
});
