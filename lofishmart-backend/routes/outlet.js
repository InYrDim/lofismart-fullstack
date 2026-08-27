var express = require('express');
var router = express.Router();

const outletController = require('../controllers/outletController');
const auth = require('../middleware/auth');

/* GET outlet listing. */
router.get('/', function (req, res, next) {
  res.redirect('/outlet/list');
});

router.get('/list', auth(['profile']), outletController.outletList);
router.get('/byid/:id', auth(['profile']), outletController.outletById);
router.post('/create', auth(['profile-edit']), outletController.outletCreate);
router.patch('/update/:id', auth(['profile-edit']), outletController.outletUpdate);
router.delete('/delete/:id', auth(['profile-edit']), outletController.outletDelete);

// Supervisor Assignment
router.get('/supervisors', auth(['profile']), outletController.getSupervisors);
router.post('/assign-supervisor', auth(['profile-edit']), outletController.assignSupervisor);

module.exports = router;
