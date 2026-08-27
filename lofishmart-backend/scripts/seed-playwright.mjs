import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "lofish_market",
    port: parseInt(process.env.DB_PORT || "3306")
  });

  // Insert test Profile (Gudang & Market)
  await connection.execute(`
    INSERT IGNORE INTO profile (id, name, address, phone_number)
    VALUES 
    ('TEST_WH', 'Gudang Pusat Test', 'Alamat Test', '08123456789'),
    ('TEST_MKT', 'Outlet Test', 'Alamat Outlet', '08123456789')
  `);

  const hashedAdmin = bcrypt.hashSync("admin123", 10);
  const hashedSpvr = bcrypt.hashSync("supervisor123", 10);

  // Use IGNORE so it doesn't crash if they exist
  await connection.execute(`
    INSERT IGNORE INTO user (id, name, username, email, password, role_id, market_id)
    VALUES 
    ('TEST_ADMN', 'Test Admin', 'admin1', 'admin1@test.com', ?, 'ADMN', NULL),
    ('TEST_SPVR', 'Test Supervisor', 'supervisor1', 'spvr1@test.com', ?, 'SPVR', 'TEST_MKT')
    ON DUPLICATE KEY UPDATE market_id = VALUES(market_id)
  `, [hashedAdmin, hashedSpvr]);

  // Insert test Supplier
  await connection.execute(`
    INSERT IGNORE INTO supplier (id, corporation, name, address, phone_number)
    VALUES ('TEST_SUP', 'PT Test', 'PT Supplier Test', 'Alamat Supplier', '08123456789')
  `);

  // Insert test Category
  await connection.execute(`
    INSERT IGNORE INTO category (id, name, barcode)
    VALUES ('TCAT', 'Test Kategori', 'TT')
  `);

  // Insert test Product so Add Product modal works reliably
  await connection.execute(`
    INSERT IGNORE INTO product (id, name, category_id, is_show, is_non_stock)
    VALUES ('TST_PROD', 'Ikan Bandeng Test', 'TCAT', '1', '1')
  `);

  // Insert test Stock for the market so the supervisor can reject some
  await connection.execute(`
    INSERT IGNORE INTO stock (id, qty, market_id, warehouse_id, product_id)
    VALUES ('TST_STK', 50, 'TEST_MKT', NULL, 'TST_PROD')
  `);

  console.log("Playwright users, warehouse, supplier, and product seeded!");
  await connection.end();
}

seed().catch(console.error);
