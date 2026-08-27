# ST-02 Test Suite: Supplier → Gudang Stock Receiving

## Overview
This test suite covers the backend endpoints for receiving stock from suppliers in the Gudang (warehouse) system.

## Endpoints Tested

### 1. `POST /api/inventory/receive`
**Controller:** `inventoryController.receiveFromSupplier`  
**Route:** `routes/product.js:73`  
**Authentication:** `auth(['stock-edit', 'purchase-edit'])` + `upload.single('proof')`  

**Purpose:** Receive stock from supplier for a single product.

**Request Body (application/x-www-form-urlencoded):**
```json
{
  "supplier_id": "string",
  "warehouse_id": "string (gudang ID)",
  "product_id": "string",
  "purchased_qty": "number (string)",
  "accepted_qty": "number (string)",
  "rejected_qty": "number (string)",
  "reject_reason": "string (optional)",
  "price": "number (string)",
  "batch": "string (optional)",
  "unit": "'1' or '2' (optional, defaults to '1')",
  "user_id": "string (fallback if no JWT)"
}
```

**Optional File Upload:**
- Field name: `proof`
- Type: image file (PNG, JPG, etc.)
- Stored in: `upload/purchase/` directory

**Response (201):**
```json
{
  "message": "Stock successfully received and validated from supplier",
  "data": {
    "purchaseId": "string",
    "acceptedStockId": "string"
  }
}
```

---

### 2. `POST /api/inventory/receive-bulk`
**Controller:** `inventoryController.receiveBulkFromSupplier`  
**Route:** `routes/product.js:74`  
**Authentication:** `auth(['stock-edit', 'purchase-edit'])` + `upload.single('proof')`  

**Purpose:** Receive stock from supplier for multiple products in a single transaction.

**Request Body (application/x-www-form-urlencoded):**
```json
{
  "supplier_id": "string",
  "warehouse_id": "string (gudang ID)",
  "items": "JSON string array of items",
  "user_id": "string (fallback if no JWT)"
}
```

**Items Array (stringified JSON):**
```json
[
  {
    "product_id": "string",
    "purchased_qty": "number (string)",
    "accepted_qty": "number (string)",
    "rejected_qty": "number (string)",
    "reject_reason": "string (optional)",
    "price": "number (string)",
    "batch": "string (optional)",
    "unit": "'1' or '2' (optional, defaults to '1')"
  }
]
```

**Optional File Upload:**
- Field name: `proof`
- Same file is used for all items in the bulk transaction

**Response (201):**
```json
{
  "message": "Bulk stock successfully received and validated from supplier",
  "data": {
    "purchaseIds": ["string", "string"],
    "acceptedStockIds": ["string", "string"]
  }
}
```

---

## Test Cases Summary

| TC ID | Test Case | Expected Status | Description |
|-------|-----------|-----------------|-------------|
| TC-01 | Valid gudang_id | 201 | Stock incremented in correct gudang |
| TC-02 | Invalid gudang_id | 400/404 | Error on invalid warehouse |
| TC-03 | No proof image | 201 | Succeeds (image_proof nullable) |
| TC-04 | SPVR role (unauth) | 403 | Permission denied |
| TC-05 | With rejected_qty | 201 | Creates Reject record |
| TC-06 | Unit mismatch | 400 | Product unit mismatch error |
| TC-07 | Product not found | 400/500 | Product validation fails |
| TC-08 | Valid bulk | 201 | All items created |
| TC-09 | Invalid gudang (bulk) | 400/404 | Transaction rollback |
| TC-10 | Bulk no proof | 201 | Succeeds without image |
| TC-11 | SPVR bulk (unauth) | 403 | Permission denied |
| TC-12 | Bulk with rejects | 201 | Creates Reject records |
| TC-13 | Empty items array | 400 | Validation error |
| TC-14 | Invalid JSON items | 400 | Format error |

---

## Test Files

