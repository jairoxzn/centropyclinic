const { validationResult } = require('express-validator');
const { ValidationError } = require('../helpers/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new ValidationError(formatted));
  }
  next();
};

module.exports = validate;
