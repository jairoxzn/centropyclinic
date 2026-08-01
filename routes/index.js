const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/patients', require('./patientRoutes'));
router.use('/psychologists', require('./psychologistRoutes'));
router.use('/specialties', require('./specialtyRoutes'));
router.use('/offices', require('./officeRoutes'));
router.use('/schedules', require('./scheduleRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/clinical-records', require('./clinicalRecordRoutes'));
router.use('/cash-register', require('./cashRegisterRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/staff', require('./staffRoutes'));
router.use('/package-catalogs', require('./packageCatalogRoutes'));
router.use('/patient-packages', require('./patientPackageRoutes'));

module.exports = router;

