const mysql = require('mysql2/promise');

async function fixDb() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'lofish_market'
    });

    // Get a valid size entry to use as fallback
    const [sizes] = await connection.execute('SELECT id FROM size LIMIT 1');
    const fallbackSizeId = sizes[0] ? sizes[0].id : null;

    if (fallbackSizeId) {
        console.log(`Using fallback size ID: ${fallbackSizeId}`);
        const [result] = await connection.execute(`UPDATE price SET size_id = ? WHERE size_id IS NULL OR size_id = ''`, [fallbackSizeId]);
        console.log(`Updated ${result.affectedRows} price rows.`);
    } else {
        console.log("No valid sizes found in the database. Cannot apply fallback.");
    }

    await connection.end();
}

fixDb().catch(console.error);
