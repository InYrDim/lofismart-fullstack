/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class FixWarehouseTypo1777586556252 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`stock\` CHANGE \`werehouse_id\` \`warehouse_id\` varchar(8) NULL`);
        await queryRunner.query(`ALTER TABLE \`purchase\` CHANGE \`werehouse_id\` \`warehouse_id\` varchar(8) NULL`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`stock\` CHANGE \`warehouse_id\` \`werehouse_id\` varchar(8) NULL`);
        await queryRunner.query(`ALTER TABLE \`purchase\` CHANGE \`warehouse_id\` \`werehouse_id\` varchar(8) NULL`);
    }

}
