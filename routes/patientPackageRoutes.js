const router = require('express').Router();
const controller = require('../controllers/patientPackageController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);

router.get('/unpaid', controller.getUnpaid);
router.get('/patient/:patientId', controller.listByPatient);
router.post('/assign', authorize('ADMIN', 'RECEPTIONIST'), controller.assign);
router.post('/:id/schedule-sessions', authorize('ADMIN', 'RECEPTIONIST'), controller.scheduleSessions);
router.patch('/:id/status', authorize('ADMIN', 'RECEPTIONIST'), controller.updateStatus);

module.exports = router;
