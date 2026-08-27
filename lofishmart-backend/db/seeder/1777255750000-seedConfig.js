/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedConfig1777255750000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder config');

        const configs = [
            { server: 'http://localhost:3000', cat_app_id: 'APP1', profile_id: 'MKT01' },
            { server: 'http://localhost:3000', cat_app_id: 'APP1', profile_id: 'MKT02' },
            { server: 'http://localhost:3000', cat_app_id: 'APP1', profile_id: 'MKT03' },
        ];

        for (const config of configs) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`config\` (\`server\`, \`cat_app_id\`, \`profile_id\`) VALUES (?, ?, ?)`,
                [config.server, config.cat_app_id, config.profile_id]
            );
        }

        console.log('Seeder config selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback config');
        await queryRunner.query(`DELETE FROM \`config\``);
        console.log('Rollback Seeder config selesai.');
    }

}
