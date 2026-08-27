/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

const bcrypt = require("bcrypt"); // Impor bcrypt untuk hashing
// Perlu diingat: Karena ini CommonJS, proses hashing harus dijalankan secara synchronous jika tidak menggunakan helper

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedUser1764126951306 {
	/**
	 * @param {QueryRunner} queryRunner
	 */
	async up(queryRunner) {
		console.log("Menjalankan seeder: Menyisipkan data user awal...");

		// 1. Hashing Password Secara Synchronous (Lebih mudah dalam CommonJS TypeORM Migration)
		const hashedPasswordAdmin = bcrypt.hashSync("admin123", 10);
		const hashedPasswordUser = bcrypt.hashSync("user123", 10);

		// 2. Data yang akan di-seed
		const usersToSeed = [
			{
				id: "ADMN001",
				name: "Super Admin",
				username: "admin",
				email: "admin@lofish.market",
				password: hashedPasswordAdmin,
				role: "ADMN",
			},
			{
				id: "USR1234",
				name: "Standard User",
				username: "standarduser",
				email: "user@lofish.market",
				password: hashedPasswordUser,
				role: "USER",
			},
		];

		// 3. Menyisipkan data menggunakan raw SQL
		for (const user of usersToSeed) {
			await queryRunner.query(
				`INSERT INTO \`user\` (\`id\`, \`name\`, \`username\`, \`email\`, \`password\`, \`role_id\`) VALUES (?, ?, ?, ?, ?, ?)`,
				[
					user.id,
					user.name,
					user.username,
					user.email,
					user.password,
					user.role,
				],
			);
		}

		console.log("Seeder User selesai.");
	}

	/**
	 * @param {QueryRunner} queryRunner
	 */
	async down(queryRunner) {
		console.log("Menjalankan rollback: Menghapus data user awal...");

		// 1. Daftar username yang disisipkan
		const usernames = ["admin", "standarduser"];

		// 2. Menghapus data berdasarkan username yang unik
		await queryRunner.manager
			.createQueryBuilder()
			.delete()
			.from("user") // Ganti 'user' jika nama tabel Anda berbeda
			.where("username IN (:...usernames)", { usernames: usernames })
			.execute();

		console.log("Rollback Seeder User selesai.");
	}
};
