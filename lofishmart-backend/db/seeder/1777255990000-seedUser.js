const bcrypt = require('bcrypt');

/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedUser1777255990000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder user');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = [
            {
                id: 'USR00001',
                name: 'Admin Lofi',
                email: 'admin@lofishmart.com',
                username: 'admin',
                password: hashedPassword,
                role_id: 'ADMN',
                market_id: 'MKT01'
            },
            {
                id: 'USR00002',
                name: 'Gudang User',
                email: 'gudang@lofishmart.com',
                username: 'gudang',
                password: hashedPassword,
                role_id: 'GDNG',
                market_id: 'MKT01'
            },
            {
                id: 'USR00003',
                name: 'Kasir Outlet',
                email: 'kasir@lofishmart.com',
                username: 'kasir',
                password: hashedPassword,
                role_id: 'KSR',
                market_id: 'MKT02'
            }
        ];

        for (const user of users) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`user\` (\`id\`, \`name\`, \`email\`, \`username\`, \`password\`, \`role_id\`, \`market_id\`) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.name, user.email, user.username, user.password, user.role_id, user.market_id]
            );
        }

        console.log('Seeder user selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback user');
        await queryRunner.query(`DELETE FROM \`user\` WHERE \`id\` IN ('USR00001', 'USR00002', 'USR00003')`);
        console.log('Rollback Seeder user selesai.');
    }

}
