/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * Assigns supervisor1 user to the 'lelong' outlet
 * This fixes the issue where SPVR role users couldn't see stock counts
 * because they had no market_id assigned.
 * 
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AssignSupervisorToLelongOutlet1777100000000 {
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        console.log("Assigning supervisor1 to 'lelong' outlet...");

        // First, find the lelong outlet ID
        const lelongResult = await queryRunner.query(
            "SELECT id FROM profile WHERE name LIKE '%lelong%' LIMIT 1"
        );

        if (!lelongResult || lelongResult.length === 0) {
            console.warn("⚠️  'lelong' outlet not found. Skipping migration.");
            console.log("Available profiles:");
            const profiles = await queryRunner.query("SELECT id, name FROM profile");
            profiles.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
            return;
        }

        const lelongId = lelongResult[0].id;
        console.log(`Found 'lelong' outlet with ID: ${lelongId}`);

        // Update supervisor1's market_id
        const updateResult = await queryRunner.query(
            "UPDATE user SET market_id = ? WHERE username = 'supervisor1'",
            [lelongId]
        );

        if (updateResult.affectedRows > 0) {
            console.log(`✅ Successfully assigned supervisor1 to '${lelongId}' outlet`);
        } else {
            console.warn("⚠️  supervisor1 user not found or already assigned to this outlet");
        }
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        console.log("Rolling back: Removing supervisor1's market assignment...");

        await queryRunner.query(
            "UPDATE user SET market_id = NULL WHERE username = 'supervisor1'"
        );

        console.log("✅ Rollback complete");
    }
}
