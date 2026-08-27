/**
 * Seeder untuk tabel Price (Harga Produk)
 * Pattern Barcode: [Base(2)][Grade(1)][Size(1)]
 *
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

module.exports = class SeedPrice1777255988000 {

    async up(queryRunner) {
        console.log('Menjalankan seeder Price (Short Barcode Pattern)');

        const pricesToSeed = [
            // PRD01: Ikan Bandeng (Base: 11)
            { id: "PRC001", product: "PRD01", grade: "GR01", size: "SZ01", barcode: "111A", initial: 25000, selling: 35000, disc: 0 },
            { id: "PRC002", product: "PRD01", grade: "GR01", size: "SZ02", barcode: "111B", initial: 22000, selling: 32000, disc: 0 },
            { id: "PRC003", product: "PRD01", grade: "GR01", size: "SZ03", barcode: "111C", initial: 18000, selling: 28000, disc: 0 },
            { id: "PRC004", product: "PRD01", grade: "GR02", size: "SZ01", barcode: "112A", initial: 20000, selling: 28000, disc: 0 },
            { id: "PRC005", product: "PRD01", grade: "GR02", size: "SZ02", barcode: "112B", initial: 18000, selling: 25000, disc: 0 },

            // PRD02: Ikan Tongkol (Base: 12)
            { id: "PRC006", product: "PRD02", grade: "GR01", size: "SZ01", barcode: "121A", initial: 30000, selling: 45000, disc: 0 },
            { id: "PRC007", product: "PRD02", grade: "GR01", size: "SZ02", barcode: "121B", initial: 28000, selling: 42000, disc: 0 },
            { id: "PRC008", product: "PRD02", grade: "GR01", size: "SZ03", barcode: "121C", initial: 25000, selling: 38000, disc: 0 },
            { id: "PRC009", product: "PRD02", grade: "GR02", size: "SZ01", barcode: "122A", initial: 25000, selling: 38000, disc: 0 },
            { id: "PRC010", product: "PRD02", grade: "GR02", size: "SZ02", barcode: "122B", initial: 22000, selling: 35000, disc: 0 },

            // PRD03: Ikan Layang (Base: 13)
            { id: "PRC011", product: "PRD03", grade: "GR01", size: "SZ01", barcode: "131A", initial: 22000, selling: 35000, disc: 0 },
            { id: "PRC012", product: "PRD03", grade: "GR01", size: "SZ02", barcode: "131B", initial: 20000, selling: 32000, disc: 0 },
            { id: "PRC013", product: "PRD03", grade: "GR01", size: "SZ03", barcode: "131C", initial: 17000, selling: 28000, disc: 0 },

            // PRD04: Ikan Baronang (Base: 14)
            { id: "PRC014", product: "PRD04", grade: "GR01", size: "SZ01", barcode: "141A", initial: 45000, selling: 65000, disc: 0 },

            // PRD05: Udang Vaname (Base: 21)
            { id: "PRC015", product: "PRD05", grade: "GR01", size: "SZ01", barcode: "211A", initial: 85000, selling: 110000, disc: 0 },

            // PRD06: Udang Windu (Base: 22)
            { id: "PRC016", product: "PRD06", grade: "GR01", size: "SZ01", barcode: "221A", initial: 120000, selling: 150000, disc: 0 },

            // PRD07: Cumi Tube (Base: 31)
            { id: "PRC017", product: "PRD07", grade: "GR01", size: "SZ01", barcode: "311A", initial: 60000, selling: 85000, disc: 0 },

            // PRD08: Cumi Ring (Base: 32)
            { id: "PRC018", product: "PRD08", grade: "GR01", size: "SZ01", barcode: "321A", initial: 70000, selling: 95000, disc: 0 },
        ];

        for (const price of pricesToSeed) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`price\` (\`id\`, \`product_id\`, \`grade_id\`, \`size_id\`, \`barcode\`, \`initial\`, \`selling\`, \`disc\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [price.id, price.product, price.grade, price.size, price.barcode, price.initial, price.selling, price.disc]
            );
        }

        console.log('Seeder Price selesai.');
    }

    async down(queryRunner) {
        console.log('Menjalankan rollback seeder Price');
        await queryRunner.query(`DELETE FROM \`price\` WHERE \`id\` LIKE 'PRC%'`);
        console.log('Rollback seeder Price selesai.');
    }
}
