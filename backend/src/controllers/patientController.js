const patientService = require('../services/patientService');

class PatientController {
  async getAll(req, res, next) {
    try {
      const result = await patientService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await patientService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await patientService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await patientService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const result = await patientService.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async search(req, res, next) {
    try {
      const data = await patientService.search(req.query.q);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new PatientController();
