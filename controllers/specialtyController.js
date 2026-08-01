const specialtyService = require('../services/specialtyService');

class SpecialtyController {
  async getAll(req, res, next) {
    try {
      const data = await specialtyService.getAll();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await specialtyService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await specialtyService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await specialtyService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const result = await specialtyService.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
}

module.exports = new SpecialtyController();
