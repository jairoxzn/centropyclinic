const prisma = require('../config/database');

class PackageCatalogController {
  async list(req, res, next) {
    try {
      const catalogs = await prisma.packageCatalog.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: catalogs });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { name, description, totalSessions, price, isActive } = req.body;
      const catalog = await prisma.packageCatalog.create({
        data: {
          name,
          description,
          totalSessions: parseInt(totalSessions),
          price: parseFloat(price),
          isActive: isActive !== undefined ? isActive : true
        }
      });
      res.status(201).json({ success: true, data: catalog });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, totalSessions, price, isActive } = req.body;
      const catalog = await prisma.packageCatalog.update({
        where: { id },
        data: {
          name,
          description,
          totalSessions: totalSessions ? parseInt(totalSessions) : undefined,
          price: price ? parseFloat(price) : undefined,
          isActive
        }
      });
      res.json({ success: true, data: catalog });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PackageCatalogController();
