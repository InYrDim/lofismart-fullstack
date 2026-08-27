/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedRoleAndPermission1777254000000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder role and permission');

        const roles = [
            { id: 'ADMN', name: 'Admin', guard_name: 'api' },
            { id: 'KSR', name: 'Kasir', guard_name: 'api' },
            { id: 'GDNG', name: 'Gudang', guard_name: 'api' },
            { id: 'MNGR', name: 'Manager', guard_name: 'api' },
            { id: 'SPVR', name: 'Supervisor', guard_name: 'api' },
            { id: 'USER', name: 'User', guard_name: 'api' },
        ];

        const permissions = [
            { id: 'P001', name: 'manage_users', guard_name: 'api' },
            { id: 'P002', name: 'manage_products', guard_name: 'api' },
            { id: 'P003', name: 'manage_stock', guard_name: 'api' },
            { id: 'P004', name: 'pos_access', guard_name: 'api' },
            { id: 'P005', name: 'view_reports', guard_name: 'api' },
        ];

        // Seed Roles
        for (const role of roles) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`role\` (\`id\`, \`name\`, \`guard_name\`) VALUES (?, ?, ?)`,
                [role.id, role.name, role.guard_name]
            );
        }

        // Seed Permissions
        for (const permission of permissions) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`permission\` (\`id\`, \`name\`, \`guard_name\`) VALUES (?, ?, ?)`,
                [permission.id, permission.name, permission.guard_name]
            );
        }

        // Link Permissions to Admin (ADMN)
        for (const permission of permissions) {
            const hasPermitId = `AD${permission.id}`.substring(0, 8);
            await queryRunner.query(
                `INSERT IGNORE INTO \`has_permit\` (\`id\`, \`role_id\`, \`permission_id\`) VALUES (?, ?, ?)`,
                [hasPermitId, 'ADMN', permission.id]
            );
        }

        console.log('Seeder role and permission selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback role and permission');
        await queryRunner.query(`DELETE FROM \`has_permit\``);
        await queryRunner.query(`DELETE FROM \`permission\``);
        await queryRunner.query(`DELETE FROM \`role\``);
        console.log('Rollback Seeder role and permission selesai.');
    }

}
