const prisma = require('../config/database');

class AppointmentRepository {
  async findAll({ skip, take, where = {} }) {
    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, dni: true, phone: true } },
          psychologist: { select: { id: true, firstName: true, lastName: true } },
          specialty: { select: { id: true, name: true } },
          payments: true,
        },
      }),
      prisma.appointment.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.appointment.findFirst({
      where: { id, deletedAt: null },
      include: {
        patient: {
          include: { user: { select: { email: true } } },
        },
        psychologist: {
          select: { id: true, firstName: true, lastName: true, licenseNumber: true },
        },
        specialty: true,
        payments: { orderBy: { createdAt: 'asc' } },
        clinicalSession: true,
      },
    });
  }

  async create(data) {
    return prisma.appointment.create({
      data,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        psychologist: { select: { firstName: true, lastName: true } },
        specialty: { select: { name: true } },
      },
    });
  }

  async update(id, data) {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        psychologist: { select: { firstName: true, lastName: true } },
        specialty: { select: { name: true } },
        payments: true,
      },
    });
  }

  async softDelete(id) {
    return prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });
  }

  async findByDateRange(startDate, endDate, psychologistId = null) {
    const where = {
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };
    if (psychologistId) where.psychologistId = psychologistId;

    return prisma.appointment.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, dni: true } },
        psychologist: { select: { id: true, firstName: true, lastName: true } },
        specialty: { select: { name: true } },
        payments: true,
      },
    });
  }

  async findConflict(psychologistId, date, startTime, endTime, excludeId = null) {
    const where = {
      psychologistId,
      date,
      deletedAt: null,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    };
    if (excludeId) where.id = { not: excludeId };
    return prisma.appointment.findFirst({ where });
  }

  async countByStatus(status, dateFilter = {}) {
    return prisma.appointment.count({
      where: { status, deletedAt: null, ...dateFilter },
    });
  }

  async countToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return prisma.appointment.count({
      where: { date: { gte: today, lt: tomorrow }, deletedAt: null },
    });
  }

  async findTodayByPsychologist(psychologistId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return prisma.appointment.findMany({
      where: {
        psychologistId,
        date: { gte: today, lt: tomorrow },
        deletedAt: null,
      },
      orderBy: { startTime: 'asc' },
      include: {
        patient: { select: { firstName: true, lastName: true, phone: true } },
        specialty: { select: { name: true } },
        payments: true,
      },
    });
  }
}

module.exports = new AppointmentRepository();
