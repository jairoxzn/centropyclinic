const { body } = require('express-validator');

const createAppointmentValidator = [
  body('patientId').isUUID().withMessage('ID de paciente inválido'),
  body('psychologistId').isUUID().withMessage('ID de psicólogo inválido'),
  body('specialtyId').isUUID().withMessage('ID de especialidad inválido'),
  body('date').isISO8601().withMessage('Fecha inválida'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Hora de inicio inválida (HH:MM)'),
  body('endTime').matches(/^\d{2}:\d{2}$/).withMessage('Hora de fin inválida (HH:MM)'),
  body('cost').optional().isDecimal().withMessage('Costo inválido'),
];

const createPaymentValidator = [
  body('appointmentId').optional().isUUID().withMessage('ID de cita inválido'),
  body('patientPackageId').optional().isUUID().withMessage('ID de paquete inválido'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Monto inválido'),
  body('method').isIn(['CASH', 'YAPE', 'PLIN', 'TRANSFER', 'CARD', 'ONLINE']).withMessage('Método de pago inválido'),
  body('operationNumber').optional().trim(),
  body('observations').optional().trim(),
];

module.exports = { createAppointmentValidator, createPaymentValidator };
