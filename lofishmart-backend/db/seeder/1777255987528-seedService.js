/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedService1777255987528 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder service');

        const servicesToSeed = [
            {
                id: "SRV01",
                name: "Siangi Ikan",
                barcode: "SRV-SIANGI",
                unit: "1", // per KG
                price: 2000,
                disc: 0
            },
            {
                id: "SRV02",
                name: "Potong Ikan",
                barcode: "SRV-POTONG",
                unit: "1", // per KG
                price: 1500,
                disc: 0
            },
            {
                id: "SRV03",
                name: "Fillet Ikan",
                barcode: "SRV-FILLET",
                unit: "1", // per KG
                price: 5000,
                disc: 0
            }
        ];

        for (const service of servicesToSeed) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`service\` (\`id\`, \`name\`, \`barcode\`, \`unit\`, \`price\`, \`disc\`) VALUES (?, ?, ?, ?, ?, ?)`,
                [service.id, service.name, service.barcode, service.unit, service.price, service.disc]
            );
        }

        console.log('Seeder service selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback service');
        await queryRunner.query(
            `DELETE FROM \`service\` WHERE \`id\` IN (?, ?, ?)`,
            ['SRV01', 'SRV02', 'SRV03']
        );
        console.log('Rollback Seeder service selesai.');
    }

}
