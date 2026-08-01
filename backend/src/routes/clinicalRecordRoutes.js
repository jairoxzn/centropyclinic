const router = require('express').Router();
const clinicalRecordController = require('../controllers/clinicalRecordController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);
router.use(authorize('ADMIN', 'PSYCHOLOGIST'));

router.get('/patient/:patientId', clinicalRecordController.getByPatient);
router.get('/:id', clinicalRecordController.getById);
router.put('/:id', clinicalRecordController.update);
router.post('/:id/sessions', clinicalRecordController.addSession);
router.put('/sessions/:sessionId', clinicalRecordController.updateSession);
router.post('/:id/files', clinicalRecordController.addFile);
router.delete('/files/:fileId', clinicalRecordController.deleteFile);

module.exports = router;
