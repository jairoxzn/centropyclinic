const prisma = require('../config/database');

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
}

module.exports = new PatientPackageController();
