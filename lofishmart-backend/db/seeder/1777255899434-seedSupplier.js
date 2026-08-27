/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedSupplier1777255899434 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder supplier');

        const suppliersToSeed = [
            {
                id: "SUP01",
                corporation: "PT. Ikan Segar Sejahtera",
                name: "H. Malik",
                email: "malik@ikansegar.com",
                phone_number: "081122334455",
                address: "Jl. Dermaga No. 1, Makassar",
                city: "Makassar",
                pos: "90001",
                bank: "BRI",
                no_rek: "1234567890"
            },
            {
                id: "SUP02",
                corporation: "CV. Nelayan Mandiri",
                name: "Andi Wijaya",
                email: "andi@nelayanmandiri.com",
                phone_number: "081166778899",
                address: "Jl. Maritim No. 12, Makassar",
                city: "Makassar",
                pos: "90002",
                bank: "BCA",
                no_rek: "0987654321"
            }
        ];

        for (const supplier of suppliersToSeed) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`supplier\` (\`id\`, \`corporation\`, \`name\`, \`email\`, \`phone_number\`, \`address\`, \`city\`, \`pos\`, \`bank\`, \`no_rek\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [supplier.id, supplier.corporation, supplier.name, supplier.email, supplier.phone_number, supplier.address, supplier.city, supplier.pos, supplier.bank, supplier.no_rek]
            );
        }

        console.log('Seeder supplier selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback supplier');
        await queryRunner.query(
            `DELETE FROM \`supplier\` WHERE \`id\` IN (?, ?)`,
            ['SUP01', 'SUP02']
        );
        console.log('Rollback Seeder supplier selesai.');
    }

}
