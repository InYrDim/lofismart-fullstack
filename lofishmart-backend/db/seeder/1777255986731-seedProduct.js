/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedProduct1777255986731 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder product (Short Barcode)');

        const productsToSeed = [
            // Ikan (CT01)
            { id: "PRD01", name: "Ikan Bandeng", barcode: "11", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT01" },
            { id: "PRD02", name: "Ikan Tongkol", barcode: "12", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT01" },
            { id: "PRD03", name: "Ikan Layang", barcode: "13", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT01" },
            { id: "PRD04", name: "Ikan Baronang", barcode: "14", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT01" },
            
            // Udang (CT02)
            { id: "PRD05", name: "Udang Vaname", barcode: "21", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT02" },
            { id: "PRD06", name: "Udang Windu", barcode: "22", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT02" },
            
            // Cumi (CT03)
            { id: "PRD07", name: "Cumi Tube", barcode: "31", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT03" },
            { id: "PRD08", name: "Cumi Ring", barcode: "32", unit: "1", is_non_stock: "1", is_show: "1", category_id: "CT03" }
        ];

        for (const product of productsToSeed) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`product\` (\`id\`, \`name\`, \`barcode\`, \`unit\`, \`is_non_stock\`, \`is_show\`, \`category_id\`) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [product.id, product.name, product.barcode, product.unit, product.is_non_stock, product.is_show, product.category_id]
            );
        }

        console.log('Seeder product selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback product');
        await queryRunner.query(
            `DELETE FROM \`product\` WHERE \`id\` LIKE 'PRD%'`
        );
        console.log('Rollback Seeder product selesai.');
    }

}
