# ST-02 Test Implementation Summary

## Files Created

### 1. `tests/inventoryController.test.js`
Comprehensive Jest/Supertest integration tests for the inventory controller.

**Features:**
- Full test coverage for `receiveFromSupplier` endpoint
- Full test coverage for `receiveBulkFromSupplier` endpoint
- Database setup/teardown with proper cleanup
- Tests all 4 required test cases plus edge cases
- Uses actual TypeORM database connections

**Test Structure:**
```
describe('ST-02: Supplier → Gudang Stock Receiving', () => {
  // Test Suite 1: receiveFromSupplier
  describe('POST /api/inventory/receive', () => {
    it('TC-01: Valid gudang_id → 201, stock incremented')
    it('TC-02: Invalid gudang_id → 400/404')
    it('TC-03: No proof image → 201 (nullable)')
    it('TC-04: SPVR role → 403')
    it('TC-05: With rejected_qty → creates Reject record')
    it('TC-06: Unit mismatch → 400')
    it('TC-07: Product not found → error')
  })

  // Test Suite 2: receiveBulkFromSupplier
  describe('POST /api/inventory/receive-bulk', () => {
    it('TC-08: Valid bulk → 201')
    it('TC-09: Invalid gudang_id → 400/404')
    it('TC-10: No proof image → 201')
    it('TC-11: SPVR role → 403')
    it('TC-12: Bulk with rejects → creates Reject records')
    it('TC-13: Empty items array → 400')
    it('TC-14: Invalid JSON → 400')
  })

  // Edge Cases
  describe('Edge Cases', () => {
    it('Missing unit field → defaults to 1')
    it('Unit=2 (Pieces) → handled correctly')
  })
})
```

### 2. `tests/inventoryController.spec.js`
Test specification document in BDD format describing expected behavior.

**Purpose:**
- Documents test cases in Given-When-Then format
- Serves as executable specification
- Can be used with BDD test runners

### 3. `tests/README.md`
Complete documentation for the test suite.

**Contents:**
- Endpoint specifications
- Request/response formats
- Test cases summary table
- Running instructions
- cURL examples
- Database considerations
- Error handling matrix
- Environment configuration

### 4. `jest.config.js`
Jest configuration for the project.

### 5. `package.json` (updated)
Added test scripts and devDependencies:
- `"test": "jest"`
- `"test:watch": "jest --watch"`
- `"test:coverage": "jest --coverage"`
- `"test:single": "jest tests/inventoryController.test.js"`
- Added `jest` and `supertest` to devDependencies

---

## Test Cases Implemented

### ✅ TC-01: Valid gudang_id → 201, stock incremented
- Creates purchase record
- Creates/updates stock record
- Returns 201 status
- Verifies qty increment in correct warehouse

### ✅ TC-02: Invalid gudang_id → 400/404 error
- Invalid warehouse ID
- Expects 400 or 404 response
- Verifies error message

### ✅ TC-03: POST without proof image → 201 (image_proof nullable)
- No file upload
- Purchase created with `image_proof = NULL`
- Stock still incremented
- Returns 201

### ✅ TC-04: SPVR role (unauth) → 403
- SPVR lacks `stock-edit` and `purchase-edit` permissions
- Auth middleware rejects request
- Returns 403 Forbidden

### ✅ TC-05: With rejected_qty → creates Reject record
- `rejected_qty > 0`
- Creates Reject record linked to Stock
- Status = '3' (other)
- Includes reject description

### ✅ TC-06: Unit mismatch → 400
- Product.unit != request.unit
- Returns 400 with descriptive error
- Validates against product configuration

### ✅ TC-07: Product not found → error
- Invalid product_id
- Returns error (400/500)
- "Product not found" message

### ✅ TC-08: Valid bulk → 201
- Multiple items in array
- Creates multiple purchases
- Creates/updates multiple stocks
- Returns 201

### ✅ TC-09: Invalid gudang (bulk) → 400/404
- Invalid warehouse in bulk request
- Transaction rollback (no partial data)
- Returns error

