const prisma = require('../config/database');

class ScheduleRepository {
  async findByPsychologist(psychologistId) {
    return prisma.schedule.findMany({
      where: { psychologistId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async upsert(psychologistId, dayOfWeek, data) {
    return prisma.schedule.upsert({
      where: { psychologistId_dayOfWeek: { psychologistId, dayOfWeek } },
      update: data,
      create: { psychologistId, dayOfWeek, ...data },
    });
  }

  async delete(id) {
    return prisma.schedule.delete({ where: { id } });
  }

  async createBlock(data) {
    return prisma.scheduleBlock.create({ data });
  }

  async findBlocks(psychologistId) {
    return prisma.scheduleBlock.findMany({
      where: { psychologistId, endDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
    });
  }

  async deleteBlock(id) {
    return prisma.scheduleBlock.delete({ where: { id } });
  }

  async isBlocked(psychologistId, date) {
    const d = new Date(date);
    return prisma.scheduleBlock.findFirst({
      where: {
        psychologistId,
        startDate: { lte: d },
        endDate: { gte: d },
      },
    });
  }

  // Holidays
  async findHolidays() {
    return prisma.holiday.findMany({ orderBy: { date: 'asc' } });
  }

  async createHoliday(data) {
    return prisma.holiday.create({ data });
  }

  async deleteHoliday(id) {
    return prisma.holiday.delete({ where: { id } });
  }

  async isHoliday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    return prisma.holiday.findFirst({
      where: { date: { gte: d, lt: nextDay } },
    });
  }
}

module.exports = new ScheduleRepository();
