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
  // No 'entities' here — seeders run raw SQL only and don't need entity metadata.
  // Including entities can cause TypeORM to evaluate FK relations and trigger
  // unexpected ON DELETE SET NULL cascades on existing data.
  migrations: [path.join(__dirname, '../db/seeder/*.js')],
  // Seeder history is tracked in a dedicated 'seeders' table,
  // completely separate from the schema 'migrations' table.
  migrationsTableName: 'seeders',
  synchronize: false,
  logging: true,
});
