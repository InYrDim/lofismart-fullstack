/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class UpdateDataSync1765275484978 {
    name = 'UpdateDataSync1765275484978'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`branch_id\` \`branch_id\` varchar(30) NULL COMMENT 'profile id'`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`pk_id\` \`pk_id\` varchar(30) NULL`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`payload\` \`payload\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`branch_id\` \`branch_id\` varchar(30) NULL COMMENT 'profile id'`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`pk_id\` \`pk_id\` varchar(30) NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`payload\` \`payload\` json NULL`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`payload\` \`payload\` json NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`pk_id\` \`pk_id\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_change\` CHANGE \`branch_id\` \`branch_id\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`payload\` \`payload\` json NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`pk_id\` \`pk_id\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`data_receive\` CHANGE \`branch_id\` \`branch_id\` varchar(30) NOT NULL`);
    }
}
