const settingsRepository = require('../repositories/settingsRepository');
const { NotFoundError } = require('../helpers/errors');

class SettingsService {
  async get() {
    return settingsRepository.get();
  }

  async update(data) {
    const settings = await settingsRepository.get();
    return settingsRepository.update(settings.id, data);
  }
}

module.exports = new SettingsService();
