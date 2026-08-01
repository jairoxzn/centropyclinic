const router = require('express').Router();
const psychologistController = require('../controllers/psychologistController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const audit = require('../middlewares/audit');

router.use(authenticate);

router.get('/', psychologistController.getAll);
router.get('/specialty/:specialtyId', psychologistController.getBySpecialty);
router.get('/:id', psychologistController.getById);
router.post('/', authorize('ADMIN'), audit('CREATE', 'psychologists'), psychologistController.create);
router.put('/:id', authorize('ADMIN'), audit('UPDATE', 'psychologists'), psychologistController.update);
router.delete('/:id', authorize('ADMIN'), audit('DELETE', 'psychologists'), psychologistController.delete);

module.exports = router;
