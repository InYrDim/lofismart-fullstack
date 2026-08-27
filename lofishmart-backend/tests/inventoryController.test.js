const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Mock the app and routes
const app = require('../app');
const AppDataSource = require('../config/data-source');

// Mock entities
const Stock = require('../db/entities/Stock');
const Purchase = require('../db/entities/Purchase');
const Reject = require('../db/entities/Reject');
const Product = require('../db/entities/Product');
const Profile = require('../db/entities/Profile');

// Mock middleware
const getMemoryUploader = require('../middleware/uploadFile');
const upload = getMemoryUploader();

/**
 * ============================================
 * ST-02: Supplier → Gudang Stock Receiving
 * Backend Tests for inventoryController.js
 * ============================================
 *
 * Endpoints:
 *   POST /api/inventory/receive     - receiveFromSupplier
 *   POST /api/inventory/receive-bulk - receiveBulkFromSupplier
 *
 * Test Cases:
 *   1. POST with valid gudang_id → 200/201, stock incremented in correct gudang
 *   2. POST with invalid gudang_id → 400/404 error
 *   3. POST without proof image → behavior? (should still succeed, image_proof is nullable)
 *   4. Unauthorized role (SPVR) → 403
 */

describe('ST-02: Supplier → Gudang Stock Receiving', () => {
  let testProduct;
  let testWarehouse;
  let testSupplier;
  let testUser;
  let validToken;
  let spvrToken;

  beforeAll(async () => {
    // Ensure database is connected
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  }, 30000);

  beforeEach(async () => {
    // Clean up any existing test data
    const purchaseRepo = AppDataSource.getRepository(Purchase);
    const stockRepo = AppDataSource.getRepository(Stock);
    const rejectRepo = AppDataSource.getRepository(Reject);
    const productRepo = AppDataSource.getRepository(Product);
    const profileRepo = AppDataSource.getRepository(Profile);

    // Clean up test data (using soft delete aware cleanup)
    await purchaseRepo
      .createQueryBuilder()
      .delete()
      .from(Purchase)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await stockRepo
      .createQueryBuilder()
      .delete()
      .from(Stock)
      .where("id LIKE :id", { id: 'TEST%'})
      .execute();

    await rejectRepo
      .createQueryBuilder()
      .delete()
      .from(Reject)
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

    // Create test data
    testWarehouse = profileRepo.create({
      id: 'TESTWH01',
      name: 'Test Gudang',
      type: 'GUDANG',
      address: 'Jl. Test No 1',
      city: 'Test City',
      phone_number: '1234567890'
    });
    await profileRepo.save(testWarehouse);

    testProduct = productRepo.create({
      id: 'TESTP01',
      name: 'Test Product',
      unit: '1', // KG
      is_non_stock: '1',
      is_show: '1',
      barcode: 'TESTBARCODE001',
      category: { id: 'TESTCAT' }
    });
    await productRepo.save(testProduct);

    // Note: User and Supplier creation would normally be done via fixtures
    // For these tests, we'll mock the auth and rely on existing DB data
    // The tests will use request body fields to pass IDs
  }, 30000);

  afterAll(async () => {
    // Clean up test data
    if (AppDataSource.isInitialized) {
      const purchaseRepo = AppDataSource.getRepository(Purchase);
      const stockRepo = AppDataSource.getRepository(Stock);
      const rejectRepo = AppDataSource.getRepository(Reject);
      const productRepo = AppDataSource.getRepository(Product);
      const profileRepo = AppDataSource.getRepository(Profile);

      await purchaseRepo
        .createQueryBuilder()
        .delete()
        .from(Purchase)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();

      await stockRepo
        .createQueryBuilder()
        .delete()
        .from(Stock)
        .where("id LIKE :id", { id: 'TEST%'})
        .execute();

      await rejectRepo
        .createQueryBuilder()
        .delete()
        .from(Reject)
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

      await AppDataSource.destroy();
    }
  }, 30000);

  /**
   * Helper: Generate valid JWT token for testing
   * In production tests, you would create actual users and generate real tokens
   * For unit testing purposes, we mock the auth or use existing DB users
   */
  const generateTestToken = (userId, roleId, marketId = null) => {
    const jwt = require('jsonwebtoken');
    const payload = {
      id: userId,
      role: roleId,
      role_id: roleId,
      market_id: marketId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };
    return jwt.sign(payload, process.env.JWT_SECRET || 'secretKey123');
  };

  /**
   * Helper: Make authenticated request
   */
  const makeAuthRequest = (method, url, data = {}, token = null, file = null) => {
    let req = request(app)[method](url)
      .set('Accept', 'application/json');
    
    if (token) {
      req = req.set('Authorization', `Bearer ${token}`);
    }
    
    if (file) {
      // For file upload tests - requires proper multipart handling
      // Using .attach() from supertest
      return req.attach('proof', file).field(data);
    }
    
    return req.send(data).set('Content-Type', 'application/x-www-form-urlencoded');
  };

  // ============================================================
  // Test Suite: receiveFromSupplier (single item)
  // ============================================================
  describe('POST /api/inventory/receive - receiveFromSupplier', () => {
    
    it('should receive stock from supplier with valid gudang_id and increment stock (201)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const purchaseRepo = AppDataSource.getRepository(Purchase);

      // Verify initial stock is 0
      const initialStock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        },
        relations: ['warehouse', 'product']
      });
      expect(initialStock).toBeNull();

      // Prepare request body
      const requestBody = {
        supplier_id: 'TESTSUP01',
        warehouse_id: testWarehouse.id,
        product_id: testProduct.id,
        purchased_qty: '100',
        accepted_qty: '100',
        rejected_qty: '0',
        reject_reason: '',
        price: '50000',
        batch: 'BATCH001',
        unit: '1',
        user_id: 'TESTUSER01'
      };

      // Make request (without auth token - will use body user_id as fallback)
      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Stock successfully received and validated from supplier');
      expect(response.body.data).toHaveProperty('purchaseId');
      expect(response.body.data).toHaveProperty('acceptedStockId');

      // Verify purchase was created
      const purchase = await purchaseRepo.findOne({
        where: { id: response.body.data.purchaseId },
        relations: ['product', 'warehouse', 'supplier']
      });
      expect(purchase).not.toBeNull();
      expect(purchase.qty).toBe(100);
      expect(purchase.price).toBe(50000);
      expect(purchase.warehouse.id).toBe(testWarehouse.id);
      expect(purchase.product.id).toBe(testProduct.id);

      // Verify stock was created and incremented
      const updatedStock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        },
        relations: ['warehouse', 'product']
      });
      expect(updatedStock).not.toBeNull();
      expect(updatedStock.qty).toBe(100);
      expect(updatedStock.unit).toBe('1');
    }, 30000);

    it('should return error with invalid gudang_id (404/400)', async () => {
      const requestBody = {
        supplier_id: 'TESTSUP02',
        warehouse_id: 'INVALID_WH_ID',
        product_id: testProduct.id,
        purchased_qty: '100',
        accepted_qty: '100',
        rejected_qty: '0',
        price: '50000',
        unit: '1',
        user_id: 'TESTUSER01'
      };

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody);

      // Should fail - either 400 or 404 depending on validation
      expect([400, 404, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    }, 30000);

    it('should accept request without proof image (image_proof is nullable)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const purchaseRepo = AppDataSource.getRepository(Purchase);

      // Count initial purchases/stock for this warehouse+product
      const existingStock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        }
      });
      const initialQty = existingStock ? existingStock.qty : 0;

      const requestBody = {
        supplier_id: 'TESTSUP03',
        warehouse_id: testWarehouse.id,
        product_id: testProduct.id,
        purchased_qty: '50',
        accepted_qty: '50',
        rejected_qty: '0',
        price: '60000',
        batch: 'BATCH002',
        unit: '1',
        user_id: 'TESTUSER02'
      };

      // No file upload - request without proof image
      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Stock successfully received and validated from supplier');

      // Verify purchase was created WITHOUT image_proof
      const purchase = await purchaseRepo.findOne({
        where: { id: response.body.data.purchaseId },
        relations: ['product', 'warehouse']
      });
      expect(purchase).not.toBeNull();
      expect(purchase.image_proof).toBeNull(); // Should be null since no file uploaded
      expect(purchase.qty).toBe(50);

      // Verify stock was incremented
      const updatedStock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        }
      });
      expect(updatedStock).not.toBeNull();
      expect(updatedStock.qty).toBe(initialQty + 50);
    }, 30000);

    it('should reject request from unauthorized role SPVR (403)', async () => {
      // Generate a token for SPVR role (which only has 'SPVR' permission, not 'stock-edit' or 'purchase-edit')
      const spvrToken = generateTestToken('SPVR_USER', 'SPVR');

      const requestBody = {
        supplier_id: 'TESTSUP04',
        warehouse_id: testWarehouse.id,
        product_id: testProduct.id,
        purchased_qty: '100',
        accepted_qty: '100',
        rejected_qty: '0',
        price: '50000',
        unit: '1',
        user_id: 'TESTUSER03'
      };

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Authorization', `Bearer ${spvrToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody);

      // SPVR does not have 'stock-edit' or 'purchase-edit' permissions, should be 403
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/permission|Permission/i);
    }, 30000);

    it('should create reject record when rejected_qty > 0', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const purchaseRepo = AppDataSource.getRepository(Purchase);
      const rejectRepo = AppDataSource.getRepository(Reject);

      const requestBody = {
        supplier_id: 'TESTSUP05',
        warehouse_id: testWarehouse.id,
        product_id: testProduct.id,
        purchased_qty: '100',
        accepted_qty: '90',
        rejected_qty: '10',
        reject_reason: 'Damaged goods',
        price: '50000',
        unit: '1',
        user_id: 'TESTUSER04'
      };

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);

      // Verify reject record was created
      const rejects = await rejectRepo.find({
        where: { stock: { id: response.body.data.acceptedStockId } },
        relations: ['stock']
      });
      expect(rejects.length).toBeGreaterThan(0);
      const rejectRecord = rejects.find(r => r.qty === 10);
      expect(rejectRecord).not.toBeUndefined();
      expect(rejectRecord.desc).toContain('Damaged goods');
      expect(rejectRecord.status).toBe('3');
    }, 30000);
  });

  // ============================================================
  // Test Suite: receiveBulkFromSupplier (multiple items)
  // ============================================================
  describe('POST /api/inventory/receive-bulk - receiveBulkFromSupplier', () => {
    
    it('should receive bulk stock from supplier with valid gudang_id and increment stock for all items (201)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const purchaseRepo = AppDataSource.getRepository(Purchase);

      // Create second test product
      const productRepo = AppDataSource.getRepository(Product);
      const testProduct2 = productRepo.create({
        id: 'TESTP02',
        name: 'Test Product 2',
        unit: '1',
        is_non_stock: '1',
        is_show: '1',
        barcode: 'TESTBARCODE002',
        category: { id: 'TESTCAT' }
      });
      await productRepo.save(testProduct2);

      const items = [
        {
          product_id: testProduct.id,
          purchased_qty: '100',
          accepted_qty: '100',
          rejected_qty: '0',
          reject_reason: '',
          price: '50000',
          batch: 'BULK001',
          unit: '1'
        },
        {
          product_id: testProduct2.id,
          purchased_qty: '50',
          accepted_qty: '48',
          rejected_qty: '2',
          reject_reason: 'Minor damage',
          price: '30000',
          batch: 'BULK001',
          unit: '1'
        }
      ];

      const requestBody = {
        supplier_id: 'TESTSUP06',
        warehouse_id: testWarehouse.id,
        items: JSON.stringify(items),
        user_id: 'TESTUSER05'
      };

      const response = await request(app)
        .post('/api/inventory/receive-bulk')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Bulk stock successfully received and validated from supplier');
      expect(response.body.data.purchaseIds.length).toBe(2);
      expect(response.body.data.acceptedStockIds.length).toBe(2);

      // Verify both purchases were created
      for (const purchaseId of response.body.data.purchaseIds) {
        const purchase = await purchaseRepo.findOne({
          where: { id: purchaseId },
          relations: ['product', 'warehouse']
        });
        expect(purchase).not.toBeNull();
        expect(purchase.warehouse.id).toBe(testWarehouse.id);
      }

      // Verify stock was incremented for both products
      const stock1 = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        }
      });
      expect(stock1).not.toBeNull();
      expect(stock1.qty).toBe(100);

      const stock2 = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct2.id },
          unit: '1'
        }
      });
      expect(stock2).not.toBeNull();
      expect(stock2.qty).toBe(48);

      // Verify reject record for second item
      const rejectRepo = AppDataSource.getRepository(Reject);
      const rejects = await rejectRepo.find({
        where: {
          stock: { id: stock2.id },
          qty: 2
        }
      });
      expect(rejects.length).toBeGreaterThan(0);

      // Cleanup test product 2
      await productRepo
        .createQueryBuilder()
        .delete()
        .from(Product)
        .where("id = :id", { id: testProduct2.id })
        .execute();
    }, 30000);

    it('should return error with invalid gudang_id in bulk (400/404)', async () => {
      const items = [
        {
          product_id: testProduct.id,
          purchased_qty: '100',
          accepted_qty: '100',
          rejected_qty: '0',
          price: '50000',
          unit: '1'
        }
      ];

      const requestBody = {
        supplier_id: 'TESTSUP07',
        warehouse_id: 'INVALID_WAREHOUSE',
        items: JSON.stringify(items),
        user_id: 'TESTUSER06'
      };

      const response = await request(app)
        .post('/api/inventory/receive-bulk')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody);

      // Should fail - invalid warehouse
      expect([400, 404, 500]).toContain(response.status);
    }, 30000);

    it('should accept bulk request without proof image (nullable image_proof)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const purchaseRepo = AppDataSource.getRepository(Purchase);

      const items = [
        {
          product_id: testProduct.id,
          purchased_qty: '75',
          accepted_qty: '75',
          rejected_qty: '0',
          price: '55000',
          batch: 'BULK002',
          unit: '1'
        }
      ];

      const requestBody = {
        supplier_id: 'TESTSUP08',
        warehouse_id: testWarehouse.id,
        items: JSON.stringify(items),
        user_id: 'TESTUSER07'
      };

      // No file upload
      const response = await request(app)
        .post('/api/inventory/receive-bulk')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);

      // Verify purchase was created without image_proof
      const purchase = await purchaseRepo.findOne({
        where: { id: response.body.data.purchaseIds[0] },
        relations: ['product', 'warehouse']
      });
      expect(purchase).not.toBeNull();
      expect(purchase.image_proof).toBeNull();
      expect(purchase.qty).toBe(75);

      // Verify stock was incremented
      const updatedStock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        }
      });
      expect(updatedStock.qty).toBe(175); // Previous 100 + 75
    }, 30000);

    it('should reject bulk request from unauthorized SPVR role (403)', async () => {
      const spvrToken = generateTestToken('SPVR_USER_2', 'SPVR');

      const items = [
        {
          product_id: testProduct.id,
          purchased_qty: '100',
          accepted_qty: '100',
          rejected_qty: '0',
          price: '50000',
          unit: '1'
        }
      ];

      const requestBody = {
        supplier_id: 'TESTSUP09',
        warehouse_id: testWarehouse.id,
        items: JSON.stringify(items),
        user_id: 'TESTUSER08'
      };

      const response = await request(app)
        .post('/api/inventory/receive-bulk')
        .set('Authorization', `Bearer ${spvrToken}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody);

      // SPVR does not have 'stock-edit' or 'purchase-edit' permissions
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/permission|Permission/i);
    }, 30000);

    it('should create reject records for bulk items with rejected quantities', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);
      const rejectRepo = AppDataSource.getRepository(Reject);

      // Add more quantity to existing stock first
      const stock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
        }
      });
      const currentQty = stock ? stock.qty : 0;

      const items = [
        {
          product_id: testProduct.id,
          purchased_qty: '200',
          accepted_qty: '180',
          rejected_qty: '20',
          reject_reason: 'Quality check failed',
          price: '50000',
          unit: '1'
        }
      ];

      const requestBody = {
        supplier_id: 'TESTSUP10',
        warehouse_id: testWarehouse.id,
        items: JSON.stringify(items),
        user_id: 'TESTUSER09'
      };

      const response = await request(app)
        .post('/api/inventory/receive-bulk')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);

      // Verify reject record was created
      const updatedStock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
        }
      });
      
      const rejects = await rejectRepo.find({
        where: { stock: { id: updatedStock.id } },
        relations: ['stock']
      });
      
      const newReject = rejects.find(r => r.qty === 20);
      expect(newReject).not.toBeUndefined();
      expect(newReject.desc).toContain('Quality check failed');
    }, 30000);

    it('should return 400 when items array is empty', async () => {
      const requestBody = {
        supplier_id: 'TESTSUP11',
        warehouse_id: testWarehouse.id,
        items: JSON.stringify([]),
        user_id: 'TESTUSER10'
      };

      const response = await request(app)
        .post('/api/inventory/receive-bulk')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    }, 30000);
  });

  // ============================================================
  // Additional Edge Case Tests
  // ============================================================
  describe('Edge Cases', () => {
    
    it('should handle missing unit field (defaults to 1)', async () => {
      const stockRepo = AppDataSource.getRepository(Stock);

      const requestBody = {
        supplier_id: 'TESTSUP12',
        warehouse_id: testWarehouse.id,
        product_id: testProduct.id,
        purchased_qty: '30',
        accepted_qty: '30',
        rejected_qty: '0',
        price: '40000',
        user_id: 'TESTUSER11'
        // unit field omitted - should default to '1'
      };

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);

      const stock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: testProduct.id },
          unit: '1'
        }
      });
      expect(stock).not.toBeNull();
    }, 30000);

    it('should handle unit=2 (Pieces/Ekor) correctly', async () => {
      const productRepo = AppDataSource.getRepository(Product);
      const stockRepo = AppDataSource.getRepository(Stock);

      // Create product with unit=2 (Pieces)
      const pieceProduct = productRepo.create({
        id: 'TESTP03',
        name: 'Test Piece Product',
        unit: '2',
        is_non_stock: '1',
        is_show: '1',
        barcode: 'TESTBARCODE003',
        category: { id: 'TESTCAT' }
      });
      await productRepo.save(pieceProduct);

      const requestBody = {
        supplier_id: 'TESTSUP13',
        warehouse_id: testWarehouse.id,
        product_id: pieceProduct.id,
        purchased_qty: '50',
        accepted_qty: '50',
        rejected_qty: '0',
        price: '10000',
        unit: '2',  // Pieces
        user_id: 'TESTUSER12'
      };

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(requestBody)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);

      const stock = await stockRepo.findOne({
        where: { 
          warehouse: { id: testWarehouse.id },
          product: { id: pieceProduct.id },
          unit: '2'
        }
      });
      expect(stock).not.toBeNull();
      expect(stock.qty).toBe(50);
      expect(stock.unit).toBe('2');

      // Cleanup
      await productRepo
        .createQueryBuilder()
        .delete()
        .from(Product)
        .where("id = :id", { id: pieceProduct.id })
        .execute();
    }, 30000);
  });
});
