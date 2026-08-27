var express = require('express');
var router = express.Router();

const productController = require('../controllers/productController');
const inventoryController = require('../controllers/inventoryController');

const auth = require('../middleware/auth');
const getMemoryUploader = require('../middleware/uploadFile'); // Import middleware Multer
const errorHandler = require('../middleware/errorHandler');

const upload = getMemoryUploader();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.redirect('/product/list');
});

// Primary entity (Product) - needs /product/product prefix
router.get('/product/list', auth(['product']), productController.productList);
router.get('/product/byid/:id', auth(['product']), productController.productById);
router.post('/product/create', auth(['product-edit']), upload.single('image'), productController.productCreate);
router.put('/product/update/:id', auth(['product-edit']), upload.single('image'), productController.productUpdate);
router.delete('/product/delete/:id', auth(['product-edit']), productController.productDelete);
router.delete('/product/soft-delete/:id', auth(['product-edit']), productController.productSoftDelete);

// Category routes
router.get('/category/list', auth(['product']), productController.categoryList);
router.post('/category/create', auth(['product-edit']), productController.categoryCreate);
router.put('/category/update/:id', auth(['product-edit']), productController.categoryUpdate);
router.delete('/category/delete/:id', auth(['product-edit']), productController.categoryDelete);

// Grade routes
router.get('/grade/list', auth(['product']), productController.gradeList);
router.post('/grade/create', auth(['product-edit']), productController.gradeCreate);
router.put('/grade/update/:id', auth(['product-edit']), productController.gradeUpdate);
router.delete('/grade/delete/:id', auth(['product-edit']), productController.gradeDelete);

// Size routes
router.get('/size/list', auth(['product']), productController.sizeList);
router.post('/size/create', auth(['product-edit']), productController.sizeCreate);
router.put('/size/update/:id', auth(['product-edit']), productController.sizeUpdate);
router.delete('/size/delete/:id', auth(['product-edit']), productController.sizeDelete);

// Service routes
router.get('/service/list', auth(['product']), productController.serviceList);
router.get('/service/byid/:id', auth(['product']), productController.serviceById);
router.post('/service/create', auth(['product-edit']), upload.single('image'), productController.serviceCreate);
router.put('/service/update/:id', auth(['product-edit']), upload.single('image'), productController.serviceUpdate);
router.delete('/service/delete/:id', auth(['product-edit']), productController.serviceDelete);

// Product Price Mapping
router.get('/price/list', auth(['product']), productController.priceList);
router.get('/price/byid/:id', auth(['product']), productController.priceById);
router.post('/price/create', auth(['product-edit']), productController.priceCreate);
router.put('/price/update/:id', auth(['product-edit']), productController.priceUpdate);
router.delete('/price/delete/:id', auth(['product-edit']), productController.priceDelete);

// Stock routes
router.get('/stock/list', auth(['stock']), productController.stockList);
router.get('/stock/byid/:id', auth(['stock']), productController.stockById);
router.post('/stock/create', auth(['stock-edit']), productController.stockCreate);
router.patch('/stock/update/:id', auth(['stock-edit']), productController.stockUpdate);
router.delete('/stock/delete/:id', auth(['stock-edit']), productController.stockDelete);

// Stock Opname routes
router.get('/stock-opname/list', auth(['stock-opname']), productController.stockOpnameList);
router.get('/stock-opname/byid/:id', auth(['stock-opname']), productController.stockOpnameById);
router.post('/stock-opname/create', auth(['stock-opname-edit']), productController.stockOpnameCreate);
router.put('/stock-opname/update/:id', auth(['stock-opname-edit']), productController.stockOpnameUpdate);
router.delete('/stock-opname/delete/:id', auth(['stock-opname-edit']), productController.stockOpnameDelete);

// Inventory Flow
router.post('/inventory/receive', auth(['stock-edit', 'purchase-edit']), upload.single('proof'), inventoryController.receiveFromSupplier);
router.post('/inventory/receive-bulk', auth(['stock-edit', 'purchase-edit']), upload.single('proof'), inventoryController.receiveBulkFromSupplier);
router.post('/inventory/transfer', auth(['stock-edit']), inventoryController.transferToMarket);
router.get('/inventory/dashboard', auth(['stock']), inventoryController.getInventoryDashboard);
router.get('/inventory/purchase-history', auth(['purchase']), inventoryController.getPurchaseHistory);
router.post('/inventory/reject-request', auth(['reject-edit']), upload.single('image_proof'), inventoryController.requestReject, errorHandler);
router.post('/inventory/reject-approve/:id', auth(['reject-edit']), inventoryController.approveReject);
router.get('/inventory/reject-list', auth(['reject']), inventoryController.getRejectList);
router.post('/inventory/stock-opname/approve/:id', auth(['stock-opname-edit']), inventoryController.approveStockOpname);

// Stock Transfer Order (3-status flow)
router.post('/inventory/transfer-order/create', auth(['stock-transfer-edit']), inventoryController.createTransferOrder);
router.post('/inventory/transfer-order/bulk-create', auth(['stock-transfer-edit']), inventoryController.bulkCreateTransferOrder);
router.get('/inventory/transfer-orders', auth(['stock-transfer']), inventoryController.getTransferOrders);
router.patch('/inventory/transfer-order/:id/status', auth(['stock-transfer-edit']), inventoryController.updateTransferStatus);
router.post('/inventory/transfer-order/:id/cancel', auth(['stock-transfer-edit']), inventoryController.cancelTransfer);
router.post('/inventory/transfer-order/:id/proof', auth(['stock-transfer-edit']), upload.single('proof'), inventoryController.uploadTransferProof);
router.get('/inventory/transfer-order/:id/report', auth(['stock-transfer']), inventoryController.getTransferReport);

module.exports = router;