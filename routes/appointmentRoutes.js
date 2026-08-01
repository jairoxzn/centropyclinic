const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const audit = require('../middlewares/audit');
const { createAppointmentValidator } = require('../validators/appointmentValidator');

router.use(authenticate);

router.get('/', appointmentController.getAll);
router.get('/calendar', appointmentController.getCalendarEvents);
router.get('/slots/:psychologistId', appointmentController.getAvailableSlots);
router.get('/:id', appointmentController.getById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), createAppointmentValidator, validate, audit('CREATE', 'appointments'), appointmentController.create);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), audit('UPDATE', 'appointments'), appointmentController.update);
router.patch('/:id/cancel', authorize('ADMIN', 'RECEPTIONIST', 'PATIENT'), audit('CANCEL', 'appointments'), appointmentController.cancel);
router.patch('/:id/reschedule', authorize('ADMIN', 'RECEPTIONIST'), audit('RESCHEDULE', 'appointments'), appointmentController.reschedule);
router.delete('/:id', authorize('ADMIN'), audit('DELETE', 'appointments'), appointmentController.delete);

module.exports = router;
