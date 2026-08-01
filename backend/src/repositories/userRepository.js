const prisma = require('../config/database');

class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { patient: true, psychologist: true },
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { patient: true, psychologist: true },
    });
  }

  async findByResetToken(token) {
    return prisma.user.findFirst({
      where: { resetToken: token, resetExpires: { gt: new Date() }, deletedAt: null },
    });
  }

  async create(data) {
    return prisma.user.create({ data });
  }

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  async findAll({ skip, take, where = {} }) {
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, isActive: true,
          avatar: true, createdAt: true, lastLogin: true,
          patient: { select: { firstName: true, lastName: true } },
          psychologist: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.user.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

module.exports = new UserRepository();
