const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class AddProfileType1777200000000 {
  name = 'AddProfileType1777200000000';

  async up(queryRunner) {
    // Add type column to profile table
    await queryRunner.query(`
      ALTER TABLE profile 
      ADD COLUMN type ENUM('GUDANG','OUTLET') NOT NULL DEFAULT 'OUTLET'
    `);

    // Set existing "Gudang Utama" (MKT01) as GUDANG
    await queryRunner.query(`
      UPDATE profile SET type = 'GUDANG' WHERE id = 'MKT01'
    `);

    console.log('✅ Added "type" column to profile table');
    console.log('   - MKT01 (Gudang Utama) → GUDANG');
    console.log('   - All others → OUTLET (default)');
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE profile DROP COLUMN type`);
    console.log('⬇️  Removed "type" column from profile table');
  }
};
