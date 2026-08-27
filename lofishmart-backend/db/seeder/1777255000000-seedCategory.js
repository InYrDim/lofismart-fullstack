/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedCategory1777255000000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder category');

        const categories = [
            { id: 'CT01', name: 'Ikan', barcode: 'IK' },
            { id: 'CT02', name: 'Udang', barcode: 'UD' },
            { id: 'CT03', name: 'Cumi', barcode: 'CM' },
            { id: 'CT04', name: 'Lain-lain', barcode: 'LL' },
        ];

        for (const cat of categories) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`category\` (\`id\`, \`name\`, \`barcode\`) VALUES (?, ?, ?)`,
                [cat.id, cat.name, cat.barcode]
            );
        }

        console.log('Seeder category selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback category');
        await queryRunner.query(`DELETE FROM \`category\` WHERE \`id\` IN ('CT01', 'CT02', 'CT03', 'CT04')`);
        console.log('Rollback Seeder category selesai.');
    }

}
