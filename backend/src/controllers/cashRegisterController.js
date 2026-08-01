const cashRegisterService = require('../services/cashRegisterService');

class CashRegisterController {
  async getAll(req, res, next) {
    try {
      const result = await cashRegisterService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
  async getById(req, res, next) {
    try {
      const data = await cashRegisterService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async getCurrent(req, res, next) {
    try {
      const data = await cashRegisterService.getCurrent();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async open(req, res, next) {
    try {
      const data = await cashRegisterService.open({ ...req.body, userId: req.user.id });
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async close(req, res, next) {
    try {
      const data = await cashRegisterService.close(req.params.id, { ...req.body, userId: req.user.id });
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async addMovement(req, res, next) {
    try {
      const data = await cashRegisterService.addMovement(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async getMovements(req, res, next) {
    try {
      const data = await cashRegisterService.getMovements(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new CashRegisterController();
