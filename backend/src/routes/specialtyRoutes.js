const router = require('express').Router();
const specialtyController = require('../controllers/specialtyController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);

router.get('/', specialtyController.getAll);
router.get('/:id', specialtyController.getById);
router.post('/', authorize('ADMIN'), specialtyController.create);
router.put('/:id', authorize('ADMIN'), specialtyController.update);
router.delete('/:id', authorize('ADMIN'), specialtyController.delete);

module.exports = router;
