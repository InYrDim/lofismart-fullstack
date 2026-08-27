/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * 1. Update barcode values:
 *    - grade:    G1, G2, G3, G4, ...
 *    - category: C1, C2, C3, ...
 *    - size:     01, 02, 03, ... (unchanged format, re-applied for safety)
 * 2. Add UNIQUE constraint on barcode for each table.
 *
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class BarcodeConstraintAndReseed1771910000000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Re-seeding barcode values and adding UNIQUE constraints...');

        // ── Grade: G1, G2, G3, ... ──────────────────────────────────────
        const grades = await queryRunner.query(`SELECT id FROM \`grade\` ORDER BY id`);
        for (let i = 0; i < grades.length; i++) {
            await queryRunner.query(
                `UPDATE \`grade\` SET \`barcode\` = ? WHERE \`id\` = ?`,
                [`G${i + 1}`, grades[i].id]
            );
        }

        // ── Category: C1, C2, C3, ... ───────────────────────────────────
        const categories = await queryRunner.query(`SELECT id FROM \`category\` ORDER BY id`);
        for (let i = 0; i < categories.length; i++) {
            await queryRunner.query(
                `UPDATE \`category\` SET \`barcode\` = ? WHERE \`id\` = ?`,
                [`C${i + 1}`, categories[i].id]
            );
        }

        // ── Size: 01, 02, 03, ... ────────────────────────────────────────
        const sizes = await queryRunner.query(`SELECT id FROM \`size\` ORDER BY id`);
        for (let i = 0; i < sizes.length; i++) {
            await queryRunner.query(
                `UPDATE \`size\` SET \`barcode\` = ? WHERE \`id\` = ?`,
                [String(i + 1).padStart(2, '0'), sizes[i].id]
            );
        }

        // ── UNIQUE constraints ───────────────────────────────────────────
        await queryRunner.query(`ALTER TABLE \`grade\` ADD CONSTRAINT \`UQ_grade_barcode\` UNIQUE (\`barcode\`)`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD CONSTRAINT \`UQ_category_barcode\` UNIQUE (\`barcode\`)`);
        await queryRunner.query(`ALTER TABLE \`size\` ADD CONSTRAINT \`UQ_size_barcode\` UNIQUE (\`barcode\`)`);

        console.log('Done: barcode re-seeded and UNIQUE constraints added.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`grade\` DROP INDEX \`UQ_grade_barcode\``);
        await queryRunner.query(`ALTER TABLE \`category\` DROP INDEX \`UQ_category_barcode\``);
        await queryRunner.query(`ALTER TABLE \`size\` DROP INDEX \`UQ_size_barcode\``);
        console.log('Rolled back UNIQUE constraints on barcode columns.');
    }
}
