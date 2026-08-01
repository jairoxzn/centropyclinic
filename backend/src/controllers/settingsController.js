const settingsService = require('../services/settingsService');

class SettingsController {
  async get(req, res, next) {
    try {
      const data = await settingsService.get();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async update(req, res, next) {
    try {
      const data = await settingsService.update(req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new SettingsController();
