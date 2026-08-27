var express = require('express');
var router = express.Router();

const warehouseController = require('../controllers/warehouseController');

const auth = require('../middleware/auth');

/* GET warehouse listing. */
router.get('/', function (req, res, next) {
  res.redirect('/warehouse/list');
});

router.get('/list', auth(['warehouse']), warehouseController.warehouseList);
router.get('/byid/:id', auth(['warehouse']), warehouseController.warehouseById);
router.post('/create', auth(['warehouse-edit']), warehouseController.warehouseCreate);
router.patch('/update/:id', auth(['warehouse-edit']), warehouseController.warehouseUpdate);
router.delete('/delete/:id', auth(['warehouse-delete']), warehouseController.warehouseDelete);

module.exports = router;