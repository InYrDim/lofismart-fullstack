/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddUserImageColumn1773900000000 {
	/**
	 * @param {QueryRunner} queryRunner
	 */
	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE \`user\` ADD \`image\` VARCHAR(255) NULL AFTER \`permissions\``
		);
	}

	/**
	 * @param {QueryRunner} queryRunner
	 */
	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE \`user\` DROP COLUMN \`image\``
		);
	}
};
