/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddNewRoles1772647543567 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan migrasi: Menambahkan role Gudang, Kurir, and Penimbang...');

        const newRoles = [
            { id: "GDNG", name: "Gudang", guard_name: "web" },
            { id: "KURI", name: "Kurir", guard_name: "web" },
            { id: "TMBG", name: "Penimbang", guard_name: "web" }
        ];

        for (const role of newRoles) {
            await queryRunner.query(
                "INSERT INTO `role` (`id`, `name`, `guard_name`) VALUES (?, ?, ?)",
                [role.id, role.name, role.guard_name]
            );
        }

        console.log('Migrasi New Roles selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback: Menghapus role Gudang, Kurir, and Penimbang...');

        const roleIds = ["GDNG", "KURI", "TMBG"];

        await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from('role')
            .where("id IN (:...roleIds)", { roleIds })
            .execute();

        console.log('Rollback Migrasi New Roles selesai.');
    }

}
