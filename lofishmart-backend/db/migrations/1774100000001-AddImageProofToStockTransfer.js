const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class AddImageProofToStockTransfer1774100000001 {
    name = 'AddImageProofToStockTransfer1774100000001';

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE stock_transfer
            ADD COLUMN image_proof VARCHAR(500) NULL COMMENT 'Bukti foto penerimaan'
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE stock_transfer DROP COLUMN image_proof
        `);
    }
};
