const paymentService = require('../services/paymentService');

class PaymentController {
  async getAll(req, res, next) {
    try {
      const result = await paymentService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await paymentService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getByAppointment(req, res, next) {
    try {
      const data = await paymentService.getByAppointment(req.params.appointmentId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await paymentService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await paymentService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async void(req, res, next) {
    try {
      const data = await paymentService.void(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new PaymentController();
