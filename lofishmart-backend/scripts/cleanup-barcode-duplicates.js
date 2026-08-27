// Script to clean up all duplicate barcodes (including soft-deleted rows)
require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanup() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'lofish_market',
    });

    try {
        console.log('🔍 Finding duplicate barcodes (including soft-deleted)...');
        const [duplicates] = await conn.execute(`
      SELECT barcode, COUNT(*) as cnt
      FROM product
      WHERE barcode IS NOT NULL
      GROUP BY barcode
      HAVING cnt > 1
    `);

        if (duplicates.length === 0) {
            console.log('✅ No duplicates found.');
        }

        for (const row of duplicates) {
            const [products] = await conn.execute(
                `SELECT id, barcode, deleted_at, created_at FROM product WHERE barcode = ? ORDER BY deleted_at IS NULL DESC, created_at ASC`,
                [row.barcode]
            );
            console.log(`\n⚠️  Barcode "${row.barcode}" has ${products.length} entries:`);
            products.forEach((p, i) => console.log(`  ${i}: id=${p.id}, deleted_at=${p.deleted_at}`));

            // Keep first (active/oldest), null-out the rest
            for (let i = 1; i < products.length; i++) {
                await conn.execute(`UPDATE product SET barcode = NULL WHERE id = ?`, [products[i].id]);
                console.log(`  🗑️  Set barcode=NULL for id=${products[i].id}`);
            }
        }

        // Drop the old unique index created by migration if it exists
        try {
            await conn.execute(`ALTER TABLE product DROP INDEX UQ_product_barcode`);
            console.log('\n🧹 Dropped old UQ_product_barcode index');
        } catch (e) {
            console.log('\nℹ️  UQ_product_barcode index not found, skipping drop.');
        }

        console.log('\n✅ Cleanup done. TypeORM sync will apply the index on next startup.');
    } finally {
        await conn.end();
    }
}

cleanup().catch(console.error);
