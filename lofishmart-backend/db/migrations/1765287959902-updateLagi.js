/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class UpdateLagi1765287959902 {
    name = 'UpdateLagi1765287959902'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`data_receive\` ADD \`attachment\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` ADD \`attachment\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`action\` \`action\` enum ('INSERT', 'UPDATE', 'DELETE', 'SOFDEL', 'EDIT') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`action\` \`action\` enum ('INSERT', 'UPDATE', 'DELETE', 'SOFDEL', 'EDIT') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`sync_status\` \`sync_status\` enum ('PENDING', 'SENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING'`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`sync_status\` \`sync_status\` enum ('PENDING', 'SENDING') NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`action\` \`action\` enum ('INSERT', 'UPDATE', 'DELETE') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`action\` \`action\` enum ('INSERT', 'UPDATE', 'DELETE') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` DROP COLUMN \`attachment\``);
        await queryRunner.query(`ALTER TABLE \`data_receive\` DROP COLUMN \`attachment\``);
    }
}
