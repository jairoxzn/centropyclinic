const { body } = require('express-validator');

const createPatientValidator = [
  body('dni').notEmpty().withMessage('El DNI es requerido').isLength({ min: 8, max: 15 }).withMessage('DNI inválido'),
  body('firstName').notEmpty().withMessage('El nombre es requerido').trim(),
  body('lastName').notEmpty().withMessage('El apellido es requerido').trim(),
  body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
  body('birthDate').isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Género inválido'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('maritalStatus').optional().isIn(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'COHABITING']),
  body('occupation').optional().trim(),
  body('emergencyContact').optional().trim(),
  body('emergencyPhone').optional().trim(),
  body('observations').optional().trim(),
];

const updatePatientValidator = [
  body('firstName').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
  body('lastName').optional().notEmpty().withMessage('El apellido no puede estar vacío').trim(),
  body('email').optional().isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
  body('birthDate').optional().isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
];

module.exports = { createPatientValidator, updatePatientValidator };
