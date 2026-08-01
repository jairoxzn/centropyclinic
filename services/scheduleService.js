const scheduleRepository = require('../repositories/scheduleRepository');
const { NotFoundError } = require('../helpers/errors');

class ScheduleService {
  async getByPsychologist(psychologistId) {
    return scheduleRepository.findByPsychologist(psychologistId);
  }

  async upsert(psychologistId, schedules) {
    const results = [];
    for (const s of schedules) {
      const result = await scheduleRepository.upsert(psychologistId, s.dayOfWeek, {
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration || 60,
        isActive: s.isActive !== undefined ? s.isActive : true,
      });
      results.push(result);
    }
    return results;
  }

  async deleteSchedule(id) {
    return scheduleRepository.delete(id);
  }

  // Blocks
  async getBlocks(psychologistId) {
    return scheduleRepository.findBlocks(psychologistId);
  }

  async createBlock(data) {
    return scheduleRepository.createBlock({
      psychologistId: data.psychologistId,
      blockType: data.blockType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
    });
  }

  async deleteBlock(id) {
    return scheduleRepository.deleteBlock(id);
  }

  // Holidays
  async getHolidays() {
    return scheduleRepository.findHolidays();
  }

  async createHoliday(data) {
    return scheduleRepository.createHoliday({
      name: data.name,
      date: new Date(data.date),
      isRecurring: data.isRecurring || false,
    });
  }

  async deleteHoliday(id) {
    return scheduleRepository.deleteHoliday(id);
  }
}

module.exports = new ScheduleService();
