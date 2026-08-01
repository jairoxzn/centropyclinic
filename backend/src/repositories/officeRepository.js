const prisma = require('../config/database');

class OfficeRepository {
  async findAll() {
    return prisma.office.findMany({
      where: { deletedAt: null },
      orderBy: { number: 'asc' },
      include: {
        psychologists: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async findById(id) {
    return prisma.office.findFirst({
      where: { id, deletedAt: null },
      include: {
        psychologists: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true, photo: true },
        },
      },
    });
  }

  async create(data) {
    return prisma.office.create({ data });
  }

  async update(id, data) {
    return prisma.office.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.office.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

module.exports = new OfficeRepository();
