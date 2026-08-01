const bcrypt = require('bcryptjs');
const patientRepository = require('../repositories/patientRepository');
const userRepository = require('../repositories/userRepository');
const { NotFoundError, ConflictError } = require('../helpers/errors');
const { paginate, buildPaginationMeta } = require('../helpers/utils');

class PatientService {
  async getAll(query) {
    const { page, limit, search, gender, maritalStatus } = query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
      ];
    }
    if (gender) where.gender = gender;
    if (maritalStatus) where.maritalStatus = maritalStatus;

    const { data, total } = await patientRepository.findAll({ skip, take, where });
    return { data, meta: buildPaginationMeta(total, p, l) };
  }

  async getById(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) throw new NotFoundError('Paciente');
    return patient;
  }

  async create(data) {
    const existing = await patientRepository.findByDni(data.dni);
    if (existing) throw new ConflictError('Ya existe un paciente con ese DNI');

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) throw new ConflictError('Ya existe un usuario con ese correo');

    const hashedPassword = await bcrypt.hash(data.dni, 12); // Default password = DNI

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      role: 'PATIENT',
    });

    const patient = await patientRepository.create({
      userId: user.id,
      dni: data.dni,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: new Date(data.birthDate),
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      maritalStatus: data.maritalStatus,
      occupation: data.occupation,
      emergencyContact: data.emergencyContact,
      emergencyPhone: data.emergencyPhone,
      observations: data.observations,
    });

    return patient;
  }

  async update(id, data) {
    const patient = await patientRepository.findById(id);
    if (!patient) throw new NotFoundError('Paciente');

    if (data.dni && data.dni !== patient.dni) {
      const existing = await patientRepository.findByDni(data.dni);
      if (existing) throw new ConflictError('Ya existe un paciente con ese DNI');
    }

    if (data.email && data.email !== patient.user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) throw new ConflictError('Ya existe un usuario con ese correo');
      await userRepository.update(patient.userId, { email: data.email });
    }

    const updateData = { ...data };
    delete updateData.email;
    if (updateData.birthDate) updateData.birthDate = new Date(updateData.birthDate);

    return patientRepository.update(id, updateData);
  }

  async delete(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) throw new NotFoundError('Paciente');
    await patientRepository.softDelete(id);
    await userRepository.softDelete(patient.userId);
    return { message: 'Paciente eliminado correctamente' };
  }

  async search(query) {
    return patientRepository.search(query);
  }
}

module.exports = new PatientService();
