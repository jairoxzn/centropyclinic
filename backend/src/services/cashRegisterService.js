const cashRegisterRepository = require('../repositories/cashRegisterRepository');
const { NotFoundError, AppError } = require('../helpers/errors');
const { paginate, buildPaginationMeta } = require('../helpers/utils');

class CashRegisterService {
  async getAll(query) {
    const { page, limit } = query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const { data, total } = await cashRegisterRepository.findAll({ skip, take });
    return { data, meta: buildPaginationMeta(total, p, l) };
  }

  async getById(id) {
    const register = await cashRegisterRepository.findById(id);
    if (!register) throw new NotFoundError('Caja');
    const summary = await cashRegisterRepository.getDailySummary(id);
    return { ...register, summary };
  }

  async getCurrent() {
    const register = await cashRegisterRepository.findOpen();
    if (!register) return null;
    const summary = await cashRegisterRepository.getDailySummary(register.id);
    return { ...register, summary };
  }

  async open(data) {
    const existing = await cashRegisterRepository.findOpen();
    if (existing) throw new AppError('Ya hay una caja abierta', 400);
    return cashRegisterRepository.open({
      openedBy: data.userId,
      openingAmount: data.openingAmount || 0,
      observations: data.observations,
    });
  }

  async close(id, data) {
    const register = await cashRegisterRepository.findById(id);
    if (!register) throw new NotFoundError('Caja');
    if (register.closedAt) throw new AppError('La caja ya está cerrada', 400);
    const summary = await cashRegisterRepository.getDailySummary(id);
    return cashRegisterRepository.close(id, {
      closedBy: data.userId,
      closingAmount: data.closingAmount || parseFloat(register.openingAmount) + parseFloat(summary.balance),
      closedAt: new Date(),
      observations: data.observations,
    });
  }

  async addMovement(data) {
    const register = await cashRegisterRepository.findOpen();
    if (!register) throw new AppError('No hay caja abierta', 400);
    return cashRegisterRepository.addMovement({
      cashRegisterId: register.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      paymentId: data.paymentId || null,
    });
  }

  async getMovements(cashRegisterId) {
    return cashRegisterRepository.getMovementsByRegister(cashRegisterId);
  }
}

module.exports = new CashRegisterService();
