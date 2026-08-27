const { MigrationInterface, QueryRunner } = require("typeorm");

class UniqueProductBarcode1771700000000 {
    async up(queryRunner) {
        // Find all duplicate barcodes (excluding NULL)
        const duplicates = await queryRunner.query(`
      SELECT barcode, COUNT(*) as cnt
      FROM \`product\`
      WHERE barcode IS NOT NULL
      GROUP BY barcode
      HAVING cnt > 1
    `);

        for (const row of duplicates) {
            // Get all product IDs with this duplicate barcode, ordered by created_at
            const products = await queryRunner.query(`
        SELECT id FROM \`product\`
        WHERE barcode = ?
        ORDER BY created_at ASC
      `, [row.barcode]);

            // Keep the first (oldest) one, set the rest to NULL
            for (let i = 1; i < products.length; i++) {
                await queryRunner.query(`
          UPDATE \`product\` SET barcode = NULL WHERE id = ?
        `, [products[i].id]);
            }
        }

        // Now safely add the unique index
        await queryRunner.query(
            `ALTER TABLE \`product\` ADD UNIQUE INDEX \`UQ_product_barcode\` (\`barcode\`)`
        );
    }

    async down(queryRunner) {
        await queryRunner.query(
            `ALTER TABLE \`product\` DROP INDEX \`UQ_product_barcode\``
        );
    }
}

module.exports = { UniqueProductBarcode1771700000000 };
