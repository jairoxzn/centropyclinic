const officeRepository = require('../repositories/officeRepository');
const { NotFoundError } = require('../helpers/errors');

class OfficeService {
  async getAll() {
    return officeRepository.findAll();
  }

  async getById(id) {
    const office = await officeRepository.findById(id);
    if (!office) throw new NotFoundError('Consultorio');
    return office;
  }

  async create(data) {
    return officeRepository.create(data);
  }

  async update(id, data) {
    const office = await officeRepository.findById(id);
    if (!office) throw new NotFoundError('Consultorio');
    return officeRepository.update(id, data);
  }

  async delete(id) {
    const office = await officeRepository.findById(id);
    if (!office) throw new NotFoundError('Consultorio');
    await officeRepository.softDelete(id);
    return { message: 'Consultorio eliminado correctamente' };
  }
}

module.exports = new OfficeService();
