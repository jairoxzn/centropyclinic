const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

class StaffController {
  async list(req, res, next) {
    try {
      const staff = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'] },
          deletedAt: null
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { email, password, role } = req.body;
      
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role
        },
        select: { id: true, email: true, role: true, isActive: true }
      });

      res.status(201).json({ success: true, data: user, message: 'Cuenta creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: { id: true, email: true, role: true, isActive: true }
      });

      res.json({ success: true, data: user, message: `Cuenta ${isActive ? 'activada' : 'desactivada'}` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StaffController();
