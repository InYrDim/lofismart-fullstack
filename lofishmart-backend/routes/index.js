var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');
const featureController = require('../controllers/featureController');
const productController = require('../controllers/productController');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const getMemoryUploader = require('../middleware/uploadFile');
const upload = getMemoryUploader();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// authController
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth(), authController.getMe);

// userController
router.get('/user-list', auth(['user']), userController.userList);
router.post('/user-create', auth(['user-edit']), upload.single('image'), userController.userCreate);
// router.put('/user-update/:id', userController.userUpdate); // update entire data (replace)
router.patch('/user-update/:id', auth(['user-edit']), upload.single('image'), userController.userUpdate); // update sebagian
router.get('/user-delete/:id', auth(['user-edit']), userController.userDelete);
router.get('/user-soft-delete/:id', auth(['user-edit']), userController.userSoftDelete);

router.get('/member-list', userController.memberList);
router.post('/member-create', userController.memberCreate);
router.patch('/member-update/:id', userController.memberUpdate);
router.get('/member-delete/:id', userController.memberDelete);
router.get('/member-soft-delete/:id', userController.memberSoftDelete);

router.get('/session-list', userController.sessionList);
router.post('/session-create', userController.sessionCreate);
router.patch('/session-update/:id', userController.sessionUpdate);
router.get('/session-delete/:id', userController.sessionDelete);

router.get('/role-list', userController.roleList);
router.post('/role-create', userController.roleCreate);
router.patch('/role-update/:id', userController.roleUpdate);
router.get('/role-delete/:id', userController.roleDelete);

router.get('/permission-list', userController.permissionList);
router.post('/permission-create', userController.permissionCreate);
router.patch('/permission-update/:id', userController.permissionUpdate);
router.get('/permission-delete/:id', userController.permissionDelete);

router.get('/supplier-list', userController.supplierList);
router.post('/supplier-create', userController.supplierCreate);
router.patch('/supplier-update/:id', userController.supplierUpdate);
router.get('/supplier-delete/:id', userController.supplierDelete);
router.get('/supplier-soft-delete/:id', userController.supplierSoftDelete);

router.get('/haspermit-list', userController.hasPermitList);
router.post('/has-permit-create', userController.hasPermitCreate);
router.patch('/has-permit-update/:id', userController.hasPermitUpdate);
router.get('/has-pertmit-delete/:id', userController.hasPermitDelete);

// featureCotroller
router.get('/profile-list', featureController.profileList);
router.post('/profile-create', featureController.profileCreate);
router.patch('/profile-update/:id', featureController.profileUpdate);
router.get('/profile-delete/:id', featureController.profileDelete);
router.get('/profile-soft-delete/:id', featureController.profileSoftDelete);

router.get('/cat-app-list', featureController.catAppList);
router.post('/cat-app-create', featureController.catAppCreate);
router.patch('/cat-app-update/:id', featureController.catAppUpdate);
router.get('/cat-app-delete/:id', featureController.catAppDelete);

router.get('/config-list', featureController.configList);
router.post('/config-create', featureController.configCreate);
router.patch('/config-update/:id', featureController.configUpdate);
router.get('/config-delete/:id', featureController.configDelete);

router.get('/data-change-list', featureController.dataChangeList);
router.post('/data-change-create', featureController.dataChangeCreate);
router.patch('/data-change-update/:id', featureController.dataChangeUpdate);
router.get('/data-change-delete/:id', featureController.dataChangeDelete);

router.get('/data-receive-list', featureController.dataRecieveList);
router.post('/data-receive-create', featureController.dataRecieveCreate);
router.patch('/data-receive-update/:id', featureController.dataRecieveUpdate);
router.get('/data-receive-delete/:id', featureController.dataChangeDelete);

router.get('/export-list', featureController.exportList);
router.post('/export-create', featureController.exportCreate);
router.patch('/export-update/:id', featureController.exportUpdate);
router.get('/export-delete/:id', featureController.exportDelete);

router.get('/import-list', featureController.importList);
router.post('/import-create', featureController.importCreate);
router.patch('/import-update/:id', featureController.importUpdate);
router.get('import-delete/:id', featureController.importDelete);

router.get('/failed-job-list', featureController.failedJobList);
router.post('/failed-job-create', featureController.failedJobCreate);
router.patch('/failed-job-update/:id', featureController.failedJobUpdate);
router.get('/failed-job-delete/:id', featureController.failedJobDelete);

router.get('/notification-list', featureController.notificationList);
router.post('/notification-create', featureController.notificationCreate);
router.patch('/notification-update/:id', featureController.notificationUpdate);
router.get('/notification-delete/:id', featureController.notificationDelete);

// productController
router.get('/stock-opname-list', productController.stockOpnameList);
router.post('/stock-opname-create', productController.stockOpnameCreate);
router.patch('/stock-opname-update/:id', productController.stockOpnameUpdate);
router.get('/stock-opname-delete/:id', productController.stockOpnameDelete);

