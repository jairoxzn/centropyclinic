const clinicalRecordRepository = require('../repositories/clinicalRecordRepository');
const patientRepository = require('../repositories/patientRepository');
const { NotFoundError, ConflictError } = require('../helpers/errors');

class ClinicalRecordService {
  async getByPatient(patientId) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) throw new NotFoundError('Paciente');
    let record = await clinicalRecordRepository.findByPatient(patientId);
    if (!record) {
      record = await clinicalRecordRepository.create({ patientId });
      record = await clinicalRecordRepository.findByPatient(patientId);
    }
    return record;
  }

  async getById(id) {
    const record = await clinicalRecordRepository.findById(id);
    if (!record) throw new NotFoundError('Historia Clínica');
    return record;
  }

  async update(id, data) {
    const record = await clinicalRecordRepository.findById(id);
    if (!record) throw new NotFoundError('Historia Clínica');
    return clinicalRecordRepository.update(id, data);
  }

  // Sessions
  async addSession(clinicalRecordId, data) {
    const record = await clinicalRecordRepository.findById(clinicalRecordId);
    if (!record) throw new NotFoundError('Historia Clínica');
    const sessionNumber = await clinicalRecordRepository.getNextSessionNumber(clinicalRecordId);
    return clinicalRecordRepository.createSession({
      clinicalRecordId,
      sessionNumber,
      date: new Date(data.date || Date.now()),
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes,
      evolution: data.evolution,
      objectives: data.objectives,
      nextSession: data.nextSession,
      psychologicalScales: data.psychologicalScales,
      appointmentId: data.appointmentId || null,
    });
  }

  async updateSession(sessionId, data) {
    const session = await clinicalRecordRepository.findSessionById(sessionId);
    if (!session) throw new NotFoundError('Sesión');
    return clinicalRecordRepository.updateSession(sessionId, data);
  }

  // Files
  async addFile(clinicalRecordId, data) {
    return clinicalRecordRepository.addFile({
      clinicalRecordId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
    });
  }

  async deleteFile(fileId) {
    return clinicalRecordRepository.deleteFile(fileId);
  }
}

module.exports = new ClinicalRecordService();
