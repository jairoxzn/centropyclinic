const router = require('express').Router();
const scheduleController = require('../controllers/scheduleController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);

router.get('/psychologist/:psychologistId', scheduleController.getByPsychologist);
router.put('/psychologist/:psychologistId', authorize('ADMIN'), scheduleController.upsert);
router.delete('/:id', authorize('ADMIN'), scheduleController.deleteSchedule);

// Blocks
router.get('/blocks/:psychologistId', scheduleController.getBlocks);
router.post('/blocks', authorize('ADMIN'), scheduleController.createBlock);
router.delete('/blocks/:id', authorize('ADMIN'), scheduleController.deleteBlock);

// Holidays
router.get('/holidays', scheduleController.getHolidays);
router.post('/holidays', authorize('ADMIN'), scheduleController.createHoliday);
router.delete('/holidays/:id', authorize('ADMIN'), scheduleController.deleteHoliday);

module.exports = router;
