const mysql = require('mysql2/promise');

async function checkDb() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'lofish_market'
    });

    console.log("--- PRODUCT TABLE ---");
    const [productCols] = await connection.execute('SHOW COLUMNS FROM product');
    console.log(productCols.map(c => c.Field));

    console.log("--- PRICE TABLE ---");
    const [priceCols] = await connection.execute('SHOW COLUMNS FROM price');
    console.log(priceCols.map(c => c.Field));

    await connection.end();
}

checkDb().catch(console.error);
