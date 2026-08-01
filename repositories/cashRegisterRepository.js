const prisma = require('../config/database');

class CashRegisterRepository {
  async findOpen() {
    return prisma.cashRegister.findFirst({
      where: { closedAt: null },
      include: { movements: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async findAll({ skip, take }) {
    const [data, total] = await Promise.all([
      prisma.cashRegister.findMany({
        skip,
        take,
        orderBy: { openedAt: 'desc' },
        include: { _count: { select: { movements: true } } },
      }),
      prisma.cashRegister.count(),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.cashRegister.findUnique({
      where: { id },
      include: {
        movements: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async open(data) {
    return prisma.cashRegister.create({ data });
  }

  async close(id, data) {
    return prisma.cashRegister.update({ where: { id }, data });
  }

  async addMovement(data) {
    return prisma.cashMovement.create({ data });
  }

  async getMovementsByRegister(cashRegisterId) {
    return prisma.cashMovement.findMany({
      where: { cashRegisterId },
      orderBy: { createdAt: 'asc' },
      include: { payment: true },
    });
  }

  async getDailySummary(cashRegisterId) {
    const income = await prisma.cashMovement.aggregate({
      where: { cashRegisterId, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    });
    const expense = await prisma.cashMovement.aggregate({
      where: { cashRegisterId, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    });
    return {
      totalIncome: income._sum.amount || 0,
      incomeCount: income._count,
      totalExpense: expense._sum.amount || 0,
      expenseCount: expense._count,
      balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
    };
  }
}

module.exports = new CashRegisterRepository();
