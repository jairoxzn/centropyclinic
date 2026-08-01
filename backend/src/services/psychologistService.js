const bcrypt = require('bcryptjs');
const psychologistRepository = require('../repositories/psychologistRepository');
const userRepository = require('../repositories/userRepository');
const { NotFoundError, ConflictError } = require('../helpers/errors');
const { paginate, buildPaginationMeta } = require('../helpers/utils');

class PsychologistService {
  async getAll(query) {
    const { page, limit, search, specialtyId, isActive } = query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search } },
      ];
    }
    if (specialtyId) {
      where.specialties = { some: { specialtyId } };
    }
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { data, total } = await psychologistRepository.findAll({ skip, take, where });
    return { data, meta: buildPaginationMeta(total, p, l) };
  }

  async getById(id) {
    const psychologist = await psychologistRepository.findById(id);
    if (!psychologist) throw new NotFoundError('Psicólogo');
    return psychologist;
  }

  async create(data) {
    const existingLicense = await psychologistRepository.findByLicenseNumber(data.licenseNumber);
    if (existingLicense) throw new ConflictError('Ya existe un psicólogo con ese número de colegiatura');

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) throw new ConflictError('Ya existe un usuario con ese correo');

    const hashedPassword = await bcrypt.hash(data.licenseNumber, 12);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      role: 'PSYCHOLOGIST',
    });

    const psychologist = await psychologistRepository.create({
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      phone: data.phone,
      photo: data.photo || null,
      cv: data.cv || null,
      officeId: data.officeId || null,
    });

    if (data.specialtyIds && data.specialtyIds.length > 0) {
      await psychologistRepository.setSpecialties(psychologist.id, data.specialtyIds);
    }

    return psychologistRepository.findById(psychologist.id);
  }

  async update(id, data) {
    const psychologist = await psychologistRepository.findById(id);
    if (!psychologist) throw new NotFoundError('Psicólogo');

    if (data.licenseNumber && data.licenseNumber !== psychologist.licenseNumber) {
      const existing = await psychologistRepository.findByLicenseNumber(data.licenseNumber);
      if (existing) throw new ConflictError('Ya existe un psicólogo con ese número de colegiatura');
    }

    if (data.email && data.email !== psychologist.user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) throw new ConflictError('Ya existe un usuario con ese correo');
      await userRepository.update(psychologist.userId, { email: data.email });
    }

    const updateData = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.licenseNumber) updateData.licenseNumber = data.licenseNumber;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.cv !== undefined) updateData.cv = data.cv;
    if (data.officeId !== undefined) updateData.officeId = data.officeId || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await psychologistRepository.update(id, updateData);

    if (data.specialtyIds) {
      await psychologistRepository.setSpecialties(id, data.specialtyIds);
    }

    return psychologistRepository.findById(id);
  }

  async delete(id) {
    const psychologist = await psychologistRepository.findById(id);
    if (!psychologist) throw new NotFoundError('Psicólogo');
    await psychologistRepository.softDelete(id);
    await userRepository.softDelete(psychologist.userId);
    return { message: 'Psicólogo eliminado correctamente' };
  }

  async getBySpecialty(specialtyId) {
    return psychologistRepository.findBySpecialty(specialtyId);
  }
}

module.exports = new PsychologistService();
