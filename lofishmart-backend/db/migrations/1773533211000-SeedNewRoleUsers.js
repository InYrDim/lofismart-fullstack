/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

const bcrypt = require("bcrypt");

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedNewRoleUsers1773533211000 {
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log("Menjalankan seeder: Menyisipkan user untuk role baru (GDNG, KURI, TMBG, SPVR)...");

        const data = [
            {
                id: "GDNG001",
                name: "Petugas Gudang 1",
                username: "gudang1",
                email: "gudang1@lofish.market",
                password: bcrypt.hashSync("gudang123", 10),
                role_id: "GDNG"
            },
            {
                id: "KURI001",
                name: "Kurir 1",
                username: "kurir1",
                email: "kurir1@lofish.market",
                password: bcrypt.hashSync("kurir123", 10),
                role_id: "KURI"
            },
            {
                id: "TMBG001",
                name: "Penimbang 1",
                username: "penimbang1",
                email: "penimbang1@lofish.market",
                password: bcrypt.hashSync("penimbang123", 10),
                role_id: "TMBG"
            },
            {
                id: "SPVR001",
                name: "Supervisor 1",
                username: "supervisor1",
                email: "supervisor1@lofish.market",
                password: bcrypt.hashSync("supervisor123", 10),
                role_id: "SPVR"
            }
        ];

        for (const user of data) {
            await queryRunner.query(
                "INSERT INTO `user` (`id`, `name`, `username`, `email`, `password`, `role_id`) VALUES (?, ?, ?, ?, ?, ?)",
                [user.id, user.name, user.username, user.email, user.password, user.role_id]
            );
        }

        console.log("Seeder User Role Baru selesai.");
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log("Menjalankan rollback: Menghapus user role baru...");
        
        const usernames = ["gudang1", "kurir1", "penimbang1", "supervisor1"];
        
        await queryRunner.query(
            "DELETE FROM `user` WHERE `username` IN (?, ?, ?, ?)",
            usernames
        );

        console.log("Rollback seeder user role baru selesai.");
    }
}
