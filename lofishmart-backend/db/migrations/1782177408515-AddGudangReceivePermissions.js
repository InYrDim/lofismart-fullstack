/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddGudangReceivePermissions1782177408515 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menambahkan permission untuk role GDNG (Terima Barang Supplier, Stock Transfer, dll)');

        // Permissions yang dibutuhkan GDNG untuk:
        // - Halaman Terima Barang Supplier (profile-list, product-list, supplier-list, receive)
        // - Halaman Stock Transfer (transfer orders)
        // - Halaman Stok Gudang (stock list)
        const permissionNames = [
            'profile',        // GET /feature/profile/list — melihat daftar market/gudang
            'product',        // GET /product/product/list — melihat daftar produk
            'supplier',       // GET /user/supplier/list — melihat daftar supplier
            'stock',          // GET /product/stock/list — melihat daftar stok
            'stock-edit',     // POST /product/inventory/receive-bulk — menerima barang supplier
            'purchase',       // GET /product/inventory/purchase-history — melihat riwayat pembelian
        ];

        const roleId = 'GDNG';

        for (const permName of permissionNames) {
            // Cek apakah permission ada di DB
            const dbPerm = await queryRunner.query(
                `SELECT id FROM permission WHERE name = '${permName}' LIMIT 1`
            );

            if (dbPerm.length > 0) {
                const permId = dbPerm[0].id;

                // Cek apakah role GDNG sudah punya permission ini
                const exists = await queryRunner.query(`
                    SELECT id FROM has_permit
                    WHERE role_id = '${roleId}' AND permission_id = '${permId}'
                    LIMIT 1
                `);

                if (exists.length === 0) {
                    const uniqueId = Math.random().toString(36).substring(2, 10);
                    await queryRunner.query(`
                        INSERT INTO has_permit (id, role_id, permission_id)
                        VALUES ('${uniqueId}', '${roleId}', '${permId}')
                    `);
                    console.log(`  + Granted '${permName}' to GDNG`);
                } else {
                    console.log(`  ~ '${permName}' already granted to GDNG, skipping`);
                }
            } else {
                console.log(`  ! Permission '${permName}' not found in DB, skipping`);
            }
        }

        console.log('Seeder permission GDNG selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Rollback: Menghapus permission GDNG untuk Terima Supplier');

        const permissionNames = [
            'profile',
            'product',
            'supplier',
            'stock',
            'stock-edit',
            'purchase',
        ];

        const perms = await queryRunner.query(
            `SELECT id FROM permission WHERE name IN ('${permissionNames.join("','")}')`
        );
        const ids = perms.map(p => p.id);

        if (ids.length > 0) {
            await queryRunner.query(`
                DELETE FROM has_permit
                WHERE role_id = 'GDNG' AND permission_id IN ('${ids.join("','")}')
            `);
        }

        console.log('Rollback permission GDNG selesai.');
    }

}
