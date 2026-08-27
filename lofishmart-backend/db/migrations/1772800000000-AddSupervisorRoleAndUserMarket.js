/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * Adds:
 *  1. Supervisor (SPVR) role
 *  2. market_id column on user table (FK → profile.id)
 *     - Nullable: Admin/Manager have no outlet assignment
 *     - Supervisor/Gudang/Kasir are tied to a specific outlet
 *
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddSupervisorRoleAndUserMarket1772800000000 {
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Migrasi: Menambahkan role Supervisor dan kolom market_id pada user...');

        // 1. Add Supervisor role (ignore if exists)
        try {
            await queryRunner.query(
                `INSERT INTO \`role\` (\`id\`, \`name\`, \`guard_name\`) VALUES (?, ?, ?)`,
                ['SPVR', 'Supervisor', 'web']
            );
        } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') throw err;
            console.log('SPVR role already exists, skipping...');
        }

        // 2. Add market_id column to user table (nullable FK → profile)
        // Check if column exists first using SHOW COLUMNS which is more direct
        const columns = await queryRunner.query(`SHOW COLUMNS FROM \`user\` LIKE 'market_id'`);
        const columnExists = columns.length > 0;
        
        if (!columnExists) {
            await queryRunner.query(
                `ALTER TABLE \`user\` ADD COLUMN \`market_id\` VARCHAR(8) NULL DEFAULT NULL`
            );
        } else {
            console.log('market_id column already exists, skipping...');
        }

        // 3. Add FK constraint (ignore if exists)
        try {
            await queryRunner.query(
                `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_user_market\`
                 FOREIGN KEY (\`market_id\`) REFERENCES \`profile\`(\`id\`)
                 ON UPDATE CASCADE ON DELETE SET NULL`
            );
        } catch (err) {
            if (err.code !== 'ER_DUP_KEY') throw err;
            console.log('FK_user_market constraint already exists, skipping...');
        }

        console.log('Migrasi selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Rollback: Menghapus market_id dari user dan role Supervisor...');

        await queryRunner.query(
            `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_user_market\``
        );

        await queryRunner.query(
            `ALTER TABLE \`user\` DROP COLUMN \`market_id\``
        );

        await queryRunner.query(
            `DELETE FROM \`role\` WHERE \`id\` = 'SPVR'`
        );

        console.log('Rollback selesai.');
    }
};
