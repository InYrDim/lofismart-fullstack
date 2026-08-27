/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * Menambahkan kolom 'barcode' (varchar(2), NOT NULL) ke tabel category, grade, dan size.
 * Data existing di-assign barcode secara berurutan: 01, 02, 03, dst.
 *
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddBarcodeToMasterData1771908000000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Adding barcode column to category, grade, size...');

        const tables = ['category', 'grade', 'size'];

        for (const table of tables) {
            // 1. Tambah kolom sebagai nullable dulu
            await queryRunner.query(`
                ALTER TABLE \`${table}\`
                ADD COLUMN \`barcode\` VARCHAR(2) NULL AFTER \`name\`
            `);

            // 2. Assign barcode berurutan ke data existing
            const rows = await queryRunner.query(`SELECT id FROM \`${table}\` ORDER BY id`);
            for (let i = 0; i < rows.length; i++) {
                const barcode = String(i + 1).padStart(2, '0'); // '01', '02', ...
                await queryRunner.query(
                    `UPDATE \`${table}\` SET \`barcode\` = ? WHERE \`id\` = ?`,
                    [barcode, rows[i].id]
                );
            }

            // 3. Ubah kolom jadi NOT NULL
            await queryRunner.query(`
                ALTER TABLE \`${table}\`
                MODIFY COLUMN \`barcode\` VARCHAR(2) NOT NULL
            `);
        }

        console.log('Barcode column added to category, grade, size.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Removing barcode column from category, grade, size...');

        await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`barcode\``);
        await queryRunner.query(`ALTER TABLE \`grade\` DROP COLUMN \`barcode\``);
        await queryRunner.query(`ALTER TABLE \`size\` DROP COLUMN \`barcode\``);

        console.log('Barcode column removed.');
    }
}
