const bcrypt = require('bcrypt'); // Impor bcrypt untuk hashing

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddKasirRoleAndUser1771570598000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan migrasi: Menambahkan role KSR dan user kasir1...');

        // 1. Data Roles yang akan di-seed
        await queryRunner.query(
            "INSERT INTO `role` (`id`, `name`, `guard_name`) VALUES (?, ?, ?)",
            ["KSR", "Kasir", "web"]
        );

        // 2. Data User kasir1
        const hashedPasswordKasir = bcrypt.hashSync("kasir123", 10);
        
        await queryRunner.query(
            "INSERT INTO `user` (`id`, `name`, `username`, `email`, `password`, `role_id`) VALUES (?, ?, ?, ?, ?, ?)",
            [
                "KSR001",
                "Kasir 1",
                "kasir1",
                "kasir1@lofish.market",
                hashedPasswordKasir,
                "KSR"
            ]
        );

        console.log('Migrasi Kasir selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback: Menghapus data kasir...');
        
        await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from('user')
            .where("username = :username", { username: "kasir1" })
            .execute();
            
        await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from('role')
            .where("id = :id", { id: "KSR" })
            .execute();

        console.log('Rollback Migrasi Kasir selesai.');
    }

}
