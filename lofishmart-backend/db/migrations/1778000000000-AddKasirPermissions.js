/**
 * Menambahkan permission POS (product, selling, selling-edit) ke role KSR (Kasir)
 * agar kasir bisa mengakses halaman POS dan melakukan transaksi.
 *
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

module.exports = class AddKasirPermissions1778000000000 {
    async up(queryRunner) {
        const permissionNames = ["product", "selling", "selling-edit"];

        for (const permName of permissionNames) {
            const dbPerm = await queryRunner.query(
                `SELECT id FROM permission WHERE name = '${permName}' LIMIT 1`
            );
            if (dbPerm.length > 0) {
                const permId = dbPerm[0].id;
                const exists = await queryRunner.query(`
                    SELECT * FROM has_permit 
                    WHERE role_id = 'KSR' AND permission_id = '${permId}'
                `);
                if (exists.length === 0) {
                    const uniqueId = Math.random().toString(36).substring(2, 10);
                    await queryRunner.query(`
                        INSERT INTO has_permit (id, role_id, permission_id) 
                        VALUES ('${uniqueId}', 'KSR', '${permId}')
                    `);
                }
            }
        }
    }

    async down(queryRunner) {
        const permissionNames = ["product", "selling", "selling-edit"];
        const perms = await queryRunner.query(
            `SELECT id FROM permission WHERE name IN ('${permissionNames.join("','")}')`
        );
        const ids = perms.map((p) => p.id);
        if (ids.length > 0) {
            await queryRunner.query(`
                DELETE FROM has_permit 
                WHERE role_id = 'KSR' AND permission_id IN ('${ids.join("','")}')
            `);
        }
    }
};
