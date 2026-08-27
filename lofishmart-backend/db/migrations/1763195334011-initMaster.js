/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitMaster1763195334011 {
    name = 'InitMaster1763195334011'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`weight_scale\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(30) NOT NULL, \`status\` enum ('1', '2', '3') NOT NULL COMMENT 'Order (1 = activ connect, 2 = disconnect, 3 = non activ)' DEFAULT '1', \`mac_ip\` varchar(30) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`voucher\` (\`id\` varchar(10) NOT NULL COMMENT 'used as barcode to', \`name\` varchar(60) NOT NULL, \`desc\` text NULL, \`is_fix_disc\` enum ('1', '2') NOT NULL COMMENT 'Order (1 = yes, 2 = no)' DEFAULT '1', \`min_price\` double NOT NULL COMMENT 'Minimum belanja' DEFAULT '0', \`percent_disc\` double NOT NULL COMMENT 'not fix disc*, disc % by buying' DEFAULT '0', \`max_disc\` double NOT NULL COMMENT 'cap disc from % or fix_disc' DEFAULT '0', \`image\` varchar(100) NOT NULL, \`qty\` int NOT NULL COMMENT 'quota voucher' DEFAULT '0', \`used\` int NOT NULL DEFAULT '0', \`status\` enum ('1', '2', '3', '4') NOT NULL COMMENT 'Order (1=activ, 2=non activ, 3=expire, 4=outquota)' DEFAULT '1', \`started_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expired_at\` timestamp(6) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(8) NOT NULL, \`name\` varchar(150) NOT NULL, \`email\` varchar(150) NOT NULL, \`username\` varchar(30) NOT NULL, \`password\` varchar(255) NOT NULL, \`remember_token\` varchar(150) NULL COMMENT 'auto login', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`role_id\` varchar(4) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sync_import\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`file_name\` varchar(200) NOT NULL, \`type_job\` varchar(200) NOT NULL COMMENT 'name table', \`processed_row\` int NOT NULL DEFAULT '0', \`total_row\` int NOT NULL DEFAULT '0', \`failed_row\` int NOT NULL DEFAULT '0', \`from_row\` timestamp NOT NULL, \`to_row\` timestamp NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sync_export\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`file_name\` varchar(200) NOT NULL, \`type_job\` varchar(200) NOT NULL COMMENT 'name table', \`processed_row\` int NOT NULL DEFAULT '0', \`total_row\` int NOT NULL DEFAULT '0', \`failed_row\` int NOT NULL DEFAULT '0', \`from_row\` timestamp NOT NULL, \`to_row\` timestamp NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`supplier\` (\`id\` varchar(8) NOT NULL, \`corporation\` varchar(60) NOT NULL, \`name\` varchar(60) NOT NULL, \`email\` varchar(150) NULL, \`phone_number\` varchar(20) NOT NULL, \`address\` text NULL, \`city\` varchar(20) NULL, \`pos\` varchar(10) NULL, \`bank\` varchar(20) NULL, \`no_rek\` varchar(20) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, UNIQUE INDEX \`IDX_c40cbff7400f06ae1c8d9f4233\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock_opname_detail\` (\`id\` varchar(16) NOT NULL, \`current_stock\` double NOT NULL DEFAULT '0', \`actual_stock\` double NOT NULL DEFAULT '0', \`missing_stock\` double NOT NULL DEFAULT '0', \`barcode\` varchar(30) NULL, \`adjustment_type\` enum ('1', '2', '3', '4') NOT NULL COMMENT 'Satuan produk (1 = expired, 2 = broken, 3 = other)' DEFAULT '1', \`attachment\` varchar(200) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`stock_opname_id\` varchar(16) NOT NULL, \`product_id\` varchar(8) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock_opname\` (\`id\` varchar(16) NOT NULL, \`batch\` varchar(100) NULL, \`barcode\` varchar(30) NULL, \`status\` enum ('1', '2') NOT NULL COMMENT 'Status (1 = overview, 1 = approved)' DEFAULT '1', \`image\` varchar(200) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`approved_at\` timestamp(6) NULL, \`user_id\` varchar(8) NULL, \`market_id\` varchar(8) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock\` (\`id\` varchar(16) NOT NULL, \`batch\` varchar(100) NULL, \`barcode\` varchar(30) NULL, \`unit\` enum ('1', '2') NOT NULL COMMENT 'Satuan produk (2 = per item, 1 = per kilogram)' DEFAULT '1', \`qty\` double NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`expired_at\` timestamp(6) NULL, \`user_id\` varchar(8) NULL, \`product_id\` varchar(8) NOT NULL, \`werehouse_id\` varchar(8) NULL, \`market_id\` varchar(8) NULL, \`purchase_id\` varchar(16) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`size\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`session\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`ip_address\` varchar(30) NOT NULL, \`user_agent\` text NOT NULL, \`payload\` longtext NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` varchar(8) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`service\` (\`id\` varchar(6) NOT NULL, \`name\` varchar(100) NOT NULL, \`barcode\` varchar(30) NULL, \`unit\` enum ('1', '2') NOT NULL COMMENT 'Satuan produk (2 = per item, 1 = per kilogram)' DEFAULT '1', \`price\` double NOT NULL COMMENT 'Harga layanan' DEFAULT '0', \`disc\` double NOT NULL COMMENT 'Diskon layanan' DEFAULT '0', \`image\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`selling_service_detail\` (\`id\` varchar(24) NOT NULL, \`qty\` int NOT NULL COMMENT 'quota voucher' DEFAULT '0', \`mod_price\` double NOT NULL DEFAULT '0', \`total_price\` double NOT NULL COMMENT 'price * weight/pcs' DEFAULT '0', \`note\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`selling_id\` varchar(20) NOT NULL, \`service_id\` varchar(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`selling_product_detail\` (\`id\` varchar(24) NOT NULL, \`qty\` int NOT NULL COMMENT 'quota voucher' DEFAULT '0', \`mod_price\` double NOT NULL COMMENT 'if grade is 3-4' DEFAULT '0', \`total_price\` double NOT NULL COMMENT 'price * weight/pcs' DEFAULT '0', \`note\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`selling_id\` varchar(20) NOT NULL, \`price_id\` varchar(16) NULL, \`stock_id\` varchar(16) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`selling\` (\`id\` varchar(20) NOT NULL, \`payment_id\` varchar(200) NULL, \`total_weight_qty\` double NOT NULL DEFAULT '0', \`totol_pcs_qty\` double NOT NULL DEFAULT '0', \`price\` double NOT NULL DEFAULT '0', \`per_item_disc\` double NOT NULL DEFAULT '0', \`voucher_disc\` double NOT NULL DEFAULT '0', \`total_disc\` double NOT NULL DEFAULT '0', \`tax_price\` double NOT NULL DEFAULT '0', \`total_price\` double NOT NULL DEFAULT '0', \`payed_money\` double NOT NULL DEFAULT '0', \`change_money\` double NOT NULL DEFAULT '0', \`is_paid\` enum ('1', '2', '3', '4') NOT NULL COMMENT 'Status pembayaran (1 = overview, 2 = unpaid, 3 = paid)' DEFAULT '1', \`online_order\` enum ('1', '2', '3') NOT NULL COMMENT 'Order (1 = offline, 2 = offline, 3 = other)' DEFAULT '1', \`note\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` varchar(8) NULL, \`market_id\` varchar(8) NULL, \`member_id\` varchar(10) NULL, \`payment_method_id\` varchar(4) NULL, \`voucher_id\` varchar(10) NULL COMMENT 'used as barcode to', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(20) NOT NULL, \`guard_name\` varchar(20) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reject\` (\`id\` varchar(16) NOT NULL, \`barcode\` varchar(30) NULL, \`status\` enum ('1', '2', '3', '4') NOT NULL COMMENT 'Satuan produk (1 = expired, 2 = broken, 3 = other)' DEFAULT '1', \`unit\` enum ('1', '2') NOT NULL COMMENT 'Satuan produk (2 = per item, 1 = per kilogram)' DEFAULT '1', \`qty\` double NOT NULL DEFAULT '0', \`desc\` text NULL COMMENT 'Deskripsi/keterangan reject', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` varchar(8) NULL, \`stock_id\` varchar(16) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`purchase\` (\`id\` varchar(16) NOT NULL, \`batch\` varchar(100) NULL, \`barcode\` varchar(30) NULL, \`unit\` enum ('1', '2') NOT NULL COMMENT 'Satuan produk (2 = per item, 1 = per kilogram)' DEFAULT '1', \`qty\` double NOT NULL DEFAULT '0', \`price\` double NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`expired_at\` timestamp(6) NULL, \`user_id\` varchar(8) NULL, \`product_id\` varchar(8) NULL, \`werehouse_id\` varchar(8) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` varchar(8) NOT NULL, \`name\` varchar(60) NOT NULL, \`address\` text NULL, \`maps\` text NULL, \`city\` varchar(20) NULL, \`pos\` varchar(10) NULL, \`timezone\` varchar(30) NULL, \`time_dif\` int NOT NULL DEFAULT '0', \`phone_number\` varchar(20) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` varchar(8) NOT NULL, \`name\` varchar(100) NOT NULL, \`barcode\` varchar(30) NULL, \`unit\` enum ('1', '2') NOT NULL COMMENT 'Satuan produk (2 = per item, 1 = per kilogram)' DEFAULT '1', \`is_non_stock\` enum ('1', '2') NOT NULL COMMENT 'Satuan produk (1 = ready, 2 = pre order/kosong)' DEFAULT '1', \`is_show\` enum ('1', '2') NOT NULL COMMENT 'Tampilkan (1 = show, 2 = hide)' DEFAULT '1', \`image\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`size_id\` varchar(4) NOT NULL, \`category_id\` varchar(4) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`price\` (\`id\` varchar(16) NOT NULL, \`initial\` double NOT NULL COMMENT 'Harga beli' DEFAULT '0', \`selling\` double NOT NULL COMMENT 'Harga jual' DEFAULT '0', \`disc\` double NOT NULL COMMENT 'Disc' DEFAULT '0', \`created_at\` timestamp NOT NULL, \`updated_at\` timestamp NOT NULL, \`product_id\` varchar(8) NOT NULL, \`grade_id\` varchar(4) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_method\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(30) NOT NULL, \`icon\` varchar(100) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(20) NOT NULL, \`guard_name\` varchar(20) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` varchar(8) NOT NULL, \`type\` enum ('1', '2', '3') NOT NULL COMMENT 'info, success, warning, danger' DEFAULT '1', \`message\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`read_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`profile_id\` varchar(8) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`member\` (\`id\` varchar(10) NOT NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(150) NULL, \`identity_type\` enum ('1', '2', '3') NOT NULL COMMENT 'ktp, paspor, other' DEFAULT '1', \`identity_number\` varchar(30) NOT NULL, \`address\` text NULL, \`maps\` text NULL, \`phone_number\` varchar(20) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, UNIQUE INDEX \`IDX_4678079964ab375b2b31849456\` (\`email\`), UNIQUE INDEX \`IDX_d525e9306dd1c7920b4328d9ee\` (\`identity_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`has_permit\` (\`id\` varchar(8) NOT NULL, \`role_id\` varchar(4) NOT NULL, \`permission_id\` varchar(4) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`grade\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`failed_job\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`validation_error\` text NOT NULL, \`row_error\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sync_export_id\` int UNSIGNED NULL, \`sync_import_id\` int UNSIGNED NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`data_receive\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`branch_id\` varchar(30) NOT NULL, \`table_name\` varchar(30) NOT NULL, \`pk_id\` varchar(30) NOT NULL, \`action\` enum ('INSERT', 'UPDATE', 'DELETE') NOT NULL, \`sync_status\` enum ('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS', \`payload\` json NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`data_change\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`branch_id\` varchar(30) NOT NULL, \`table_name\` varchar(30) NOT NULL, \`pk_id\` varchar(30) NOT NULL, \`action\` enum ('INSERT', 'UPDATE', 'DELETE') NOT NULL, \`sync_status\` enum ('PENDING', 'SENDING') NOT NULL DEFAULT 'PENDING', \`payload\` json NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`config\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cat_app_id\` varchar(4) NULL, \`profile_id\` varchar(8) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cat_app\` (\`id\` varchar(4) NOT NULL, \`name\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cash_drawer\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`is_open\` enum ('1', '2') NOT NULL COMMENT 'Order (1 = yes, 2 = no)' DEFAULT '1', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`selling_id\` varchar(20) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart_item\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`qty\` double NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`expired_at\` timestamp(6) NULL, \`price_id\` varchar(16) NOT NULL, \`weight_scale_id\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock_opname_detail\` ADD CONSTRAINT \`FK_3caafb01dc628449434bdc5c139\` FOREIGN KEY (\`stock_opname_id\`) REFERENCES \`stock_opname\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock_opname_detail\` ADD CONSTRAINT \`FK_bc06acfa85a7547f736dcd78323\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` ADD CONSTRAINT \`FK_326d4c725641b395471451fd3bf\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` ADD CONSTRAINT \`FK_cb3b9d97b8f47542d5752a5f53e\` FOREIGN KEY (\`market_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_55437be5c4e111de5c6c4ec6254\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_375ba760c8cff338fc8c94b416c\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_d5bb1551b69173b2ff2711dbc81\` FOREIGN KEY (\`werehouse_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_6b64db4353495782b807c2a9acd\` FOREIGN KEY (\`market_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_1112f220afb428af2789d970253\` FOREIGN KEY (\`purchase_id\`) REFERENCES \`purchase\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD CONSTRAINT \`FK_30e98e8746699fb9af235410aff\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling_service_detail\` ADD CONSTRAINT \`FK_ce74522551a66cb7a97a952a46f\` FOREIGN KEY (\`selling_id\`) REFERENCES \`selling\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling_service_detail\` ADD CONSTRAINT \`FK_c9b5a7f2aafe8f591299f9e994d\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` ADD CONSTRAINT \`FK_c96d7ca9a98d619c8d7cef9029f\` FOREIGN KEY (\`selling_id\`) REFERENCES \`selling\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` ADD CONSTRAINT \`FK_b70666a4c15a9b56add7c328608\` FOREIGN KEY (\`price_id\`) REFERENCES \`price\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` ADD CONSTRAINT \`FK_88acbb7de9a53edfefcb50cfea2\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stock\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling\` ADD CONSTRAINT \`FK_5d5672042d3e59ba3e8b99cbd7d\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling\` ADD CONSTRAINT \`FK_52063bcd5d01eedb4ab6904b812\` FOREIGN KEY (\`market_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling\` ADD CONSTRAINT \`FK_48e318ca93aaeb7addb98a3c9e3\` FOREIGN KEY (\`member_id\`) REFERENCES \`member\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling\` ADD CONSTRAINT \`FK_142630313a285423f768e3e8711\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_method\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`selling\` ADD CONSTRAINT \`FK_5c23a1c68a5a149b2b65ebdd2f2\` FOREIGN KEY (\`voucher_id\`) REFERENCES \`voucher\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`reject\` ADD CONSTRAINT \`FK_2c60396b4be1916c4faf2cdafe3\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`reject\` ADD CONSTRAINT \`FK_db5af3d0500c1df4359b24e631d\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stock\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`purchase\` ADD CONSTRAINT \`FK_c4f9e58ae516d88361b37ed9532\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`purchase\` ADD CONSTRAINT \`FK_70f3fd21152b586eb4ceae61c43\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`purchase\` ADD CONSTRAINT \`FK_3eec787c4a1d06674ff9b560a06\` FOREIGN KEY (\`werehouse_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_3210db31599e5c505183be05896\` FOREIGN KEY (\`size_id\`) REFERENCES \`size\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_0dce9bc93c2d2c399982d04bef1\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`price\` ADD CONSTRAINT \`FK_7511931669fa9be1c5224cf09e0\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`price\` ADD CONSTRAINT \`FK_e59233fc1625a845000185ace06\` FOREIGN KEY (\`grade_id\`) REFERENCES \`grade\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_d5053f1b17dd9e1bc49df2045f1\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`has_permit\` ADD CONSTRAINT \`FK_0c13125d93496fc02f6bd349e10\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`has_permit\` ADD CONSTRAINT \`FK_4c3222e3727abea4fcd53dd03e0\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`failed_job\` ADD CONSTRAINT \`FK_282c9890145c684b6f0f99fd5dd\` FOREIGN KEY (\`sync_export_id\`) REFERENCES \`sync_export\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`failed_job\` ADD CONSTRAINT \`FK_35b74de2f100fbb9fe659e1307a\` FOREIGN KEY (\`sync_import_id\`) REFERENCES \`sync_import\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`config\` ADD CONSTRAINT \`FK_d5b7e90047094e7c885818750ee\` FOREIGN KEY (\`cat_app_id\`) REFERENCES \`cat_app\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`config\` ADD CONSTRAINT \`FK_06530ab1891e930ad903f910d55\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`cash_drawer\` ADD CONSTRAINT \`FK_eb50751b30a86ba43062be3c3d6\` FOREIGN KEY (\`selling_id\`) REFERENCES \`selling\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_f7fa99d5c584b9658504c2b59ab\` FOREIGN KEY (\`price_id\`) REFERENCES \`price\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_25c0dcb556fe905390a8646b197\` FOREIGN KEY (\`weight_scale_id\`) REFERENCES \`weight_scale\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_25c0dcb556fe905390a8646b197\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_f7fa99d5c584b9658504c2b59ab\``);
        await queryRunner.query(`ALTER TABLE \`cash_drawer\` DROP FOREIGN KEY \`FK_eb50751b30a86ba43062be3c3d6\``);
        await queryRunner.query(`ALTER TABLE \`config\` DROP FOREIGN KEY \`FK_06530ab1891e930ad903f910d55\``);
        await queryRunner.query(`ALTER TABLE \`config\` DROP FOREIGN KEY \`FK_d5b7e90047094e7c885818750ee\``);
        await queryRunner.query(`ALTER TABLE \`failed_job\` DROP FOREIGN KEY \`FK_35b74de2f100fbb9fe659e1307a\``);
        await queryRunner.query(`ALTER TABLE \`failed_job\` DROP FOREIGN KEY \`FK_282c9890145c684b6f0f99fd5dd\``);
        await queryRunner.query(`ALTER TABLE \`has_permit\` DROP FOREIGN KEY \`FK_4c3222e3727abea4fcd53dd03e0\``);
        await queryRunner.query(`ALTER TABLE \`has_permit\` DROP FOREIGN KEY \`FK_0c13125d93496fc02f6bd349e10\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_d5053f1b17dd9e1bc49df2045f1\``);
        await queryRunner.query(`ALTER TABLE \`price\` DROP FOREIGN KEY \`FK_e59233fc1625a845000185ace06\``);
        await queryRunner.query(`ALTER TABLE \`price\` DROP FOREIGN KEY \`FK_7511931669fa9be1c5224cf09e0\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_0dce9bc93c2d2c399982d04bef1\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_3210db31599e5c505183be05896\``);
        await queryRunner.query(`ALTER TABLE \`purchase\` DROP FOREIGN KEY \`FK_3eec787c4a1d06674ff9b560a06\``);
        await queryRunner.query(`ALTER TABLE \`purchase\` DROP FOREIGN KEY \`FK_70f3fd21152b586eb4ceae61c43\``);
        await queryRunner.query(`ALTER TABLE \`purchase\` DROP FOREIGN KEY \`FK_c4f9e58ae516d88361b37ed9532\``);
        await queryRunner.query(`ALTER TABLE \`reject\` DROP FOREIGN KEY \`FK_db5af3d0500c1df4359b24e631d\``);
        await queryRunner.query(`ALTER TABLE \`reject\` DROP FOREIGN KEY \`FK_2c60396b4be1916c4faf2cdafe3\``);
        await queryRunner.query(`ALTER TABLE \`selling\` DROP FOREIGN KEY \`FK_5c23a1c68a5a149b2b65ebdd2f2\``);
        await queryRunner.query(`ALTER TABLE \`selling\` DROP FOREIGN KEY \`FK_142630313a285423f768e3e8711\``);
        await queryRunner.query(`ALTER TABLE \`selling\` DROP FOREIGN KEY \`FK_48e318ca93aaeb7addb98a3c9e3\``);
        await queryRunner.query(`ALTER TABLE \`selling\` DROP FOREIGN KEY \`FK_52063bcd5d01eedb4ab6904b812\``);
        await queryRunner.query(`ALTER TABLE \`selling\` DROP FOREIGN KEY \`FK_5d5672042d3e59ba3e8b99cbd7d\``);
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` DROP FOREIGN KEY \`FK_88acbb7de9a53edfefcb50cfea2\``);
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` DROP FOREIGN KEY \`FK_b70666a4c15a9b56add7c328608\``);
        await queryRunner.query(`ALTER TABLE \`selling_product_detail\` DROP FOREIGN KEY \`FK_c96d7ca9a98d619c8d7cef9029f\``);
        await queryRunner.query(`ALTER TABLE \`selling_service_detail\` DROP FOREIGN KEY \`FK_c9b5a7f2aafe8f591299f9e994d\``);
        await queryRunner.query(`ALTER TABLE \`selling_service_detail\` DROP FOREIGN KEY \`FK_ce74522551a66cb7a97a952a46f\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP FOREIGN KEY \`FK_30e98e8746699fb9af235410aff\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_1112f220afb428af2789d970253\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_6b64db4353495782b807c2a9acd\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_d5bb1551b69173b2ff2711dbc81\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_375ba760c8cff338fc8c94b416c\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_55437be5c4e111de5c6c4ec6254\``);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` DROP FOREIGN KEY \`FK_cb3b9d97b8f47542d5752a5f53e\``);
        await queryRunner.query(`ALTER TABLE \`stock_opname\` DROP FOREIGN KEY \`FK_326d4c725641b395471451fd3bf\``);
        await queryRunner.query(`ALTER TABLE \`stock_opname_detail\` DROP FOREIGN KEY \`FK_bc06acfa85a7547f736dcd78323\``);
        await queryRunner.query(`ALTER TABLE \`stock_opname_detail\` DROP FOREIGN KEY \`FK_3caafb01dc628449434bdc5c139\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``);
        await queryRunner.query(`DROP TABLE \`cart_item\``);
        await queryRunner.query(`DROP TABLE \`cash_drawer\``);
        await queryRunner.query(`DROP TABLE \`cat_app\``);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP TABLE \`config\``);
        await queryRunner.query(`DROP TABLE \`data_change\``);
        await queryRunner.query(`DROP TABLE \`data_receive\``);
        await queryRunner.query(`DROP TABLE \`failed_job\``);
        await queryRunner.query(`DROP TABLE \`grade\``);
        await queryRunner.query(`DROP TABLE \`has_permit\``);
        await queryRunner.query(`DROP INDEX \`IDX_d525e9306dd1c7920b4328d9ee\` ON \`member\``);
        await queryRunner.query(`DROP INDEX \`IDX_4678079964ab375b2b31849456\` ON \`member\``);
        await queryRunner.query(`DROP TABLE \`member\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
        await queryRunner.query(`DROP TABLE \`payment_method\``);
        await queryRunner.query(`DROP TABLE \`price\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP TABLE \`profile\``);
        await queryRunner.query(`DROP TABLE \`purchase\``);
        await queryRunner.query(`DROP TABLE \`reject\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`selling\``);
        await queryRunner.query(`DROP TABLE \`selling_product_detail\``);
        await queryRunner.query(`DROP TABLE \`selling_service_detail\``);
        await queryRunner.query(`DROP TABLE \`service\``);
        await queryRunner.query(`DROP TABLE \`session\``);
        await queryRunner.query(`DROP TABLE \`size\``);
        await queryRunner.query(`DROP TABLE \`stock\``);
        await queryRunner.query(`DROP TABLE \`stock_opname\``);
        await queryRunner.query(`DROP TABLE \`stock_opname_detail\``);
        await queryRunner.query(`DROP INDEX \`IDX_c40cbff7400f06ae1c8d9f4233\` ON \`supplier\``);
        await queryRunner.query(`DROP TABLE \`supplier\``);
        await queryRunner.query(`DROP TABLE \`sync_export\``);
        await queryRunner.query(`DROP TABLE \`sync_import\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`voucher\``);
        await queryRunner.query(`DROP TABLE \`weight_scale\``);
    }
}
