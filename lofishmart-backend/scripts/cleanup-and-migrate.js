/**
 * cleanup-and-migrate.js
 * Bersihkan sisa partial migration lalu jalankan ulang via npm run migration.
 * Jalankan dari folder lofishmart-backend/
 */
require('dotenv').config(); // Load .env dulu
const ds = require('./config/data-source');

async function run() {
    await ds.initialize();
    console.log('✅ DB connected');

    try {
        console.log('🧹 Cleaning up partial migration...');
        await ds.query('SET FOREIGN_KEY_CHECKS = 0');
        await ds.query('DROP TABLE IF EXISTS `stock_transfer`');
        await ds.query('SET FOREIGN_KEY_CHECKS = 1');

        // Hapus permissions yang mungkin sudah masuk
        await ds.query('DELETE FROM `has_permit` WHERE `permission_id` IN ("STRF","STED")').catch(() => {});
        await ds.query('DELETE FROM `permission` WHERE `id` IN ("STRF","STED")').catch(() => {});

        // Reset migration record agar bisa diulang
        await ds.query(
            `DELETE FROM \`migrations\` WHERE \`name\` = 'AddStockTransfer1774100000000'`
        ).catch(() => {});

        console.log('✅ Cleanup selesai');
        console.log('🚀 Menjalankan migration...');

        const results = await ds.runMigrations();
        if (results.length === 0) {
            console.log('ℹ️  Tidak ada migration baru.');
        } else {
            results.forEach(m => console.log(`✅ Migration applied: ${m.name}`));
        }
        console.log('🎉 Selesai!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await ds.destroy();
    }
}

run();
