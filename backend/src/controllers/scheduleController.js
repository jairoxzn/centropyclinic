const scheduleService = require('../services/scheduleService');

class ScheduleController {
  async getByPsychologist(req, res, next) {
    try {
      const data = await scheduleService.getByPsychologist(req.params.psychologistId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async upsert(req, res, next) {
    try {
      const data = await scheduleService.upsert(req.params.psychologistId, req.body.schedules);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async deleteSchedule(req, res, next) {
    try {
      await scheduleService.deleteSchedule(req.params.id);
      res.json({ success: true, message: 'Horario eliminado' });
    } catch (error) { next(error); }
  }
  async getBlocks(req, res, next) {
    try {
      const data = await scheduleService.getBlocks(req.params.psychologistId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async createBlock(req, res, next) {
    try {
      const data = await scheduleService.createBlock(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async deleteBlock(req, res, next) {
    try {
      await scheduleService.deleteBlock(req.params.id);
      res.json({ success: true, message: 'Bloqueo eliminado' });
    } catch (error) { next(error); }
  }
  async getHolidays(req, res, next) {
    try {
      const data = await scheduleService.getHolidays();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async createHoliday(req, res, next) {
    try {
      const data = await scheduleService.createHoliday(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async deleteHoliday(req, res, next) {
    try {
      await scheduleService.deleteHoliday(req.params.id);
      res.json({ success: true, message: 'Feriado eliminado' });
    } catch (error) { next(error); }
  }
}

module.exports = new ScheduleController();
