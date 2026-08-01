const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
];

module.exports = {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
