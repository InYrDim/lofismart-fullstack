/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedGrade1777254902574 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder grade');

        const gradesToSeed = [
            { id: "GR01", name: "GRADE A", barcode: "A" },
            { id: "GR02", name: "GRADE B", barcode: "B" },
            { id: "GR03", name: "GRADE C", barcode: "C" },
            { id: "GR04", name: "GRADE D", barcode: "D" }
        ];

        for (const grade of gradesToSeed) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`grade\` (\`id\`, \`name\`, \`barcode\`) VALUES (?, ?, ?)`,
                [grade.id, grade.name, grade.barcode]
            );
        }

        console.log('Seeder grade selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback grade');
        const ids = ['GR01', 'GR02', 'GR03', 'GR04'];
        await queryRunner.query(
            `DELETE FROM \`grade\` WHERE \`id\` IN (?, ?, ?, ?)`, ids
        );
        console.log('Rollback Seeder grade selesai.');
    }

}
