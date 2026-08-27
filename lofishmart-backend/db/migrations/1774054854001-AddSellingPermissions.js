/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddSellingPermissions1774054854001 {
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        const permissions = [
            { id: "SELL", name: "selling" },
            { id: "SLED", name: "selling-edit" }
        ];

        for (const perm of permissions) {
            const exists = await queryRunner.query(
                `SELECT * FROM permission WHERE id = '${perm.id}' OR name = '${perm.name}'`
            );
            if (exists.length === 0) {
                await queryRunner.query(
                    `INSERT INTO permission (id, name, guard_name) VALUES ('${perm.id}', '${perm.name}', 'web')`
                );
            }
        }

        const roleId = "ADMN";
        for (const perm of permissions) {
            const dbPerm = await queryRunner.query(
                `SELECT id FROM permission WHERE name = '${perm.name}' LIMIT 1`
            );
            if (dbPerm.length > 0) {
                const permId = dbPerm[0].id;
                const hasPermitExists = await queryRunner.query(`
                    SELECT * FROM has_permit 
                    WHERE role_id = '${roleId}' AND permission_id = '${permId}'
                `);

                if (hasPermitExists.length === 0) {
                    const uniqueId = Math.random().toString(36).substring(2, 10);
                    await queryRunner.query(`
                        INSERT INTO has_permit (id, role_id, permission_id) 
                        VALUES ('${uniqueId}', '${roleId}', '${permId}')
                    `);
                }
            }
        }
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        const permissionNames = ["selling", "selling-edit"];
        const perms = await queryRunner.query(
            `SELECT id FROM permission WHERE name IN ('${permissionNames.join("','")}')`
        );
        const ids = perms.map((p) => p.id);

        if (ids.length > 0) {
            await queryRunner.query(
                `DELETE FROM has_permit WHERE permission_id IN ('${ids.join("','")}')`
            );
            await queryRunner.query(
                `DELETE FROM permission WHERE id IN ('${ids.join("','")}')`
            );
        }
    }
}
