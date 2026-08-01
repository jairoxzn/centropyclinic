const router = require('express').Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const audit = require('../middlewares/audit');
const { createPatientValidator, updatePatientValidator } = require('../validators/patientValidator');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'), patientController.getAll);
router.get('/search', authorize('ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'), patientController.search);
router.get('/:id', authorize('ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST', 'PATIENT'), patientController.getById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), createPatientValidator, validate, audit('CREATE', 'patients'), patientController.create);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), updatePatientValidator, validate, audit('UPDATE', 'patients'), patientController.update);
router.delete('/:id', authorize('ADMIN'), audit('DELETE', 'patients'), patientController.delete);

module.exports = router;
