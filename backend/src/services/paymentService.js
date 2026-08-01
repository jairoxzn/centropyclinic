const paymentRepository = require('../repositories/paymentRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const { NotFoundError, AppError } = require('../helpers/errors');
const { paginate, buildPaginationMeta } = require('../helpers/utils');

class PaymentService {
  async getAll(query) {
    const { page, limit, status, method, appointmentId } = query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where = {};
    if (status) where.status = status;
    if (method) where.method = method;
    if (appointmentId) where.appointmentId = appointmentId;

    const { data, total } = await paymentRepository.findAll({ skip, take, where });
    return { data, meta: buildPaginationMeta(total, p, l) };
  }

  async getById(id) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Pago');
    return payment;
  }

  async getByAppointment(appointmentId) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Cita');

    const payments = await paymentRepository.findByAppointment(appointmentId);
    const totalPaid = await paymentRepository.getTotalByAppointment(appointmentId);
    const cost = parseFloat(appointment.cost);
    const pending = cost - parseFloat(totalPaid);

    return {
      appointment: {
        id: appointment.id,
        cost,
        date: appointment.date,
        patient: appointment.patient,
        psychologist: appointment.psychologist,
      },
      payments,
      summary: {
        cost,
        totalPaid: parseFloat(totalPaid),
        pending: pending > 0 ? pending : 0,
        status: pending <= 0 ? 'PAID' : parseFloat(totalPaid) > 0 ? 'PARTIAL' : 'PENDING',
      },
    };
  }

  async create(data) {
    if (data.patientPackageId) {
      const prisma = require('../config/database');
      const pkg = await prisma.patientPackage.findUnique({ where: { id: data.patientPackageId } });
      if (!pkg) throw new NotFoundError('Paquete');

      const totalPaid = await paymentRepository.getTotalByPatientPackage(data.patientPackageId);
      const cost = parseFloat(pkg.price);
      const currentPaid = parseFloat(totalPaid);
      const newAmount = parseFloat(data.amount);

      if (currentPaid + newAmount > cost) {
        throw new AppError(`El monto excede el saldo pendiente. Costo: ${cost}, Pagado: ${currentPaid}, Saldo: ${cost - currentPaid}`, 400);
      }

      const payment = await paymentRepository.create({
        patientPackageId: data.patientPackageId,
        amount: newAmount,
        method: data.method,
        status: currentPaid + newAmount >= cost ? 'PAID' : 'PARTIAL',
        operationNumber: data.operationNumber,
        receipt: data.receipt,
        observations: data.observations,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      });

      return payment;
    }

    // Default to appointment payment
    const appointment = await appointmentRepository.findById(data.appointmentId);
    if (!appointment) throw new NotFoundError('Cita');

    const totalPaid = await paymentRepository.getTotalByAppointment(data.appointmentId);
    const cost = parseFloat(appointment.cost);
    const currentPaid = parseFloat(totalPaid);
    const newAmount = parseFloat(data.amount);

    if (currentPaid + newAmount > cost) {
      throw new AppError(
        `El monto excede el saldo pendiente. Costo: ${cost}, Pagado: ${currentPaid}, Saldo: ${cost - currentPaid}`,
        400
      );
    }

    const payment = await paymentRepository.create({
      appointmentId: data.appointmentId,
      amount: newAmount,
      method: data.method,
      status: currentPaid + newAmount >= cost ? 'PAID' : 'PARTIAL',
      operationNumber: data.operationNumber,
      receipt: data.receipt,
      observations: data.observations,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
    });

    // Update appointment payment status (if any business logic requires it, right now just doing empty update which might not do much)
    const newTotal = currentPaid + newAmount;
    if (newTotal >= cost) {
      await appointmentRepository.update(data.appointmentId, {});
    }

    return payment;
  }

  async update(id, data) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Pago');
    return paymentRepository.update(id, data);
  }

  async void(id) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Pago');
    return paymentRepository.softDelete(id);
  }

  async getDailyIncome() {
    return paymentRepository.getDailyIncome(new Date());
  }

  async getMonthlyIncome() {
    const now = new Date();
    return paymentRepository.getMonthlyIncome(now.getFullYear(), now.getMonth() + 1);
  }

  async getPendingBalance() {
    return paymentRepository.getPendingBalance();
  }
}

module.exports = new PaymentService();
