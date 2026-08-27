/**
 * Test script to verify stockList endpoint with supervisor1 credentials
 * This simulates what the frontend does when loading the stock page
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppDataSource = require('../config/data-source');

async function test() {
  console.log('🔍 Testing stockList endpoint for supervisor1...\n');

  // Initialize DB
  await AppDataSource.initialize();
  console.log('✅ Database connected\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'lofish_market',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  // 1. Get supervisor1 user data
  const [users] = await conn.query(
    'SELECT * FROM user WHERE username = ?',
    ['supervisor1']
  );
  
  if (users.length === 0) {
    console.error('❌ supervisor1 user not found!');
    await conn.end();
    return;
  }

  const user = users[0];
  console.log('👤 User found:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Role: ${user.role_id}`);
  console.log(`   Market ID: ${user.market_id}`);
  console.log(`   Market Name: ${user.market_id ? (await conn.query('SELECT name FROM profile WHERE id = ?', [user.market_id]))[0][0]?.name : 'NULL'}\n`);

  // 2. Get user permissions
  const [perms] = await conn.query(
    `SELECT p.name FROM permission p
     INNER JOIN has_permit hp ON p.id = hp.permission_id
     WHERE hp.role_id = ?`,
    [user.role_id]
  );
  console.log('🔑 Permissions:', perms.map(p => p.name).join(', '), '\n');

  // 3. Create a mock req.user object (simulating auth middleware)
  const mockUser = {
    id: user.id,
    role: user.role_id,
    role_id: user.role_id,
    market_id: user.market_id,
    hasPermit: perms.map(p => p.name)
  };
  console.log('📋 Mock req.user:', JSON.stringify(mockUser, null, 2), '\n');

  // 4. Test stockList logic
  const userRole = mockUser.role;
  const userMarketId = mockUser.market_id;
  const outletScopedRoles = ['SPVR', 'GDNG', 'KSR', 'TMBG'];
  const isOutletScoped = outletScopedRoles.includes(userRole);
  const targetMarketId = isOutletScoped ? userMarketId : null;

  console.log('📊 StockList Logic:');
  console.log(`   Role: ${userRole}`);
  console.log(`   Is Outlet Scoped: ${isOutletScoped}`);
  console.log(`   User Market ID: ${userMarketId}`);
  console.log(`   Target Market ID: ${targetMarketId}\n`);

  // 5. Query stock
  const Stock = require('../db/entities/Stock');
  const repo = AppDataSource.getRepository(Stock);
  
  let data;
  if (targetMarketId) {
    data = await repo.find({
      where: [
        { market: { id: targetMarketId } },
        { warehouse: { id: targetMarketId } },
      ],
      relations: ['product', 'market', 'warehouse'],
    });
  } else if (isOutletScoped) {
    data = [];
  } else {
    data = await repo.find({
      relations: ['product', 'market', 'warehouse'],
    });
  }

  console.log('📦 Stock Data Found:', data.length, 'records');
  if (data.length > 0) {
    data.forEach(stock => {
      console.log(`   - ${stock.product?.name || 'Unknown'}: ${stock.qty} ${stock.unit === '1' ? 'KG' : 'EKOR'} @ ${stock.market?.name || stock.warehouse?.name || 'Unknown'}`);
    });
  } else {
    console.log('   ❌ No stock found!');
  }

  await conn.end();
  await AppDataSource.destroy();
  console.log('\n✅ Test completed\n');
}

test().catch(console.error);
