/**
 * ============================================
 * ST-NEXT: POS Sale → Stock Deduction
 * Backend Tests for transactionController.js
 * ============================================
 *
 * Endpoints:
 *   POST /api/transaction/selling/create   - createTransaction (with stock reduction)
 *   PATCH /api/transaction/selling/update/:id - sellingUpdate (delayed payment stock reduction)
 *
 * Test Cases:
 *   1. POST with is_paid="3" → 201, stock decremented
 *   2. POST with insufficient stock → 500 error "Stok tidak cukup"
 *   3. POST with is_paid="1" → 201, stock NOT decremented (unpaid)
 *   4. PATCH from is_paid="1" to "3" → stock decremented after update
 *   5. POST with is_non_stock="2" product → 201, stock NOT decremented
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../app');
const AppDataSource = require('../config/data-source');

// Entities
const Stock = require('../db/entities/Stock');
const Selling = require('../db/entities/Selling');
const SellingProductDetail = require('../db/entities/SellingProductDetail');
const Product = require('../db/entities/Product');
const Profile = require('../db/entities/Profile');
const Price = require('../db/entities/Price');
const Grade = require('../db/entities/Grade');
const Size = require('../db/entities/Size');

describe('ST-NEXT: POS Sale → Stock Deduction', () => {
  let testProduct;
  let testNonStockProduct;
  let testGrade;
  let testSize;
  let testPrice;
  let testNonStockPrice;
  let testStock;
  let testMarket;
  let validToken;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  }, 30000);

  beforeEach(async () => {
    const sellingRepo = AppDataSource.getRepository(Selling);
    const detailRepo = AppDataSource.getRepository(SellingProductDetail);
    const stockRepo = AppDataSource.getRepository(Stock);
    const priceRepo = AppDataSource.getRepository(Price);
    const productRepo = AppDataSource.getRepository(Product);
    const profileRepo = AppDataSource.getRepository(Profile);
    const gradeRepo = AppDataSource.getRepository(Grade);
    const sizeRepo = AppDataSource.getRepository(Size);

    // Clean up test data in reverse dependency order
    await detailRepo
      .createQueryBuilder()
      .delete()
      .from(SellingProductDetail)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await sellingRepo
      .createQueryBuilder()
      .delete()
      .from(Selling)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await stockRepo
      .createQueryBuilder()
      .delete()
      .from(Stock)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await priceRepo
      .createQueryBuilder()
      .delete()
      .from(Price)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await productRepo
      .createQueryBuilder()
      .delete()
      .from(Product)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await profileRepo
      .createQueryBuilder()
      .delete()
      .from(Profile)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await gradeRepo
      .createQueryBuilder()
      .delete()
      .from(Grade)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await sizeRepo
      .createQueryBuilder()
      .delete()
      .from(Size)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    // Create test grade
    testGrade = gradeRepo.create({
      id: 'TESTGR',
      name: 'Test Grade',
      barcode: 'TG',
    });
    await gradeRepo.save(testGrade);

    // Create test size
    testSize = sizeRepo.create({
      id: 'TESTSZ',
      name: 'Test Size',
      barcode: 'TS',
    });
    await sizeRepo.save(testSize);

    // Create test market
    testMarket = profileRepo.create({
      id: 'TESTMKT',
      name: 'Test Market',
      type: 'OUTLET',
      address: 'Jl. Test No 1',
      city: 'Test City',
      phone_number: '1234567890',
    });
    await profileRepo.save(testMarket);

    // Create test product (stock-tracked)
    testProduct = productRepo.create({
      id: 'TESTP01',
      name: 'Test Product',
      unit: '1', // KG
      is_non_stock: '1', // stock-tracked
      is_show: '1',
      barcode: 'TESTBCODE01',
    });
    await productRepo.save(testProduct);

    // Create test price for product
    testPrice = priceRepo.create({
      id: 'TESTPR01',
      initial: 10000,
      selling: 15000,
      disc: 0,
      product: testProduct,
      grade: testGrade,
      size: testSize,
    });
    await priceRepo.save(testPrice);

    // Create test stock (50 KG available)
    testStock = stockRepo.create({
      id: 'TESTSTK01',
      qty: 50,
      unit: '1',
      product: testProduct,
      market: testMarket,
      batch: 'TEST-BATCH-001',
    });
    await stockRepo.save(testStock);

    // Create test non-stock product
    testNonStockProduct = productRepo.create({
      id: 'TESTP02',
      name: 'Test Non-Stock Product',
      unit: '1',
      is_non_stock: '2', // non-stock (service/pre-order)
      is_show: '1',
      barcode: 'TESTBCODE02',
    });
    await productRepo.save(testNonStockProduct);

    testNonStockPrice = priceRepo.create({
      id: 'TESTPR02',
      initial: 20000,
      selling: 25000,
      disc: 0,
      product: testNonStockProduct,
      grade: testGrade,
      size: testSize,
    });
    await priceRepo.save(testNonStockPrice);

    // Generate auth token with selling-edit permission
    validToken = jwt.sign(
      {
        id: 'TESTUSER01',
        role: 'ADMN',
        role_id: 'ADMN',
        market_id: testMarket.id,
        hasPermit: ['selling-edit'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
      },
      process.env.JWT_SECRET || 'secretKey123',
    );
  }, 30000);

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      const sellingRepo = AppDataSource.getRepository(Selling);
      const detailRepo = AppDataSource.getRepository(SellingProductDetail);
      const stockRepo = AppDataSource.getRepository(Stock);
      const priceRepo = AppDataSource.getRepository(Price);
      const productRepo = AppDataSource.getRepository(Product);
      const profileRepo = AppDataSource.getRepository(Profile);
      const gradeRepo = AppDataSource.getRepository(Grade);
      const sizeRepo = AppDataSource.getRepository(Size);

      await detailRepo
        .createQueryBuilder()
        .delete()
        .from(SellingProductDetail)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await sellingRepo
        .createQueryBuilder()
        .delete()
        .from(Selling)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await stockRepo
        .createQueryBuilder()
        .delete()
        .from(Stock)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await priceRepo
        .createQueryBuilder()
        .delete()
        .from(Price)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await productRepo
        .createQueryBuilder()
        .delete()
        .from(Product)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await profileRepo
        .createQueryBuilder()
        .delete()
        .from(Profile)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await gradeRepo
        .createQueryBuilder()
        .delete()
        .from(Grade)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();
      await sizeRepo
        .createQueryBuilder()
        .delete()
        .from(Size)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();

      await AppDataSource.destroy();
    }
  }, 30000);

  // ============================================================
  // Test Suite: createTransaction (POST /transaction/selling/create)
  // ============================================================
  describe('POST /api/transaction/selling/create - createTransaction', () => {
    it('TC-01: should create sale with is_paid=3 and decrement stock (201)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const sellingRepo = AppDataSource.getRepository(Selling);

      // Verify initial stock is 50
      const initialStock = await stockRepo.findOne({ where: { id: testStock.id } });
      expect(initialStock).not.toBeNull();
      expect(initialStock.qty).toBe(50);

      const items = [
        {
          stock_id: testStock.id,
          price_id: testPrice.id,
          qty: 10,
          total_price: 150000,
          total_weight: 10,
          note: '',
        },
      ];

      const response = await request(app)
        .post('/api/transaction/selling/create')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          market_id: testMarket.id,
          user_id: 'TESTUSER01',
          is_paid: '3', // Instant paid → stock must decrement
          payment_method_id: 'TESTPM',
          total_price: '150000',
          payed_money: '150000',
          change_money: '0',
          total_weight_qty: '10',
          totol_pcs_qty: '0',
          items: JSON.stringify(items),
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Transaction created successfully');
      expect(response.body.data).toHaveProperty('id');

      // Verify selling record
      const selling = await sellingRepo.findOne({ where: { id: response.body.data.id } });
      expect(selling).not.toBeNull();
      expect(selling.is_paid).toBe('3');

      // Verify stock was decremented: 50 - 10 = 40
      const updatedStock = await stockRepo.findOne({ where: { id: testStock.id } });
      expect(updatedStock).not.toBeNull();
      expect(updatedStock.qty).toBe(40);
    }, 30000);

    it('TC-02: should reject sale when stock is insufficient (500)', async () => {
      // Try to sell 100 KG when only 50 KG available
      const items = [
        {
          stock_id: testStock.id,
          price_id: testPrice.id,
          qty: 100,
          total_price: 1500000,
          total_weight: 100,
          note: '',
        },
      ];

      const response = await request(app)
        .post('/api/transaction/selling/create')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          market_id: testMarket.id,
          user_id: 'TESTUSER01',
          is_paid: '3',
          payment_method_id: 'TESTPM',
          total_price: '1500000',
          payed_money: '1500000',
          change_money: '0',
          total_weight_qty: '100',
          totol_pcs_qty: '0',
          items: JSON.stringify(items),
        });

      // Should fail with stock insufficient error and transaction rollback
      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/Stok tidak cukup/);

      // Verify stock is still 50 (transaction rolled back)
      const stockRepo = AppDataSource.getRepository(Stock);
      const unchangedStock = await stockRepo.findOne({ where: { id: testStock.id } });
      expect(unchangedStock.qty).toBe(50);
    }, 30000);

    it('TC-03: should create sale with is_paid=1 and NOT decrement stock (unpaid)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const sellingRepo = AppDataSource.getRepository(Selling);

      const items = [
        {
          stock_id: testStock.id,
          price_id: testPrice.id,
          qty: 10,
          total_price: 150000,
          total_weight: 10,
          note: 'Unpaid test',
        },
      ];

      const response = await request(app)
        .post('/api/transaction/selling/create')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          market_id: testMarket.id,
          user_id: 'TESTUSER01',
          is_paid: '1', // Unpaid/overview → stock should NOT decrement
          payment_method_id: 'TESTPM',
          total_price: '150000',
          payed_money: '0',
          change_money: '0',
          total_weight_qty: '10',
          totol_pcs_qty: '0',
          items: JSON.stringify(items),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.is_paid).toBe('1');

      // Verify stock is still 50 (unchanged)
      const unchangedStock = await stockRepo.findOne({ where: { id: testStock.id } });
      expect(unchangedStock.qty).toBe(50);
    }, 30000);

    it('TC-04: should NOT decrement stock for is_non_stock=2 product (service)', async () => {
      // Non-stock product has no stock record, but the controller
      // should skip stock deduction when product.is_non_stock === "2"
      const stockRepo = AppDataSource.getRepository(Stock);

      const items = [
        {
          price_id: testNonStockPrice.id,
          qty: 1,
          total_price: 25000,
          note: 'Service item - no stock',
        },
      ];

      const response = await request(app)
        .post('/api/transaction/selling/create')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          market_id: testMarket.id,
          user_id: 'TESTUSER01',
          is_paid: '3',
          payment_method_id: 'TESTPM',
          total_price: '25000',
          payed_money: '25000',
          change_money: '0',
          total_weight_qty: '0',
          totol_pcs_qty: '0',
          items: JSON.stringify(items),
        });

      // Service items should succeed without stock check
      expect(response.status).toBe(201);
    }, 30000);

    it('TC-05: should return 400 when items array is empty', async () => {
      const response = await request(app)
        .post('/api/transaction/selling/create')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          market_id: testMarket.id,
          user_id: 'TESTUSER01',
          is_paid: '3',
          payment_method_id: 'TESTPM',
          total_price: '0',
          payed_money: '0',
          change_money: '0',
          total_weight_qty: '0',
          totol_pcs_qty: '0',
          items: JSON.stringify([]),
        });

      expect([400]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    }, 30000);
  });

  // ============================================================
  // Test Suite: sellingUpdate (PATCH /transaction/selling/update/:id)
  // ============================================================
  describe('PATCH /api/transaction/selling/update/:id - delayed payment stock reduction', () => {
    it('TC-06: should decrement stock when updating is_paid from "1" to "3"', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const sellingRepo = AppDataSource.getRepository(Selling);

      // First, create an unpaid transaction
      const items = [
        {
          stock_id: testStock.id,
          price_id: testPrice.id,
          qty: 10,
          total_price: 150000,
          total_weight: 10,
          note: '',
        },
      ];

      const createRes = await request(app)
        .post('/api/transaction/selling/create')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          market_id: testMarket.id,
          user_id: 'TESTUSER01',
          is_paid: '1', // Unpaid
          payment_method_id: 'TESTPM',
          total_price: '150000',
          payed_money: '0',
          change_money: '0',
          total_weight_qty: '10',
          totol_pcs_qty: '0',
          items: JSON.stringify(items),
        });

      expect(createRes.status).toBe(201);
      const sellingId = createRes.body.data.id;

      // Verify stock is still 50
      let stockBeforeUpdate = await stockRepo.findOne({ where: { id: testStock.id } });
      expect(stockBeforeUpdate.qty).toBe(50);

      // Now update to paid
      const updateRes = await request(app)
        .patch(`/api/transaction/selling/update/${sellingId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({ is_paid: '3' });

      expect(updateRes.status).toBe(200);

      // Verify stock was decremented: 50 - 10 = 40
      const stockAfterUpdate = await stockRepo.findOne({ where: { id: testStock.id } });
      expect(stockAfterUpdate.qty).toBe(40);
    }, 30000);
  });
});
