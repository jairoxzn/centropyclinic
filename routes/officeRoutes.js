const router = require('express').Router();
const officeController = require('../controllers/officeController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);
router.get('/', officeController.getAll);
router.get('/:id', officeController.getById);
router.post('/', authorize('ADMIN'), officeController.create);
router.put('/:id', authorize('ADMIN'), officeController.update);
router.delete('/:id', authorize('ADMIN'), officeController.delete);

module.exports = router;
