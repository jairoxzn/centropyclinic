const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const audit = require('../middlewares/audit');
const { createPaymentValidator } = require('../validators/appointmentValidator');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'RECEPTIONIST'), paymentController.getAll);
router.get('/appointment/:appointmentId', paymentController.getByAppointment);
router.get('/:id', paymentController.getById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), createPaymentValidator, validate, audit('CREATE', 'payments'), paymentController.create);
router.put('/:id', authorize('ADMIN'), audit('UPDATE', 'payments'), paymentController.update);
router.delete('/:id', authorize('ADMIN'), audit('VOID', 'payments'), paymentController.void);

module.exports = router;
