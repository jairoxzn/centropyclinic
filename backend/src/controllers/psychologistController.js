const psychologistService = require('../services/psychologistService');

class PsychologistController {
  async getAll(req, res, next) {
    try {
      const result = await psychologistService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await psychologistService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await psychologistService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await psychologistService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const result = await psychologistService.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getBySpecialty(req, res, next) {
    try {
      const data = await psychologistService.getBySpecialty(req.params.specialtyId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new PsychologistController();