### ✅ TC-10: Bulk no proof → 201
- Bulk request without file
- All purchases have `image_proof = NULL`
- Returns 201

### ✅ TC-11: SPVR bulk (unauth) → 403
- SPVR role on bulk endpoint
- Returns 403 Forbidden

### ✅ TC-12: Bulk with rejects → creates Reject records
- Multiple items with rejected quantities
- Creates Reject record for each
- Links to respective Stock records

### ✅ TC-13: Empty items array → 400
- `items: []` or missing
- Returns 400
- "Items array is required" message

### ✅ TC-14: Invalid JSON → 400
- Malformed JSON in items field
- Returns 400
- "Invalid items format" message

---

## Running the Tests

### Quick Start
```bash
cd lofishmart-backend
npm install  # install jest and supertest
npm test     # run all tests
```

### Run Specific Test
```bash
npx jest tests/inventoryController.test.js
npm run test:single
```

### Watch Mode
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

---

## Key Implementation Details

### Database Cleanup
- Uses `TEST` prefix for test data IDs
- Cleans up before/after each test
- Prevents test pollution

```javascript
await purchaseRepo
  .createQueryBuilder()
  .delete()
  .from(Purchase)
  .where("id LIKE :id", { id: 'TEST%'})
  .execute();
```

### Authentication Mocking
- Tests use user_id in request body as fallback
- SPVR tests generate JWT tokens with SPVR role
- Auth middleware checks permissions

### File Upload Testing
- Tests without files verify `image_proof` is NULL
- Controller handles missing `req.file` gracefully
- File path construction tested separately

### Transaction Handling
- Bulk operations use TypeORM transactions
- Tests verify rollback on errors
- QueryRunner manages transaction lifecycle

---

## Expected Test Results

All 14 test cases should pass:

```
PASS  tests/inventoryController.test.js
  ST-02: Supplier → Gudang Stock Receiving
    POST /api/inventory/receive - receiveFromSupplier
      ✓ TC-01: Valid gudang_id → 201, stock incremented (XX ms)
      ✓ TC-02: Invalid gudang_id → 400/404 (XX ms)
      ✓ TC-03: No proof image → 201 (XX ms)
      ✓ TC-04: SPVR role (unauth) → 403 (XX ms)
      ✓ TC-05: With rejected_qty → creates Reject record (XX ms)
      ✓ TC-06: Unit mismatch → 400 (XX ms)
      ✓ TC-07: Product not found → error (XX ms)
    POST /api/inventory/receive-bulk - receiveBulkFromSupplier
      ✓ TC-08: Valid bulk → 201 (XX ms)
      ✓ TC-09: Invalid gudang (bulk) → 400/404 (XX ms)
      ✓ TC-10: Bulk no proof → 201 (XX ms)
      ✓ TC-11: SPVR bulk (unauth) → 403 (XX ms)
      ✓ TC-12: Bulk with rejects → creates Reject records (XX ms)
      ✓ TC-13: Empty items array → 400 (XX ms)
      ✓ TC-14: Invalid JSON → 400 (XX ms)
```

---

## Notes

1. **Database Connection**: Tests require a running MySQL/MariaDB instance
2. **Test Isolation**: Each test cleans up its own data using TEST prefix
3. **Timeouts**: Set to 30s to accommodate database operations
4. **Authentication**: Tests simulate both authenticated and unauthenticated requests
5. **File Uploads**: Tests verify behavior with and without proof images
6. **Transactions**: Bulk operations tested with proper rollback behavior

---

## Maintenance

### Adding New Tests
1. Add test case to `describe` block
2. Follow existing pattern (setup → request → assertions → cleanup)
3. Use `TEST` prefix for all test data IDs
4. Verify database state after operations

### Updating Tests
1. Modify test expectations in `it()` blocks
2. Update assertions as needed
3. Keep cleanup logic consistent

### Debugging
```bash
# Run with verbose output
npx jest --verbose

# Run single test
npx jest -t "TC-01"

# See console logs
npx jest --verbose --no-coverage
```
