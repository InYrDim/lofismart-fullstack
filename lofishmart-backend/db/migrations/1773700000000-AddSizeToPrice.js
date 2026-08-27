/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddSizeToPrice1773700000000 {
    name = 'AddSizeToPrice1773700000000'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        // 1. Add size_id to price table
        await queryRunner.query(`ALTER TABLE \`price\` ADD \`size_id\` varchar(4) NULL`);
        await queryRunner.query(`ALTER TABLE \`price\` ADD CONSTRAINT \`FK_price_size\` FOREIGN KEY (\`size_id\`) REFERENCES \`size\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);

        // 2. Remove legacy size_id from product table
        // First drop the foreign key constraint
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_3210db31599e5c505183be05896\``);
        // Then drop the column
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`size_id\``);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        // Restore size_id to product table
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`size_id\` varchar(4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_3210db31599e5c505183be05896\` FOREIGN KEY (\`size_id\`) REFERENCES \`size\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);

        // Remove size_id from price table
        await queryRunner.query(`ALTER TABLE \`price\` DROP FOREIGN KEY \`FK_price_size\``);
        await queryRunner.query(`ALTER TABLE \price\` DROP COLUMN \`size_id\``);
    }
}
