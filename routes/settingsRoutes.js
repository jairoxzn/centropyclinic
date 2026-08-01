const router = require('express').Router();
const settingsController = require('../controllers/settingsController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', settingsController.get);
router.put('/', authenticate, authorize('ADMIN'), settingsController.update);

module.exports = router;
