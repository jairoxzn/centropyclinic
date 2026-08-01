const prisma = require('../config/database');

class SettingsRepository {
  async get() {
    let settings = await prisma.clinicSettings.findFirst();
    if (!settings) {
      settings = await prisma.clinicSettings.create({
        data: { clinicName: 'PsyClinic Pro' },
      });
    }
    return settings;
  }

  async update(id, data) {
    return prisma.clinicSettings.update({ where: { id }, data });
  }
}

module.exports = new SettingsRepository();