- **inventoryController.test.js** - Full Jest/Supertest integration tests
- **inventoryController.spec.js** - Test specification document

---

## Running Tests

### Prerequisites
1. Database must be running (MySQL/MariaDB)
2. Environment variables configured in `.env`
3. Test database should be separate from production

### Install Dependencies
```bash
cd lofishmart-backend
npm install --save-dev jest supertest
```

### Configure Jest (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true
};
```

### Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npx jest tests/inventoryController.test.js

# Run with coverage
npx jest --coverage
```

### Manual Test with cURL

**Single Item:**
```bash
curl -X POST http://localhost:3000/api/inventory/receive \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "supplier_id=SUP001" \
  -d "warehouse_id=WH001" \
  -d "product_id=PROD001" \
  -d "purchased_qty=100" \
  -d "accepted_qty=100" \
  -d "rejected_qty=0" \
  -d "price=50000" \
  -d "unit=1" \
  -d "user_id=USER001"
```

**Bulk (with file):**
```bash
curl -X POST http://localhost:3000/api/inventory/receive-bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "proof=@/path/to/receipt.jpg" \
  -F "supplier_id=SUP001" \
  -F "warehouse_id=WH001" \
  -F 'items=[{"product_id":"PROD001","purchased_qty":"100","accepted_qty":"100","rejected_qty":"0","price":"50000","unit":"1"}]' \
  -F "user_id=USER001"
```

---

## Database Considerations

### Test Data Cleanup
Tests use IDs prefixed with `TEST` for easy cleanup:
```sql
DELETE FROM purchase WHERE id LIKE 'TEST%';
DELETE FROM stock WHERE id LIKE 'TEST%';
DELETE FROM reject WHERE id LIKE 'TEST%';
DELETE FROM product WHERE id LIKE 'TEST%';
DELETE FROM profile WHERE id LIKE 'TEST%';
```

### Transaction Rollback
Each test runs in a transaction that is rolled back after completion to maintain test isolation.

---

## Key Implementation Details

### 1. Authentication
- Routes use `auth(['stock-edit', 'purchase-edit'])` middleware
- SPVR role does NOT have these permissions → 403
- Token is validated via JWT and session database

### 2. File Upload
- Uses `multer` with memory storage
- Files saved to `upload/purchase/` directory
- Filename format: `purchase-{purchaseId}{ext}`
- `image_proof` field in Purchase table stores relative path

### 3. Stock Management
- Stock is separated by `(warehouse, product, unit)` tuple
- Existing stock is updated (qty incremented)
- New stock record created if none exists

### 4. Rejected Items
- When `rejected_qty > 0`, a Reject record is created
- Linked to the Stock record via `stock_id`
- Status = '3' (other), approval_status = 'APPROVED'

### 5. Bulk Processing
- All items processed in a single database transaction
- Same proof image used for all items
- Partial failure triggers full rollback

### 6. Unit Validation
- Product.unit must match request unit
- Unit '1' = KG, Unit '2' = Pieces/Ekor
- Default: '1' if not provided

---

## Error Handling

| Error Condition | HTTP Status | Message |
|----------------|-------------|----------|
| Missing token | 401 | Token not found |
| Invalid token | 401 | Token invalid or expired |
| No permission | 403 | Do not have permission |
| Invalid warehouse | 404 | Warehouse not found |
| Invalid product | 400 | Product not found |
| Unit mismatch | 400 | Satuan ukur tidak cocok |
| Empty items | 400 | Items array is required |
| Invalid JSON | 400 | Invalid items format |
| Server error | 500 | Internal Server Error |

---

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=lofishmart
DB_SYNC=true
JWT_SECRET=secretKey123
```

---

## References

- Controller: `controllers/inventoryController.js`
- Routes: `routes/product.js` (lines 73-74)
- Entities: `db/entities/Stock.js`, `Purchase.js`, `Reject.js`, `Product.js`
- Middleware: `middleware/auth.js`, `middleware/uploadFile.js`
