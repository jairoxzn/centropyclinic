const prisma = require('../config/database');

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

class PatientPackageController {
  async getUnpaid(req, res, next) {
    try {
      const packages = await prisma.patientPackage.findMany({
        where: { status: 'ACTIVE' },
        include: {
          patient: { select: { firstName: true, lastName: true, dni: true } },
          packageCatalog: { select: { name: true, totalSessions: true } },
          payments: { where: { status: { notIn: ['VOIDED', 'REFUNDED'] } } }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Filter out packages that are fully paid
      const unpaidPackages = packages.filter(pkg => {
        const paid = pkg.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        return paid < parseFloat(pkg.price);
      });

      res.json({ success: true, data: unpaidPackages });
    } catch (error) {
      next(error);
    }
  }

  async listByPatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const packages = await prisma.patientPackage.findMany({
        where: { patientId },
        include: {
          packageCatalog: true,
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }

  async assign(req, res, next) {
    try {
      const { patientId, packageCatalogId } = req.body;
      
      const catalog = await prisma.packageCatalog.findUnique({ where: { id: packageCatalogId } });
      if (!catalog) return res.status(404).json({ success: false, message: 'Paquete no encontrado en el catálogo' });

      const patientPackage = await prisma.patientPackage.create({
        data: {
          patientId,
          packageCatalogId,
          totalSessions: catalog.totalSessions,
          price: catalog.price,
          status: 'ACTIVE'
        },
        include: { packageCatalog: true }
      });
      
      res.status(201).json({ success: true, data: patientPackage, message: 'Paquete asignado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await prisma.patientPackage.update({
        where: { id },
        data: { status }
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async scheduleSessions(req, res, next) {
    try {
      const { id } = req.params;
      const { sessions } = req.body || {};

      if (!Array.isArray(sessions) || sessions.length === 0) {
        return res.status(400).json({ success: false, message: 'Debe indicar al menos una sesión' });
      }

      const patientPackage = await prisma.patientPackage.findUnique({
        where: { id },
        include: { packageCatalog: { select: { name: true, totalSessions: true } } },
      });
      if (!patientPackage) return res.status(404).json({ success: false, message: 'Paquete del paciente no encontrado' });
      if (patientPackage.status !== 'ACTIVE') {
        return res.status(400).json({ success: false, message: 'El paquete no está activo' });
      }

      const remaining = patientPackage.totalSessions - patientPackage.usedSessions;
      if (sessions.length > remaining) {
        return res.status(400).json({ success: false, message: `El paquete solo tiene ${remaining} sesión(es) disponible(s)` });
      }

      // Pre-check conflicts for all sessions before creating any
      for (const s of sessions) {
        if (!s.psychologistId || !s.specialtyId || !s.date || !s.startTime) {
          return res.status(400).json({ success: false, message: 'Cada sesión requiere psicólogo, especialidad, fecha y hora' });
        }
        const endTime = s.endTime || addMinutes(s.startTime, s.duration || 60);
        const conflict = await prisma.appointment.findFirst({
          where: {
            psychologistId: s.psychologistId,
            date: new Date(s.date),
            deletedAt: null,
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            OR: [{ startTime: { lt: endTime }, endTime: { gt: s.startTime } }],
          },
        });
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: `El psicólogo ya tiene una cita el ${new Date(s.date).toLocaleDateString('es-PE')} a las ${s.startTime}`,
          });
        }
      }

      const created = [];
      for (const s of sessions) {
        const endTime = s.endTime || addMinutes(s.startTime, s.duration || 60);
        const appointment = await prisma.appointment.create({
          data: {
            patientId: patientPackage.patientId,
            psychologistId: s.psychologistId,
            specialtyId: s.specialtyId,
            date: new Date(s.date),
            startTime: s.startTime,
            endTime,
            cost: 0,
            notes: `Sesión de paquete: ${patientPackage.packageCatalog.name}`,
            status: 'RESERVED',
            patientPackageId: patientPackage.id,
          },
          include: {
            patient: { select: { firstName: true, lastName: true } },
            psychologist: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
          },
        });
        created.push(appointment);
      }

      await prisma.patientPackage.update({
        where: { id },
        data: { usedSessions: { increment: created.length } },
      });

      res.status(201).json({ success: true, data: created, message: `${created.length} sesión(es) programada(s) exitosamente` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatientPackageController();
