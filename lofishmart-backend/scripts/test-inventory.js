/**
 * Inventory API Tests
 * 
 * Run these tests after the server is running:
 *   node scripts/test-inventory.js
 * 
 * Prerequisites:
 * - MySQL container running (mysql-container)
 * - Server running on localhost:3000
 * - Test data exists: supplier, product, market (gudang), market (outlet)
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Test credentials - adjust as needed
const TEST_TOKEN = process.env.TEST_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  ...(TEST_TOKEN && { 'Authorization': `Bearer ${TEST_TOKEN}` })
};

// Test data IDs - these should exist in your DB
const TEST_DATA = {
  supplierId: 'SUP001',      // Replace with actual supplier ID
  gudangMarketId: 'GUDANG',  // Replace with actual gudang profile ID
  outletMarketId: 'OUTLET1', // Replace with actual outlet profile ID  
  productId: 'PROD001',      // Replace with actual product ID
  unitKg: '1',
  unitPcs: '2'
};

/**
 * Helper: Sleep for ms
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test 1: Get Inventory Dashboard
 */
async function testGetDashboard() {
  console.log('\n📊 Test: Get Inventory Dashboard');
  console.log('   GET /product/inventory/dashboard');
  
  try {
    const res = await fetch(`${API_BASE}/product/inventory/dashboard`, { headers });
    const data = await res.json();
    
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2).slice(0, 200) + '...');
    
    if (res.ok) {
      console.log('   ✅ PASSED');
      return { success: true, data };
    } else {
      console.log('   ❌ FAILED');
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.log('   ❌ ERROR:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Test 2: Receive Stock from Supplier
 * Creates a purchase and adds stock to gudang
 */
async function testReceiveStock() {
  console.log('\n📥 Test: Receive Stock from Supplier');
  console.log('   POST /product/inventory/receive');
  
  const payload = {
    supplier_id: TEST_DATA.supplierId,
    warehouse_id: TEST_DATA.gudangMarketId,
    product_id: TEST_DATA.productId,
    purchased_qty: 50,         // 50 kg purchased
    accepted_qty: 48,          // 48 kg accepted (2 kg rejected)
    rejected_qty: 2,           // 2 kg rejected
    reject_reason: 'Bocor / rusak',
    price: 25000,              // 25000 per kg
    batch: 'BATCH-' + Date.now(),
    unit: TEST_DATA.unitKg
  };
  
  console.log('   Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const res = await fetch(`${API_BASE}/product/inventory/receive`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (res.ok) {
      console.log('   ✅ PASSED - Stock received and added to gudang');
      return { success: true, data };
    } else {
      console.log('   ❌ FAILED');
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.log('   ❌ ERROR:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Test 3: Transfer Stock to Market/Outlet
 * Moves stock from gudang to outlet
 */
async function testTransferStock(sourceStockId) {
  console.log('\n🚚 Test: Transfer Stock to Market');
  console.log('   POST /product/inventory/transfer');
  
  const payload = {
    source_stock_id: sourceStockId,  // From previous receive test
    market_id: TEST_DATA.outletMarketId,
    product_id: TEST_DATA.productId,
    transfer_qty: 20,                // Transfer 20 kg
    accepted_qty: 19,               // 19 kg accepted
    rejected_qty: 1,                // 1 kg rejected at outlet
    reject_reason: 'Kualitas kurang',
    unit: TEST_DATA.unitKg
  };
  
  console.log('   Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const res = await fetch(`${API_BASE}/product/inventory/transfer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (res.ok) {
      console.log('   ✅ PASSED - Stock transferred to outlet');
      return { success: true, data };
    } else {
      console.log('   ❌ FAILED');
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.log('   ❌ ERROR:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Test 4: Verify Stock After Transfer
 */
async function testVerifyStock() {
  console.log('\n🔍 Test: Verify Stock After Transfer');
  console.log('   GET /product/inventory/dashboard');
  
  try {
    const res = await fetch(`${API_BASE}/product/inventory/dashboard`, { headers });
    const data = await res.json();
    
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (res.ok) {
      // Check that both gudang and outlet have stock
      const markets = data.data || [];
      const gudang = markets.find(m => m.marketName === 'Gudang Utama' || m.marketName.includes('Gudang'));
      const outlet = markets.find(m => m.marketId === TEST_DATA.outletMarketId);
      
      console.log('\n   Stock Summary:');
      if (gudang) {
        console.log(`   - Gudang: ${JSON.stringify(gudang)}`);
      }
      if (outlet) {
        console.log(`   - Outlet: ${JSON.stringify(outlet)}`);
      }
      
      console.log('   ✅ PASSED');
      return { success: true, data };
    } else {
      console.log('   ❌ FAILED');
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.log('   ❌ ERROR:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Main: Run all tests
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 LofishMart Inventory API Tests');
  console.log('='.repeat(60));
  console.log('\n⚠️  WARNING: These tests modify data!');
  console.log('   Make sure you are running on a test/staging database.');
  console.log(`   API Base: ${API_BASE}`);
  
  // Wait for server to be ready
  console.log('\n⏳ Waiting for server...');
  await sleep(1000);
  
  // Test 1: Get Dashboard
  await testGetDashboard();
  
  // Test 2: Receive Stock
  const receiveResult = await testReceiveStock();
  
  // Give DB a moment to settle
  await sleep(500);
  
  // Test 3: Get Dashboard again to see new stock
  await testGetDashboard();
  
  // Test 4: Transfer Stock (if we have a stock ID - for manual testing)
  // Uncomment below to test transfer:
  // if (receiveResult.success && receiveResult.data?.data?.acceptedStockId) {
  //   await testTransferStock(receiveResult.data.data.acceptedStockId);
  // }
  
  // Test 5: Verify final stock state
  await testVerifyStock();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests Complete');
  console.log('='.repeat(60));
  
  console.log('\n📝 Manual Testing Notes:');
  console.log('1. Update TEST_DATA at the top of this file with real IDs from your DB');
  console.log('2. Run: TEST_TOKEN=your_jwt_token node scripts/test-inventory.js');
  console.log('3. Or run via curl - see below for examples:\n');
  
  console.log('Example curl commands:');
  console.log(`  # Get dashboard:`);
  console.log(`  curl -H "Authorization: Bearer \$TEST_TOKEN" ${API_BASE}/product/inventory/dashboard`);
  console.log(`\n  # Receive stock:`);
  console.log(`  curl -X POST -H "Authorization: Bearer \$TEST_TOKEN" -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"supplier_id":"SUP001","warehouse_id":"GUDANG","product_id":"PROD001","purchased_qty":100,"accepted_qty":98,"rejected_qty":2,"reject_reason":"rusak","price":25000,"batch":"B001","unit":"1"}' \\`);
  console.log(`    ${API_BASE}/product/inventory/receive`);
  console.log(`\n  # Transfer stock:`);
  console.log(`  curl -X POST -H "Authorization: Bearer \$TEST_TOKEN" -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"source_stock_id":"STOCK_ID","market_id":"OUTLET1","product_id":"PROD001","transfer_qty":20,"accepted_qty":19,"rejected_qty":1,"reject_reason":"kurang","unit":"1"}' \\`);
  console.log(`    ${API_BASE}/product/inventory/transfer`);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testGetDashboard,
  testReceiveStock,
  testTransferStock,
  testVerifyStock
};
