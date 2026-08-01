const router = require('express').Router();
const staffController = require('../controllers/staffController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);
router.use(authorize('ADMIN')); // Only ADMIN can manage staff accounts

router.get('/', staffController.list);
router.post('/register', staffController.create);
router.patch('/:id/status', staffController.toggleStatus);

module.exports = router;
