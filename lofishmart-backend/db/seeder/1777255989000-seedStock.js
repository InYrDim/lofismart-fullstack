/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedStock1777255989000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder stock');

        const stocksToSeed = [
            { id: "STK01", product: "PRD01", market: "MKT01", qty: 100 },
            { id: "STK02", product: "PRD02", market: "MKT01", qty: 100 },
            { id: "STK03", product: "PRD03", market: "MKT01", qty: 100 },
            { id: "STK04", product: "PRD04", market: "MKT01", qty: 50 },
            { id: "STK05", product: "PRD05", market: "MKT01", qty: 30 },
            { id: "STK06", product: "PRD01", market: "MKT02", qty: 100 },
            { id: "STK07", product: "PRD02", market: "MKT02", qty: 100 },
            { id: "STK08", product: "PRD03", market: "MKT02", qty: 100 },
            { id: "STK09", product: "PRD07", market: "MKT02", qty: 20 },
            { id: "STK10", product: "PRD08", market: "MKT02", qty: 15 },
        ];

        for (const stock of stocksToSeed) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`stock\` (\`id\`, \`product_id\`, \`market_id\`, \`qty\`) VALUES (?, ?, ?, ?)`,
                [stock.id, stock.product, stock.market, stock.qty]
            );
        }

        console.log('Seeder stock selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback stock');
        await queryRunner.query(
            `DELETE FROM \`stock\` WHERE \`id\` LIKE 'STK%'`
        );
        console.log('Rollback Seeder stock selesai.');
    }

}
