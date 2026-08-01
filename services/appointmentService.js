const appointmentRepository = require('../repositories/appointmentRepository');
const scheduleRepository = require('../repositories/scheduleRepository');
const { NotFoundError, AppError, ConflictError } = require('../helpers/errors');
const { paginate, buildPaginationMeta, generateSlots } = require('../helpers/utils');
const { sendEmail } = require('../config/mailer');

const DAY_MAP = { 0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };

class AppointmentService {
  async getAll(query) {
    const { page, limit, status, psychologistId, patientId, startDate, endDate } = query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where = {};
    if (status) {
      if (status === 'PENDING_PAYMENT') {
        where.status = { in: ['RESERVED', 'CONFIRMED', 'ATTENDED'] };
      } else {
        where.status = status;
      }
    }
    if (psychologistId) where.psychologistId = psychologistId;
    if (patientId) where.patientId = patientId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const { data, total } = await appointmentRepository.findAll({ skip, take, where });
    return { data, meta: buildPaginationMeta(total, p, l) };
  }

  async getById(id) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new NotFoundError('Cita');
    return appointment;
  }

  async getCalendarEvents(query) {
    const { start, end, psychologistId } = query;
    if (!start || !end) throw new AppError('Fechas requeridas', 400);
    return appointmentRepository.findByDateRange(
      new Date(start),
      new Date(end),
      psychologistId || null
    );
  }

  async getAvailableSlots(psychologistId, date) {
    const d = new Date(date);
    const dayOfWeek = DAY_MAP[d.getDay()];

    // Check blocks and holidays
    const isBlocked = await scheduleRepository.isBlocked(psychologistId, d);
    if (isBlocked) return [];

    const isHoliday = await scheduleRepository.isHoliday(d);
    if (isHoliday) return [];

    // Get schedule for this day
    const schedules = await scheduleRepository.findByPsychologist(psychologistId);
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule) return [];

    // Generate all possible slots
    const allSlots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotDuration);

    // Get existing appointments for this date
    const startOfDay = new Date(d);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await appointmentRepository.findByDateRange(
      startOfDay, endOfDay, psychologistId
    );
    const occupiedSlots = existingAppointments
      .filter((a) => !['CANCELLED', 'NO_SHOW'].includes(a.status))
      .map((a) => a.startTime);

    return allSlots.map((slot) => ({
      ...slot,
      available: !occupiedSlots.includes(slot.startTime),
    }));
  }

  async create(data) {
    // Check for conflicts
    const conflict = await appointmentRepository.findConflict(
      data.psychologistId,
      new Date(data.date),
      data.startTime,
      data.endTime
    );
    if (conflict) throw new ConflictError('Ya existe una cita en ese horario');

    const appointment = await appointmentRepository.create({
      patientId: data.patientId,
      psychologistId: data.psychologistId,
      specialtyId: data.specialtyId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      cost: data.cost || 0,
      notes: data.notes,
      status: 'RESERVED',
      patientPackageId: data.patientPackageId || null,
    });

    // Deduct session if package is used
    if (data.patientPackageId) {
      const prisma = require('../config/database');
      await prisma.patientPackage.update({
        where: { id: data.patientPackageId },
        data: { usedSessions: { increment: 1 } }
      });
    }

    // Send confirmation email
    try {
      if (appointment.patient?.user?.email) {
        await sendEmail({
          to: appointment.patient.user.email,
          subject: 'PsyClinic Pro - Cita confirmada',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h2 style="color: #1E40AF;">¡Tu cita ha sido reservada!</h2>
              <p><strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString('es-PE')}</p>
              <p><strong>Hora:</strong> ${data.startTime} - ${data.endTime}</p>
              <p><strong>Psicólogo:</strong> ${appointment.psychologist.firstName} ${appointment.psychologist.lastName}</p>
              <p><strong>Especialidad:</strong> ${appointment.specialty.name}</p>
              <p style="color: #94A3B8; font-size: 14px; margin-top: 24px;">PsyClinic Pro - Sistema de Gestión</p>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error('Error sending email:', e.message);
    }

    return appointment;
  }

  async update(id, data) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new NotFoundError('Cita');

    if (data.startTime && data.endTime && data.date) {
      const conflict = await appointmentRepository.findConflict(
        data.psychologistId || appointment.psychologistId,
        new Date(data.date),
        data.startTime,
        data.endTime,
        id
      );
      if (conflict) throw new ConflictError('Ya existe una cita en ese horario');
    }

    const updateData = {};
    if (data.date) updateData.date = new Date(data.date);
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.psychologistId) updateData.psychologistId = data.psychologistId;
    if (data.specialtyId) updateData.specialtyId = data.specialtyId;
    if (data.cancellationReason) updateData.cancellationReason = data.cancellationReason;

    return appointmentRepository.update(id, updateData);
  }

  async cancel(id, reason) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new NotFoundError('Cita');
    if (['ATTENDED', 'CANCELLED'].includes(appointment.status)) {
      throw new AppError('No se puede cancelar una cita atendida o ya cancelada', 400);
    }
    const updated = await appointmentRepository.update(id, {
      status: 'CANCELLED',
      cancellationReason: reason,
    });
    // Free the package session so it can be scheduled again
    if (appointment.patientPackageId) {
      const prisma = require('../config/database');
      await prisma.patientPackage.update({
        where: { id: appointment.patientPackageId },
        data: { usedSessions: { decrement: 1 } },
      });
    }
    return updated;
  }

  async reschedule(id, data) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new NotFoundError('Cita');

    const conflict = await appointmentRepository.findConflict(
      data.psychologistId || appointment.psychologistId,
      new Date(data.date),
      data.startTime,
      data.endTime,
      id
    );
    if (conflict) throw new ConflictError('Ya existe una cita en el nuevo horario');

    return appointmentRepository.update(id, {
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'RESCHEDULED',
      psychologistId: data.psychologistId || appointment.psychologistId,
    });
  }

  async delete(id) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new NotFoundError('Cita');
    await appointmentRepository.softDelete(id);
    return { message: 'Cita eliminada correctamente' };
  }
}

module.exports = new AppointmentService();
