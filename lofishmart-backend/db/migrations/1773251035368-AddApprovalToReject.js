/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddApprovalToReject1773251035368 {
    name = 'AddApprovalToReject1773251035368'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        // Drop constraint only if it exists
        try {
            await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_user_market\``);
        } catch (err) {
            console.log('Constraint FK_user_market not found or already dropped, skipping...');
        }
        
        await queryRunner.query(`ALTER TABLE \`reject\` ADD \`approval_status\` enum ('PENDING', 'APPROVED', 'REJECTED') NOT NULL COMMENT 'Status persetujuan reject (PENDING, APPROVED, REJECTED)' DEFAULT 'APPROVED'`);
        await queryRunner.query(`ALTER TABLE \`reject\` ADD \`image_proof\` text NULL COMMENT 'URL/path bukti foto barang rusak'`);
        await queryRunner.query(`ALTER TABLE \`reject\` ADD \`approved_by_id\` varchar(8) NULL`);
        await queryRunner.query(`ALTER TABLE \`reject\` ADD CONSTRAINT \`FK_c4524ab91f62ff33f4a15146c47\` FOREIGN KEY (\`approved_by_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`reject\` DROP FOREIGN KEY \`FK_c4524ab91f62ff33f4a15146c47\``);
        await queryRunner.query(`ALTER TABLE \`reject\` DROP COLUMN \`approved_by_id\``);
        await queryRunner.query(`ALTER TABLE \`reject\` DROP COLUMN \`image_proof\``);
        await queryRunner.query(`ALTER TABLE \`reject\` DROP COLUMN \`approval_status\``);
        
        const columns = await queryRunner.query(`SHOW COLUMNS FROM \`user\` LIKE 'market_id'`);
        if (columns.length > 0) {
            try {
                await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_user_market\` FOREIGN KEY (\`market_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
            } catch (err) {
                console.log('Failed to re-add FK_user_market during rollback, might already exist or column missing.');
            }
        }
    }
}