router.get('/stock-opname-detail-list', productController.stockOpnameDetailList);
router.post('/stock-opname-detail-create', upload.single('attachment'), productController.stockOpnameDetailCreate);
router.patch('/stock-opname-detail-update/:id', upload.single('attachment'), productController.stockOpnameDetailUpdate);
router.get('/stock-opname-detail-delete/:id', productController.stockOpnameDetailDelete);

router.get('/price-list', productController.priceList);
router.post('/price-create', productController.priceCreate);
router.patch('/price-update/:id', productController.priceUpdate);
router.get('/price-delete/:id', productController.priceDelete);

router.get('/product-list', productController.productList);
router.post('/product-create', upload.single('image'), productController.productCreate);
router.patch('/product-update/:id', upload.single('image'), productController.productUpdate);
router.get('/product-delete/:id', productController.productDelete);
router.get('/product-soft-delete/:id', productController.productSoftDelete);

router.get('/service-list', productController.serviceList);
router.post('/service-create', upload.single('image'), productController.serviceCreate);
router.patch('/service-update/:id', upload.single('image'), productController.serviceUpdate);
router.get('/service-delete/:id', productController.serviceDelete);
router.get('/service-soft-delete/:id', productController.serviceSoftDelete);

router.get('/stock-list', productController.stockList);
router.post('/stock-create', productController.stockCreate);
router.patch('/stock-update/:id', productController.stockUpdate);
router.get('/stock-delete/:id', productController.stockDelete);

router.get('/reject-list', productController.rejectList);
router.post('/reject-create', productController.rejectCreate);
router.patch('/reject-update/:id', productController.rejectUpdate);
router.get('/reject-delete/:id', productController.rejectDelete);

router.get('/grade-list', productController.gradeList);
router.post('/grade-create', productController.gradeCreate);
router.patch('/grade-update/:id', productController.gradeUpdate);
router.get('/grade-delete/:id', productController.gradeDelete);

router.get('/size-list', productController.sizeList);
router.post('/size-create', productController.sizeCreate);
router.patch('/size-update/:id', productController.sizeUpdate);
router.get('/size-delete/:id', productController.sizeDelete);

router.get('/category-list', productController.categoryList);
router.post('/category-create', productController.categoryCreate);
router.patch('/category-update/:id', productController.categoryUpdate);
router.get('/category-delete/:id', productController.productDelete);


// transactionController
router.get('/selling-list', transactionController.sellingList);
router.post('/selling-create', transactionController.sellingCreate);
router.patch('/selling-update/:id', transactionController.sellingUpdate);
router.get('/selling-delete/:id', transactionController.sellingDelete);
router.get('/selling-soft-delete/:id', transactionController.sellingSoftDelete);

router.get('/selling-product-detail-list', transactionController.sellingProductDetailList);
router.post('/selling-product-detail-create', transactionController.sellingProductDetailCreate);
router.patch('/selling-product-detail-update/:id', transactionController.sellingProductDetailUpdate);
router.get('/selling-product-delete/:id', transactionController.sellingProductDetailDelete);

router.get('/selling-service-detail-list', transactionController.sellingProductDetailList);
router.post('/selling-service-detail-create', transactionController.sellingProductDetailCreate);
router.patch('/selling-service-detail-update/:id', transactionController.sellingProductDetailUpdate);
router.get('/selling-service-delete/:id', transactionController.sellingProductDetailDelete);

router.get('/cash-drawer-list', transactionController.cashDrawerList);
router.post('/cash-drawer-create', transactionController.cashDrawerCreate);
router.patch('/cash-drawer-update/:id', transactionController.cashDrawerUpdate);
router.get('/cash-drawer-delete/:id', transactionController.cashDrawerDelete);

router.get('/payment-method-list', transactionController.paymentMethodList);
router.post('/payment-method-create', transactionController.paymentMethodCreate);
router.patch('/payment-method-update/:id', transactionController.paymentMethodUpdate);
router.get('/payment-method-delete/:id', transactionController.paymentMethodDelete);

router.get('/weight-scale-list', transactionController.weightScaleList);
router.post('/weight-scale-create', transactionController.weightScaleCreate);
router.patch('/weight-scale-update/:id', transactionController.weightScaleUpdate);
router.get('/weight-scale-delete/:id', transactionController.weightScaleDelete);

router.get('/voucher-list', transactionController.voucherList);
router.post('/voucher-create', transactionController.voucherCreate);
router.patch('/voucher-updata/:id', transactionController.voucherUpdate);
router.get('/voucher-delete/:id', transactionController.voucherDelete);
router.get('/voucher-soft-delete/:id', transactionController.voucherSoftDelete);

router.get('/purchase-list', transactionController.purchaseList);
router.post('/purchase-create', transactionController.purchaseCreate);
router.patch('/purchase-update/:id', transactionController.purchaseUpdate);
router.get('/purchase-delete/:id', transactionController.purchaseDelete);

router.get('/chart-item-list', transactionController.chartItemList);
router.post('/chart-item-create', transactionController.chartItemCreate);
router.patch('/chart-item-update/:id', transactionController.chartItemUpdate);
router.get('/chart-item-delete/:id', transactionController.chartItemDelete);


module.exports = router;
