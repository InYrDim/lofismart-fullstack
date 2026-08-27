/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedSettings1777254950000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan seeder settings (payment, size, cat_app, etc)');

        // Cat App
        const catApps = [
            { id: 'APP1', name: 'Lofi Mart POS', data_watch: JSON.stringify({ version: '1.0.0' }) },
        ];

        for (const app of catApps) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`cat_app\` (\`id\`, \`name\`, \`data_watch\`) VALUES (?, ?, ?)`,
                [app.id, app.name, app.data_watch]
            );
        }

        // Payment Methods
        const paymentMethods = [
            { id: 'PAY1', name: 'Tunai', icon: 'cash' },
            { id: 'PAY2', name: 'QRIS', icon: 'qr_code' },
            { id: 'PAY3', name: 'Transfer Bank', icon: 'account_balance' },
        ];

        for (const pm of paymentMethods) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`payment_method\` (\`id\`, \`name\`, \`icon\`) VALUES (?, ?, ?)`,
                [pm.id, pm.name, pm.icon]
            );
        }

        // Sizes
        const sizes = [
            { id: 'SZ01', name: 'Kecil', barcode: 'S' },
            { id: 'SZ02', name: 'Sedang', barcode: 'M' },
            { id: 'SZ03', name: 'Besar', barcode: 'L' },
        ];

        for (const sz of sizes) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`size\` (\`id\`, \`name\`, \`barcode\`) VALUES (?, ?, ?)`,
                [sz.id, sz.name, sz.barcode]
            );
        }

        // Weight Scales
        const weightScales = [
            { name: 'Timbangan 01', status: '1', mac_ip: '192.168.1.101' },
            { name: 'Timbangan 02', status: '1', mac_ip: '192.168.1.102' },
        ];

        for (const ws of weightScales) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`weight_scale\` (\`name\`, \`status\`, \`mac_ip\`) VALUES (?, ?, ?)`,
                [ws.name, ws.status, ws.mac_ip]
            );
        }

        // Vouchers
        const vouchers = [
            { id: 'VOUCH01', name: 'DISKON AWAL', desc: 'Diskon 10rb', is_fix_disc: '1', max_disc: 10000, image: 'vouch.png', qty: 100, status: '1' },
            { id: 'VOUCH02', name: 'DISKON PERSEN', desc: 'Diskon 10%', is_fix_disc: '2', percent_disc: 10, max_disc: 50000, image: 'vouch.png', qty: 50, status: '1' },
        ];

        for (const v of vouchers) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`voucher\` (\`id\`, \`name\`, \`desc\`, \`is_fix_disc\`, \`max_disc\`, \`percent_disc\`, \`image\`, \`qty\`, \`status\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [v.id, v.name, v.desc, v.is_fix_disc, v.max_disc, v.percent_disc || 0, v.image, v.qty, v.status]
            );
        }

        console.log('Seeder settings selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback settings');
        await queryRunner.query(`DELETE FROM \`cat_app\``);
        await queryRunner.query(`DELETE FROM \`voucher\``);
        await queryRunner.query(`DELETE FROM \`payment_method\``);
        await queryRunner.query(`DELETE FROM \`size\``);
        await queryRunner.query(`DELETE FROM \`weight_scale\``);
        console.log('Rollback Seeder settings selesai.');
    }

}
