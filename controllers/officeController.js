const officeService = require('../services/officeService');

class OfficeController {
  async getAll(req, res, next) {
    try {
      const data = await officeService.getAll();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async getById(req, res, next) {
    try {
      const data = await officeService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async create(req, res, next) {
    try {
      const data = await officeService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async update(req, res, next) {
    try {
      const data = await officeService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async delete(req, res, next) {
    try {
      const result = await officeService.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
}

module.exports = new OfficeController();
