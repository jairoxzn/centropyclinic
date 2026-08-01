const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);
router.use(authorize('ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'));

router.get('/stats', dashboardController.getStats);
router.get('/chart/monthly', dashboardController.getMonthlyChart);
router.get('/chart/weekly', dashboardController.getWeeklyChart);

module.exports = router;
