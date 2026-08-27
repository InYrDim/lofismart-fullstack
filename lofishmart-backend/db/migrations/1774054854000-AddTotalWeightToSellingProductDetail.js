/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddTotalWeightToSellingProductDetail1774054854000 {
    name = 'AddTotalWeightToSellingProductDetail1774054854000'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` ADD \`total_weight\` double NOT NULL DEFAULT '0' COMMENT 'total weight of the item' AFTER \`total_price\``);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` DROP COLUMN \`total_weight\``);
    }
}
