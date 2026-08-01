const { verifyAccessToken } = require('../helpers/jwt');
const { UnauthorizedError } = require('../helpers/errors');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true, deletedAt: true },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedError('Usuario inactivo o eliminado');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token inválido o expirado'));
    }
    next(error);
  }
};

module.exports = authenticate;
