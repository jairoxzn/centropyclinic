const prisma = require('../config/database');

const audit = (action, table) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id || null,
            action,
            table,
            recordId: req.params?.id || data?.data?.id || null,
            oldData: req.method === 'PUT' || req.method === 'PATCH' ? req.body : undefined,
            newData: data?.data || undefined,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        });
      } catch (err) {
        console.error('Audit log error:', err.message);
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = audit;
