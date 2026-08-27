/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddProductPermissions1770295861469 {
	/**
	 * @param {QueryRunner} queryRunner
	 */
	async up(queryRunner) {
		// 1. Daftar Permission Lengkap yang diminta
		// ID dibuat unik 4 karakter.
		const permissions = [
			{ id: "PROD", name: "product" },
			{ id: "PRED", name: "product-edit" },
			{ id: "CATG", name: "category" },
			{ id: "CAED", name: "category-edit" },
			{ id: "ROLE", name: "role" },
			{ id: "ROED", name: "role-edit" },
			{ id: "GRAD", name: "grade" },
			{ id: "GRED", name: "grade-edit" },
			{ id: "SODT", name: "so-detail" },
			{ id: "SODE", name: "so-detail-edit" },
			{ id: "PURC", name: "purchase" },
			{ id: "PUED", name: "purchase-edit" },
			{ id: "PERM", name: "permission" },
			{ id: "PEED", name: "permission-edit" },
			{ id: "SUPP", name: "supplier" },
			{ id: "SUED", name: "supplier-edit" },
			{ id: "SERV", name: "service" },
			{ id: "SEED", name: "service-edit" },
			{ id: "STOP", name: "stock-opname" },
			{ id: "STOE", name: "stock-opname-edit" },
			{ id: "USER", name: "user" },
			{ id: "USED", name: "user-edit" },
			{ id: "PROF", name: "profile" },
			{ id: "PRFE", name: "profile-edit" },
			{ id: "HPMT", name: "has-permit" },
			{ id: "HPME", name: "has-permit-edit" },
			{ id: "REJC", name: "reject" },
			{ id: "REJE", name: "reject-edit" },
			{ id: "CONF", name: "config" },
			{ id: "CNFE", name: "config-edit" },
			{ id: "CATA", name: "cat-app" },
			{ id: "CATE", name: "cat-app-edit" },
			{ id: "PRIC", name: "price" },
			{ id: "PRIE", name: "price-edit" },
			{ id: "STCK", name: "stock" },
			{ id: "STKE", name: "stock-edit" },
			{ id: "MEMB", name: "member" },
			{ id: "MEME", name: "member-edit" },
			{ id: "SIZE", name: "size" },
			{ id: "SIED", name: "size-edit" },
			{ id: "SESS", name: "session" },
		];

		// 2. Insert Permission ke database (Insert Ignore / Cek dulu)
		for (const perm of permissions) {
			// Cek by ID or Name to avoid duplicates if re-running or if partial data exists
			const exists = await queryRunner.query(
				`SELECT * FROM permission WHERE id = '${perm.id}' OR name = '${perm.name}'`,
			);
			if (exists.length === 0) {
				await queryRunner.query(
					`INSERT INTO permission (id, name, guard_name) VALUES ('${perm.id}', '${perm.name}', 'web')`,
				);
			}
		}

		// 3. Berikan Permission ke Role 'ADMN' (Admin)
		const roleId = "ADMN";

		for (const perm of permissions) {
			// Ambil ID permission yang benar dari database (jika terjadi perbedaan ID karena data lama)
			// Kita cari by name karena name konsisten dari request user
			const dbPerm = await queryRunner.query(
				`SELECT id FROM permission WHERE name = '${perm.name}' LIMIT 1`,
			);
			if (dbPerm.length > 0) {
				const permId = dbPerm[0].id;

				// Cek apakah Admin sudah punya akses ini
				const hasPermitExists = await queryRunner.query(`
                    SELECT * FROM has_permit 
                    WHERE role_id = '${roleId}' AND permission_id = '${permId}'
                `);

				if (hasPermitExists.length === 0) {
					// Generate ID acak 8 karakter untuk has_permit
					const uniqueId = Math.random().toString(36).substring(2, 10);
					await queryRunner.query(`
                        INSERT INTO has_permit (id, role_id, permission_id) 
                        VALUES ('${uniqueId}', '${roleId}', '${permId}')
                    `);
				}
			}
		}
	}

	/**
	 * @param {QueryRunner} queryRunner
	 */
	async down(queryRunner) {
		// Hapus data yang ditambahkan
		const permissionNames = [
			"product",
			"product-edit",
			"category",
			"category-edit",
			"role",
			"role-edit",
			"grade",
			"grade-edit",
			"so-detail",
			"so-detail-edit",
			"purchase",
			"purchase-edit",
			"permission",
			"permission-edit",
			"supplier",
			"supplier-edit",
			"service",
			"service-edit",
			"stock-opname",
			"stock-opname-edit",
			"user",
			"user-edit",
			"profile",
			"profile-edit",
			"has-permit",
			"has-permit-edit",
			"reject",
			"reject-edit",
			"config",
			"config-edit",
			"cat-app",
			"cat-app-edit",
			"price",
			"price-edit",
			"stock",
			"stock-edit",
			"member",
			"member-edit",
			"size",
			"size-edit",
			"session",
		];

		// Ambil ID berdasarkan nama
		const perms = await queryRunner.query(
			`SELECT id FROM permission WHERE name IN ('${permissionNames.join("','")}')`,
		);
		const ids = perms.map((p) => p.id);

		if (ids.length > 0) {
			// Hapus dari has_permit
			await queryRunner.query(
				`DELETE FROM has_permit WHERE permission_id IN ('${ids.join("','")}')`,
			);

			// Hapus dari permission
			await queryRunner.query(
				`DELETE FROM permission WHERE id IN ('${ids.join("','")}')`,
			);
		}
	}
};
