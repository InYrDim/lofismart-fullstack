/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SessionUpdate1765009578207 {
    name = 'SessionUpdate1765009578207'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`expired_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`id\` \`id\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`id\` varchar(16) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`ip_address\` \`ip_address\` varchar(30) NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`user_agent\` \`user_agent\` text NULL`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`user_agent\` \`user_agent\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`ip_address\` \`ip_address\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`id\` \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`expired_at\``);
    }
}
