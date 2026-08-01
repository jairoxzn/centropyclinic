const router = require('express').Router();
const controller = require('../controllers/packageCatalogController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);

router.get('/', controller.list);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), controller.create);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), controller.update);

module.exports = router;
