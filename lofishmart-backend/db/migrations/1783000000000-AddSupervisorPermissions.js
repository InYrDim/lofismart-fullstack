/**
 * Menambahkan permission ke role SPVR (Supervisor) agar bisa mengakses
 * data transaksi (selling) dan profil/outlet (profile).
 *
 * Sebelumnya SPVR hanya memiliki permission stock-transfer/stock-transfer-edit,
 * sehingga:
 *   - GET /api/transaction/selling/list  -> 403 "Do not have permission..."
 *   - GET /api/feature/profile/list      -> 403 "Do not have permission..."
 *
 * Migration ini mengikuti pola AddKasirPermissions (1778000000000) dan
 * AddGudangReceivePermissions (1782177408515): permission dibuat bila belum
 * ada, lalu di-grant ke role SPVR secara idempotent (INSERT IGNORE / cek).
 *
 * Permission yang diberikan:
 *   - "selling"  -> akses baca daftar transaksi (selling/list, detail list)
 *   - "profile"  -> akses baca profil / daftar outlet (profile/list)
 *
 * CATATAN: Jika supervisor juga perlu mengedit transaksi (create/update/delete),
 * tambahkan "selling-edit" pada permissionNames di bawah.
 *
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

module.exports = class AddSupervisorPermissions1783000000000 {
    async up(queryRunner) {
        const permissionNames = ["selling", "profile"];
        const roleId = "SPVR";

        for (const permName of permissionNames) {
            // Pastikan permission ada di tabel permission
            let dbPerm = await queryRunner.query(
                `SELECT id FROM permission WHERE name = '${permName}' LIMIT 1`
            );
            if (dbPerm.length === 0) {
                await queryRunner.query(
                    `INSERT INTO permission (id, name, guard_name) VALUES (?, ?, 'web')`,
                    [permName.toUpperCase().substring(0, 8), permName]
                );
                const created = await queryRunner.query(
                    `SELECT id FROM permission WHERE name = '${permName}' LIMIT 1`
                );
                if (created.length === 0) continue;
                dbPerm = created;
            }
            const permId = dbPerm[0].id;

            // Grant ke role SPVR jika belum ada
            const exists = await queryRunner.query(
                `SELECT id FROM has_permit WHERE role_id = '${roleId}' AND permission_id = '${permId}'`
            );
            if (exists.length === 0) {
                const uniqueId = Math.random().toString(36).substring(2, 10);
                await queryRunner.query(
                    `INSERT INTO has_permit (id, role_id, permission_id) VALUES (?, ?, ?)`,
                    [uniqueId, roleId, permId]
                );
            }
        }

        console.log(`Supervisor permissions granted: ${permissionNames.join(', ')} -> SPVR`);
    }

    async down(queryRunner) {
        const permissionNames = ["selling", "profile"];
        const roleId = "SPVR";

        for (const permName of permissionNames) {
            const dbPerm = await queryRunner.query(
                `SELECT id FROM permission WHERE name = '${permName}' LIMIT 1`
            );
            if (dbPerm.length === 0) continue;
            const permId = dbPerm[0].id;

            await queryRunner.query(
                `DELETE FROM has_permit WHERE role_id = '${roleId}' AND permission_id = '${permId}'`
            );
        }

        console.log(`Supervisor permissions revoked (rollback): ${permissionNames.join(', ')}`);
    }
};
