// config/data-source.js
const { DataSource } = require('typeorm');
const path = require('path');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNC === "true", // ⚠️ Auto create table (dev only)
  logging: process.env.DB_LOGG,
  entities: [path.join(__dirname, '../db/entities/*.js')],
  migrations: [path.join(__dirname, '../db/migrations/*.js')],
  timezone: 'Z',
  // Connection pool + timeout tuning to avoid stale-connection crashes
  // ("Got timeout reading communication packets" / "packets out of order").
  extra: {
    connectionLimit: 10,
    connectTimeout: 20000, // ms — wait for the handshake
    acquireTimeout: 20000, // ms — wait for a free connection from the pool
    timeout: 20000, // ms — socket inactivity timeout
    // Validate connections before handing them out so a dead pooled
    // connection is never reused (prevents "packets out of order").
    enableKeepAlive: true,
  },
});

module.exports = AppDataSource;
