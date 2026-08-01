const clinicalRecordService = require('../services/clinicalRecordService');

class ClinicalRecordController {
  async getByPatient(req, res, next) {
    try {
      const data = await clinicalRecordService.getByPatient(req.params.patientId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async getById(req, res, next) {
    try {
      const data = await clinicalRecordService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async update(req, res, next) {
    try {
      const data = await clinicalRecordService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async addSession(req, res, next) {
    try {
      const data = await clinicalRecordService.addSession(req.params.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async updateSession(req, res, next) {
    try {
      const data = await clinicalRecordService.updateSession(req.params.sessionId, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async addFile(req, res, next) {
    try {
      const data = await clinicalRecordService.addFile(req.params.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }
  async deleteFile(req, res, next) {
    try {
      await clinicalRecordService.deleteFile(req.params.fileId);
      res.json({ success: true, message: 'Archivo eliminado' });
    } catch (error) { next(error); }
  }
}

module.exports = new ClinicalRecordController();
