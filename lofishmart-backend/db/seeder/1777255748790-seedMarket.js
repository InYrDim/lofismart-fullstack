/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedMarket1777255748790 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder market (profile)');

        const profilesToSeed = [
            { id: "MKT01", name: "Gudang Utama", address: "Makassar", city: "Makassar", timezone: "Asia/Makassar", time_dif: 8, phone_number: "0811xxxx", type: "GUDANG" },
            { id: "MKT02", name: "Outlet Lelong", address: "Pelelangan Ikan", city: "Makassar", timezone: "Asia/Makassar", time_dif: 8, phone_number: "0812xxxx", type: "OUTLET" },
            { id: "MKT03", name: "Outlet Maros", address: "Maros", city: "Maros", timezone: "Asia/Makassar", time_dif: 8, phone_number: "0813xxxx", type: "OUTLET" }
        ];

        for (const profile of profilesToSeed) {

            await queryRunner.query(
                `INSERT IGNORE INTO \`profile\` (\`id\`, \`name\`, \`address\`, \`city\`, \`timezone\`, \`time_dif\`, \`phone_number\`, \`type\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [profile.id, profile.name, profile.address, profile.city, profile.timezone, profile.time_dif, profile.phone_number, profile.type]
            );
        }

        console.log('Seeder market selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback market (profile)');
        await queryRunner.query(
            `DELETE FROM \`profile\` WHERE \`id\` IN (?, ?, ?)`,
            ['MKT01', 'MKT02', 'MKT03']
        );
        console.log('Rollback Seeder market selesai.');
    }

}
