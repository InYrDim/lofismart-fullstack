/**
 * Migration: AddStockTransfer
 * Membuat tabel stock_transfer dan menambah permissions terkait.
 */
module.exports = class AddStockTransfer1774100000000 {
    async up(queryRunner) {
        // 1. Buat tabel stock_transfer
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`stock_transfer\` (
                \`id\` varchar(16) NOT NULL,
                \`qty\` double NOT NULL DEFAULT 0 COMMENT 'Jumlah yang dikirim dari gudang',
                \`unit\` enum('1','2') NOT NULL DEFAULT '1' COMMENT 'Satuan: 1=KG, 2=Ekor',
                \`status\` enum('SENDING','WAITING_VERIFICATION','DONE','CANCELLED') NOT NULL DEFAULT 'SENDING',
                \`notes\` varchar(500) NULL COMMENT 'Catatan dari pengirim',
                \`verified_qty\` double NULL COMMENT 'Qty yang diterima setelah verifikasi SPVR',
                \`verified_notes\` varchar(500) NULL COMMENT 'Catatan penerimaan dari SPVR',
                \`sent_at\` timestamp NULL COMMENT 'Waktu status berubah ke WAITING_VERIFICATION',
                \`verified_at\` timestamp NULL COMMENT 'Waktu status berubah ke DONE',
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`source_stock_id\` varchar(16) NULL,
                \`target_market_id\` varchar(36) NULL,
                \`product_id\` varchar(16) NULL,
                \`created_by_id\` varchar(8) NULL,
                \`verified_by_id\` varchar(8) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 2. Tambah Foreign Keys
        await queryRunner.query(`
            ALTER TABLE \`stock_transfer\`
                ADD CONSTRAINT \`FK_st_source_stock\`
                    FOREIGN KEY (\`source_stock_id\`) REFERENCES \`stock\`(\`id\`)
                    ON DELETE SET NULL ON UPDATE CASCADE,
                ADD CONSTRAINT \`FK_st_target_market\`
                    FOREIGN KEY (\`target_market_id\`) REFERENCES \`profile\`(\`id\`)
                    ON DELETE SET NULL ON UPDATE CASCADE,
                ADD CONSTRAINT \`FK_st_product\`
                    FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`)
                    ON DELETE SET NULL ON UPDATE CASCADE,
                ADD CONSTRAINT \`FK_st_created_by\`
                    FOREIGN KEY (\`created_by_id\`) REFERENCES \`user\`(\`id\`)
                    ON DELETE SET NULL ON UPDATE CASCADE,
                ADD CONSTRAINT \`FK_st_verified_by\`
                    FOREIGN KEY (\`verified_by_id\`) REFERENCES \`user\`(\`id\`)
                    ON DELETE SET NULL ON UPDATE CASCADE
        `);

        // 3. Tambah Permissions
        const permissions = [
            { id: 'STRF', name: 'stock-transfer' },
            { id: 'STED', name: 'stock-transfer-edit' },
        ];

        for (const perm of permissions) {
            const exists = await queryRunner.query(
                `SELECT id FROM permission WHERE id = '${perm.id}' OR name = '${perm.name}' LIMIT 1`
            );
            if (exists.length === 0) {
                await queryRunner.query(
                    `INSERT INTO permission (id, name, guard_name) VALUES ('${perm.id}', '${perm.name}', 'web')`
                );
            }
        }

        // 4. Ambil semua role yang benar-benar ada di DB
        const allRoles = await queryRunner.query(`SELECT id FROM \`role\``);
        const existingRoleIds = allRoles.map(r => r.id);

        // Role yang dapat full access (baca + edit)
        const wantFullAccess = ['ADMN', 'MGR', 'MNGR', 'MANAGER'];
        // Role yang dapat baca + edit juga (operasional)
        const wantEditAccess = ['GDNG', 'SPVR', 'GUDANG', 'SUPERVISOR'];

        const rolesWithFullAccess = existingRoleIds.filter(id => wantFullAccess.includes(id));
        const rolesWithEditAccess = existingRoleIds.filter(id => wantEditAccess.includes(id));

        // Helper: grant permission ke role jika belum ada
        const grantPermission = async (roleId, permName) => {
            const dbPerm = await queryRunner.query(
                `SELECT id FROM permission WHERE name = '${permName}' LIMIT 1`
            );
            if (dbPerm.length === 0) return;
            const permId = dbPerm[0].id;
            const has = await queryRunner.query(
                `SELECT id FROM has_permit WHERE role_id = '${roleId}' AND permission_id = '${permId}'`
            );
            if (has.length === 0) {
                const uid = Math.random().toString(36).substring(2, 10);
                await queryRunner.query(
                    `INSERT INTO has_permit (id, role_id, permission_id) VALUES ('${uid}', '${roleId}', '${permId}')`
                );
            }
        };

        // Grant stock-transfer + stock-transfer-edit ke admin/manager
        for (const roleId of rolesWithFullAccess) {
            await grantPermission(roleId, 'stock-transfer');
            await grantPermission(roleId, 'stock-transfer-edit');
        }

        // Grant stock-transfer + stock-transfer-edit ke GDNG/SPVR
        for (const roleId of rolesWithEditAccess) {
            await grantPermission(roleId, 'stock-transfer');
            await grantPermission(roleId, 'stock-transfer-edit');
        }
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`stock_transfer\` DROP FOREIGN KEY \`FK_st_source_stock\``);
        await queryRunner.query(`ALTER TABLE \`stock_transfer\` DROP FOREIGN KEY \`FK_st_target_market\``);
        await queryRunner.query(`ALTER TABLE \`stock_transfer\` DROP FOREIGN KEY \`FK_st_product\``);
        await queryRunner.query(`ALTER TABLE \`stock_transfer\` DROP FOREIGN KEY \`FK_st_created_by\``);
        await queryRunner.query(`ALTER TABLE \`stock_transfer\` DROP FOREIGN KEY \`FK_st_verified_by\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`stock_transfer\``);

        const permNames = ['stock-transfer', 'stock-transfer-edit'];
        const perms = await queryRunner.query(
            `SELECT id FROM permission WHERE name IN ('${permNames.join("','")}')`
        );
        const ids = perms.map(p => p.id);
        if (ids.length > 0) {
            await queryRunner.query(`DELETE FROM has_permit WHERE permission_id IN ('${ids.join("','")}')`);
            await queryRunner.query(`DELETE FROM permission WHERE id IN ('${ids.join("','")}')`);
        }
    }
};
