const prisma = require('../config/database');

class ClinicalRecordRepository {
  async findByPatient(patientId) {
    return prisma.clinicalRecord.findFirst({
      where: { patientId, deletedAt: null },
      include: {
        sessions: { orderBy: { sessionNumber: 'desc' } },
        files: { orderBy: { createdAt: 'desc' } },
        patient: {
          select: { firstName: true, lastName: true, dni: true, birthDate: true, gender: true },
        },
      },
    });
  }

  async findById(id) {
    return prisma.clinicalRecord.findFirst({
      where: { id, deletedAt: null },
      include: {
        sessions: { orderBy: { sessionNumber: 'desc' } },
        files: { orderBy: { createdAt: 'desc' } },
        patient: {
          select: { firstName: true, lastName: true, dni: true, birthDate: true, gender: true },
        },
      },
    });
  }

  async create(data) {
    return prisma.clinicalRecord.create({ data });
  }

  async update(id, data) {
    return prisma.clinicalRecord.update({ where: { id }, data });
  }

  // Sessions
  async createSession(data) {
    return prisma.clinicalSession.create({ data });
  }

  async updateSession(id, data) {
    return prisma.clinicalSession.update({ where: { id }, data });
  }

  async findSessionById(id) {
    return prisma.clinicalSession.findUnique({
      where: { id },
      include: { clinicalRecord: { include: { patient: true } } },
    });
  }

  async getNextSessionNumber(clinicalRecordId) {
    const last = await prisma.clinicalSession.findFirst({
      where: { clinicalRecordId },
      orderBy: { sessionNumber: 'desc' },
    });
    return (last?.sessionNumber || 0) + 1;
  }

  // Files
  async addFile(data) {
    return prisma.clinicalFile.create({ data });
  }

  async deleteFile(id) {
    return prisma.clinicalFile.delete({ where: { id } });
  }
}

module.exports = new ClinicalRecordRepository();
