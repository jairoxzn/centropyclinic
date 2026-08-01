const appointmentService = require('../services/appointmentService');

class AppointmentController {
  async getAll(req, res, next) {
    try {
      const result = await appointmentService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await appointmentService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getCalendarEvents(req, res, next) {
    try {
      const data = await appointmentService.getCalendarEvents(req.query);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const data = await appointmentService.getAvailableSlots(req.params.psychologistId, req.query.date);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await appointmentService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await appointmentService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async cancel(req, res, next) {
    try {
      const data = await appointmentService.cancel(req.params.id, req.body.reason);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async reschedule(req, res, next) {
    try {
      const data = await appointmentService.reschedule(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const result = await appointmentService.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
}

module.exports = new AppointmentController();
