/**
 * Migration: AddTransferGroup
 * Menambah kolom transfer_group ke tabel stock_transfer
 * untuk mengelompokkan transfer order yang dibuat dalam satu batch.
 */
module.exports = class AddTransferGroup1778300000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`stock_transfer\`
            ADD COLUMN \`transfer_group\` varchar(36) NULL
            COMMENT 'ID grup untuk batch transfer order'
        `);

        await queryRunner.query(`
            CREATE INDEX \`idx_stock_transfer_group\`
            ON \`stock_transfer\` (\`transfer_group\`)
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX \`idx_stock_transfer_group\` ON \`stock_transfer\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stock_transfer\` DROP COLUMN \`transfer_group\`
        `);
    }
};
