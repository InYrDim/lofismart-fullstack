var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');

const auth = require('../middleware/auth');
const getMemoryUploader = require('../middleware/uploadFile'); // Import middleware Multer
const errorHandler = require('../middleware/errorHandler');

const upload = getMemoryUploader();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// // Terapkan Middleware (Auth + Izin) ke semua route di bawah ini
// // SEMUA route yang didefinisikan setelah baris ini akan melalui auth(['POS'])
// router.use('/pos', auth(['POS']), (req, res, next) => {
//     // Middleware ini hanya menjalankan fungsi auth(['POS']).
//     // Jika auth berhasil, ia akan memanggil next() dan menuju ke route selanjutnya.
//     next(); 
// });

router.get('/supplier/list', auth(['supplier']), userController.supplierList);
router.get('/supplier/byid/:id', auth(['supplier']), userController.supplierById);
router.post('/supplier/create', auth(['supplier-edit']), userController.supplierCreate);
router.patch('/supplier/update/:id', auth(['supplier-edit']), userController.supplierUpdate);
router.delete('/supplier/delete/:id', auth(['supplier-edit']), userController.supplierDelete);
router.delete('/supplier/soft-delete/:id',auth(['supplier-edit']), userController.supplierSoftDelete);

router.get('/user/list', auth(['user']), userController.userList);
router.get('/user/byid/:id', auth(['user']), userController.userById);
router.post('/user/create', auth(['user-edit']), upload.single('image'), userController.userCreate);
router.patch('/user/update/:id', auth(['user-edit']), upload.single('image'), userController.userUpdate);
router.delete('/user/delete/:id', auth(['user-edit']), userController.userDelete);
router.delete('/user/soft-delete/:id',auth(['user-edit']), userController.userSoftDelete);

router.get('/member/list', auth(['member']), userController.memberList);
router.get('/member/byid/:id', auth(['member']), userController.memberById);
router.post('/member/create', auth(['member-edit']), userController.memberCreate);
router.patch('/member/update/:id', auth(['member-edit']), userController.memberUpdate);
router.delete('/member/delete/:id', auth(['member-edit']), userController.memberDelete);
router.delete('/member/soft-delete/:id',auth(['member-edit']), userController.memberSoftDelete);

router.get('/role/list', auth(['role']), userController.roleList);
router.get('/role/byid/:id', auth(['role']), userController.roleById);
router.post('/role/create', auth(['role-edit']), userController.roleCreate);
router.patch('/role/update/:id', auth(['role-edit']), userController.roleUpdate);
router.delete('/role/delete/:id', auth(['role-edit']), userController.roleDelete);

router.get('/permission/list', auth(['permission']), userController.permissionList);
router.get('/permission/byid/:id', auth(['permission']), userController.permissionById);
router.post('/permission/create', auth(['permission-edit']), userController.permissionCreate);
router.patch('/permission/update/:id', auth(['permission-edit']), userController.permissionUpdate);
router.delete('/permission/delete/:id', auth(['permission-edit']), userController.permissionDelete);

router.get('/has-permit/list', auth(['has-permit']), userController.hasPermitList);
router.get('/has-permit/byid/:id', auth(['has-permit']), userController.hasPermitById);
router.post('/has-permit/edit', auth(['has-permit-edit']), userController.hasPermitEdit);

router.get('/session/list', auth(['session']), userController.sessionShow);


module.exports = router;