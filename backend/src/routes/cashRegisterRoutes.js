const router = require('express').Router();
const cashRegisterController = require('../controllers/cashRegisterController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);
router.use(authorize('ADMIN', 'RECEPTIONIST'));

router.get('/', cashRegisterController.getAll);
router.get('/current', cashRegisterController.getCurrent);
router.get('/:id', cashRegisterController.getById);
router.get('/:id/movements', cashRegisterController.getMovements);
router.post('/open', cashRegisterController.open);
router.post('/movements', cashRegisterController.addMovement);
router.patch('/:id/close', cashRegisterController.close);

module.exports = router;
