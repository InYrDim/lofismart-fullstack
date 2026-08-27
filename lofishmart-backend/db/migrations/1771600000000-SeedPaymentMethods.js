/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedPaymentMethods1771600000000 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log('Menjalankan migrasi: Menambahkan payment methods (cash, qris)...');

        const paymentMethods = [
            { id: "cash", name: "cash", icon: "cash" },
            { id: "qris", name: "qris", icon: "qris" }
        ];

        // Using REPLACE to handle potential duplicates gracefully or INSERT IGNORE in MySQL syntax
        // QueryBuilder insert handles this if we want, or we can just iterate.
        for (const pm of paymentMethods) {
            await queryRunner.query(
                "INSERT IGNORE INTO `payment_method` (`id`, `name`, `icon`) VALUES (?, ?, ?)",
                [pm.id, pm.name, pm.icon]
            );
        }

        console.log('Migrasi Payment Methods selesai.');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log('Menjalankan rollback: Menghapus payment methods (cash, qris)...');

        await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from('payment_method')
            .where("id IN (:...ids)", { ids: ["cash", "qris"] })
            .execute();

        console.log('Rollback Migrasi Payment Methods selesai.');
    }

}
