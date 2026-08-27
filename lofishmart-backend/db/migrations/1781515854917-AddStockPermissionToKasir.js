/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddStockPermissionToKasir1781515854917 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        const permissionName = "stock";

        const dbPerm = await queryRunner.query(
            `SELECT id FROM permission WHERE name = '${permissionName}' LIMIT 1`
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

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        const dbPerm = await queryRunner.query(
            `SELECT id FROM permission WHERE name = 'stock' LIMIT 1`
        );
        if (dbPerm.length > 0) {
            const permId = dbPerm[0].id;
            await queryRunner.query(`
                DELETE FROM has_permit
                WHERE role_id = 'KSR' AND permission_id = '${permId}'
            `);
        }
    }

}
