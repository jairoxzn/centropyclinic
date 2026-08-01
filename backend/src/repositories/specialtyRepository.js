const prisma = require('../config/database');

class SpecialtyRepository {
  async findAll() {
    return prisma.specialty.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { psychologists: true, appointments: true } } },
    });
  }

  async findById(id) {
    return prisma.specialty.findFirst({
      where: { id, deletedAt: null },
      include: {
        psychologists: {
          include: {
            psychologist: { select: { id: true, firstName: true, lastName: true, photo: true } },
          },
        },
      },
    });
  }

  async findByName(name) {
    return prisma.specialty.findUnique({ where: { name } });
  }

  async create(data) {
    return prisma.specialty.create({ data });
  }

  async update(id, data) {
    return prisma.specialty.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.specialty.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getMostRequested(limit = 5) {
    return prisma.specialty.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { appointments: true } } },
      orderBy: { appointments: { _count: 'desc' } },
      take: limit,
    });
  }
}

module.exports = new SpecialtyRepository();
