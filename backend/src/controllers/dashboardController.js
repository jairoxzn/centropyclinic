const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const data = await dashboardService.getStats();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async getMonthlyChart(req, res, next) {
    try {
      const data = await dashboardService.getMonthlyChart();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async getWeeklyChart(req, res, next) {
    try {
      const data = await dashboardService.getWeeklyChart();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new DashboardController();
