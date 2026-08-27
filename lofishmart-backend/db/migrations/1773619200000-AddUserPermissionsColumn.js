/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddUserPermissionsColumn1773619200000 {
	/**
	 * @param {QueryRunner} queryRunner
	 */
	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE \`user\` ADD \`permissions\` JSON NULL AFTER \`market_id\``
		);
	}

	/**
	 * @param {QueryRunner} queryRunner
	 */
	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE \`user\` DROP COLUMN \`permissions\``
		);
	}
};
