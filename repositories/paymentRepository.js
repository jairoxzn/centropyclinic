const prisma = require('../config/database');

class PaymentRepository {
  async findAll({ skip, take, where = {} }) {
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            include: {
              patient: { select: { firstName: true, lastName: true, dni: true } },
              psychologist: { select: { firstName: true, lastName: true } },
              specialty: { select: { name: true } },
            },
          },
          patientPackage: {
            include: {
              patient: { select: { firstName: true, lastName: true, dni: true } },
              packageCatalog: { select: { name: true } }
            }
          }
        },
      }),
      prisma.payment.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.payment.findFirst({
      where: { id, deletedAt: null },
      include: {
        appointment: {
          include: {
            patient: { select: { firstName: true, lastName: true, dni: true } },
            psychologist: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findByAppointment(appointmentId) {
    return prisma.payment.findMany({
      where: { appointmentId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data) {
    return prisma.payment.create({ data });
  }

  async update(id, data) {
    return prisma.payment.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.payment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'VOIDED' },
    });
  }

  async getTotalByAppointment(appointmentId) {
    const result = await prisma.payment.aggregate({
      where: {
        appointmentId,
        deletedAt: null,
        status: { notIn: ['VOIDED', 'REFUNDED'] },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getTotalByPatientPackage(patientPackageId) {
    const result = await prisma.payment.aggregate({
      where: {
        patientPackageId,
        deletedAt: null,
        status: { notIn: ['VOIDED', 'REFUNDED'] },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getDailyIncome(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const result = await prisma.payment.aggregate({
      where: {
        paidAt: { gte: start, lt: end },
        deletedAt: null,
        status: { notIn: ['VOIDED', 'REFUNDED'] },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getMonthlyIncome(year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const result = await prisma.payment.aggregate({
      where: {
        paidAt: { gte: start, lt: end },
        deletedAt: null,
        status: { notIn: ['VOIDED', 'REFUNDED'] },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getPendingBalance() {
    const appointments = await prisma.appointment.findMany({
      where: {
        deletedAt: null,
        status: { in: ['RESERVED', 'CONFIRMED', 'ATTENDED'] },
      },
      include: {
        payments: {
          where: { deletedAt: null, status: { notIn: ['VOIDED', 'REFUNDED'] } },
        },
      },
    });

    let totalPending = 0;
    for (const apt of appointments) {
      const paid = apt.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      totalPending += parseFloat(apt.cost) - paid;
    }
    return totalPending;
  }
}

module.exports = new PaymentRepository();
