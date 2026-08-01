const { ForbiddenError } = require('../helpers/errors');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('No autenticado'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('No tienes permisos para esta acción'));
    }
    next();
  };
};

module.exports = authorize;
