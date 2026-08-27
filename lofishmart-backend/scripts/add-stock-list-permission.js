/**
 * Quick fix: Add missing stock-list permission
 * 
 * Run: node scripts/add-stock-list-permission.js
 * 
 * Or execute manually in MySQL:
 * INSERT INTO permission (id, name, guard_name, created_at, updated_at)
 * VALUES ('STLI', 'stock-list', 'web', NOW(), NOW());
 */

const AppDataSource = require('../config/data-source');

async function addPermission() {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  
  try {
    // Check if permission already exists
    const existing = await queryRunner.manager.query(
      'SELECT * FROM permission WHERE id = ?',
      ['STLI']
    );
    
    if (existing.length > 0) {
      console.log('✅ Permission stock-list already exists');
      return;
    }
    
    // Insert the permission
    await queryRunner.manager.query(
      'INSERT INTO permission (id, name, guard_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      ['STLI', 'stock-list', 'web']
    );
    
    console.log('✅ Added stock-list permission');
    
    // Also ensure STKE (stock-edit) and PUED (purchase-edit) exist
    const stke = await queryRunner.manager.query('SELECT * FROM permission WHERE id = ?', ['STKE']);
    if (stke.length === 0) {
      await queryRunner.manager.query(
        'INSERT INTO permission (id, name, guard_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        ['STKE', 'stock-edit', 'web']
      );
      console.log('✅ Added stock-edit permission');
    }
    
    const pued = await queryRunner.manager.query('SELECT * FROM permission WHERE id = ?', ['PUED']);
    if (pued.length === 0) {
      await queryRunner.manager.query(
        'INSERT INTO permission (id, name, guard_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        ['PUED', 'purchase-edit', 'web']
      );
      console.log('✅ Added purchase-edit permission');
    }
    
    console.log('\n🎉 All inventory permissions are now set up!');
    console.log('   - stock-list (STLI)');
    console.log('   - stock-edit (STKE)');  
    console.log('   - purchase-edit (PUED)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await queryRunner.release();
  }
}

addPermission();
