const prisma = require('../config/database');

class PsychologistRepository {
  async findAll({ skip, take, where = {} }) {
    const [data, total] = await Promise.all([
      prisma.psychologist.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, isActive: true } },
          specialties: { include: { specialty: true } },
          office: true,
          _count: { select: { appointments: true } },
        },
      }),
      prisma.psychologist.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.psychologist.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { email: true, isActive: true, avatar: true } },
        specialties: { include: { specialty: true } },
        office: true,
        schedules: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
        scheduleBlocks: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: 'asc' } },
      },
    });
  }

  async findByUserId(userId) {
    return prisma.psychologist.findUnique({
      where: { userId, deletedAt: null },
      include: {
        specialties: { include: { specialty: true } },
        office: true,
        schedules: true,
      },
    });
  }

  async findByLicenseNumber(licenseNumber) {
    return prisma.psychologist.findUnique({ where: { licenseNumber } });
  }

  async create(data) {
    return prisma.psychologist.create({
      data,
      include: {
        user: { select: { email: true } },
        specialties: { include: { specialty: true } },
      },
    });
  }

  async update(id, data) {
    return prisma.psychologist.update({
      where: { id },
      data,
      include: {
        specialties: { include: { specialty: true } },
        office: true,
      },
    });
  }

  async softDelete(id) {
    return prisma.psychologist.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async setSpecialties(psychologistId, specialtyIds) {
    await prisma.psychologistSpecialty.deleteMany({ where: { psychologistId } });
    if (specialtyIds.length > 0) {
      await prisma.psychologistSpecialty.createMany({
        data: specialtyIds.map((specialtyId) => ({ psychologistId, specialtyId })),
      });
    }
  }

  async findBySpecialty(specialtyId) {
    return prisma.psychologist.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        specialties: { some: { specialtyId } },
      },
      include: {
        specialties: { include: { specialty: true } },
        schedules: { where: { isActive: true } },
        office: true,
      },
    });
  }

  async getTopByAppointments(limit = 5) {
    return prisma.psychologist.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { appointments: { where: { status: 'ATTENDED' } } },
        },
      },
      orderBy: { appointments: { _count: 'desc' } },
      take: limit,
    });
  }
}

module.exports = new PsychologistRepository();
