const patientRepository = require('../repositories/patientRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const paymentRepository = require('../repositories/paymentRepository');
const psychologistRepository = require('../repositories/psychologistRepository');
const specialtyRepository = require('../repositories/specialtyRepository');

class DashboardService {
  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      newPatients,
      todayAppointments,
      pendingAppointments,
      cancelledAppointments,
      attendedAppointments,
      dailyIncome,
      monthlyIncome,
      pendingBalance,
      topPsychologists,
      topSpecialties,
    ] = await Promise.all([
      patientRepository.count(),
      patientRepository.countNew(startOfMonth),
      appointmentRepository.countToday(),
      appointmentRepository.countByStatus('RESERVED'),
      appointmentRepository.countByStatus('CANCELLED', { date: { gte: startOfMonth } }),
      appointmentRepository.countByStatus('ATTENDED', { date: { gte: startOfMonth } }),
      paymentRepository.getDailyIncome(now),
      paymentRepository.getMonthlyIncome(now.getFullYear(), now.getMonth() + 1),
      paymentRepository.getPendingBalance(),
      psychologistRepository.getTopByAppointments(5),
      specialtyRepository.getMostRequested(5),
    ]);

    return {
      totalPatients,
      newPatients,
      todayAppointments,
      pendingAppointments,
      cancelledAppointments,
      attendedAppointments,
      dailyIncome: parseFloat(dailyIncome),
      monthlyIncome: parseFloat(monthlyIncome),
      pendingBalance: parseFloat(pendingBalance),
      topPsychologists,
      topSpecialties,
    };
  }

  async getMonthlyChart() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const income = await paymentRepository.getMonthlyIncome(date.getFullYear(), date.getMonth() + 1);
      months.push({
        month: date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
        income: parseFloat(income),
      });
    }
    return months;
  }

  async getWeeklyChart() {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const income = await paymentRepository.getDailyIncome(date);
      days.push({
        day: date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
        income: parseFloat(income),
      });
    }
    return days;
  }
}

module.exports = new DashboardService();
