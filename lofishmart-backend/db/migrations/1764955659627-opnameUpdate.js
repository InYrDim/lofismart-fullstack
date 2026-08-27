/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class OpnameUpdate1764955659627 {
    name = 'OpnameUpdate1764955659627'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`stock_opname\` DROP COLUMN \`barcode\``);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` DROP COLUMN \`image\``);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` CHANGE \`status\` \`status\` enum ('1', '2', '3') NOT NULL COMMENT 'Status (1 = overview, 1 = approved, 3 = pending)' DEFAULT '1'`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`stock_opname\` CHANGE \`status\` \`status\` enum ('1', '2') NOT NULL COMMENT 'Status (1 = overview, 1 = approved)' DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` ADD \`image\` varchar(200) NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` ADD \`barcode\` varchar(30) NULL`);
    }
}
