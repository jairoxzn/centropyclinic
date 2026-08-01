const specialtyRepository = require('../repositories/specialtyRepository');
const { NotFoundError, ConflictError } = require('../helpers/errors');

class SpecialtyService {
  async getAll() {
    return specialtyRepository.findAll();
  }

  async getById(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new NotFoundError('Especialidad');
    return specialty;
  }

  async create(data) {
    const existing = await specialtyRepository.findByName(data.name);
    if (existing) throw new ConflictError('Ya existe una especialidad con ese nombre');
    return specialtyRepository.create(data);
  }

  async update(id, data) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new NotFoundError('Especialidad');
    if (data.name && data.name !== specialty.name) {
      const existing = await specialtyRepository.findByName(data.name);
      if (existing) throw new ConflictError('Ya existe una especialidad con ese nombre');
    }
    return specialtyRepository.update(id, data);
  }

  async delete(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new NotFoundError('Especialidad');
    await specialtyRepository.softDelete(id);
    return { message: 'Especialidad eliminada correctamente' };
  }

  async getMostRequested() {
    return specialtyRepository.getMostRequested();
  }
}

module.exports = new SpecialtyService();
