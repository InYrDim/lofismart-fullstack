/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SessionUpdate1765210696633 {
    name = 'SessionUpdate1765210696633'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`user_agent\``);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`user_agent\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`payload\``);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`payload\` text NOT NULL`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`payload\``);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`payload\` longtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`user_agent\``);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`user_agent\` text NULL`);
    }
}
