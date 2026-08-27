/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedMember1777255890000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder member');

        const members = [
            { id: 'MEM00001', name: 'Pelanggan Umum', phone_number: '0000000000' },
            { id: 'MEM00002', name: 'Budi Santoso', phone_number: '081234567890' },
            { id: 'MEM00003', name: 'Siti Aminah', phone_number: '081298765432' },
        ];

        for (const member of members) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`member\` (\`id\`, \`name\`, \`phone_number\`) VALUES (?, ?, ?)`,
                [member.id, member.name, member.phone_number]
            );
        }

        console.log('Seeder member selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback member');
        await queryRunner.query(`DELETE FROM \`member\` WHERE \`id\` IN ('MEM00001', 'MEM00002', 'MEM00003')`);
        console.log('Rollback Seeder member selesai.');
    }

}
