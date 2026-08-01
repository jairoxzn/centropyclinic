const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { loginValidator, forgotPasswordValidator, resetPasswordValidator, changePasswordValidator } = require('../validators/authValidator');

router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, authController.resetPassword);
router.put('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
