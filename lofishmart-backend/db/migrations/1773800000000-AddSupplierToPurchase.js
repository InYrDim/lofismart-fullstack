/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddSupplierToPurchase1773800000000 {
    name = 'AddSupplierToPurchase1773800000000'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`purchase\` ADD \`supplier_id\` varchar(8) NULL`);
        await queryRunner.query(`ALTER TABLE \`purchase\` ADD CONSTRAINT \`FK_purchase_supplier\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`supplier\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`purchase\` DROP FOREIGN KEY \`FK_purchase_supplier\``);
        await queryRunner.query(`ALTER TABLE \`purchase\` DROP COLUMN \`supplier_id\``);
    }
}
