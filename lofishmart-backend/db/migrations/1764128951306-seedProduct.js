/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class SeedProduct1764128951306 {
	/**
	 * @param {QueryRunner} queryRunner
	 */
	async up(queryRunner) {
		// Skipped: no initial product seeding
		console.log("Skipping product seeder (no initial products).");
	}

	/**
	 * @param {QueryRunner} queryRunner
	 */
	async down(queryRunner) {
		// No-op since up doesn't insert anything
	}
};
