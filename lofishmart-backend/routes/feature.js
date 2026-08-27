var express = require('express');
var router = express.Router();

const featureController = require('../controllers/featureController');

const auth = require('../middleware/auth');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.redirect('/feature/profile/list');
});

router.get('/profile/list', auth(['profile']), featureController.profileList);
router.get('/profile/byid/:id', auth(['profile']), featureController.profileById);
router.post('/profile/create', auth(['profile-edit']), featureController.profileCreate);
router.patch('/profile/update/:id', auth(['profile-edit']), featureController.profileUpdate);
router.delete('/profile/delete/:id', auth(['profile-edit']), featureController.profileDelete);
router.delete('/profile/soft-delete/:id',auth(['profile-edit']), featureController.profileSoftDelete);

router.get('/cat-app/list', auth(['cat-app']), featureController.catAppList);
router.get('/cat-app/byid/:id', auth(['cat-app']), featureController.catAppById);
router.post('/cat-app/create', auth(['cat-app-edit']), featureController.catAppCreate);
router.patch('/cat-app/update/:id', auth(['cat-app-edit']), featureController.catAppUpdate);
router.delete('/cat-app/delete/:id', auth(['cat-app-edit']), featureController.catAppDelete);

router.get('/config/list', auth(['config']), featureController.configList);
router.get('/config/byid/:id', auth(['config']), featureController.configById);
router.post('/config/create', auth(['config-edit']), featureController.configCreate);
router.patch('/config/update/:id', auth(['config-edit']), featureController.configUpdate);
router.delete('/config/delete/:id', auth(['config-edit']), featureController.configDelete);

router.get('/data-change/list', auth(['config']), featureController.dataChangeList);
router.get('/data-receive/list', auth(['config']), featureController.dataRecieveList);

module.exports = router;