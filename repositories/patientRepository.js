const prisma = require('../config/database');

class PatientRepository {
  async findAll({ skip, take, where = {} }) {
    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, isActive: true } },
          _count: { select: { appointments: true, documents: true } },
        },
      }),
      prisma.patient.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.patient.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { email: true, isActive: true, avatar: true } },
        appointments: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            psychologist: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
            payments: true,
          },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        clinicalRecord: true,
      },
    });
  }

  async findByDni(dni) {
    return prisma.patient.findUnique({ where: { dni } });
  }

  async findByUserId(userId) {
    return prisma.patient.findUnique({
      where: { userId, deletedAt: null },
      include: {
        user: { select: { email: true } },
        clinicalRecord: true,
      },
    });
  }

  async create(data) {
    return prisma.patient.create({
      data,
      include: { user: { select: { email: true } } },
    });
  }

  async update(id, data) {
    return prisma.patient.update({
      where: { id },
      data,
      include: { user: { select: { email: true } } },
    });
  }

  async softDelete(id) {
    return prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where = {}) {
    return prisma.patient.count({ where: { ...where, deletedAt: null } });
  }

  async countNew(since) {
    return prisma.patient.count({
      where: { createdAt: { gte: since }, deletedAt: null },
    });
  }

  async search(query) {
    return prisma.patient.findMany({
      where: {
        deletedAt: null,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query } },
        ],
      },
      take: 20,
      include: { user: { select: { email: true } } },
    });
  }
}

module.exports = new PatientRepository();
