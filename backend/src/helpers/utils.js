const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (time) => {
  return time;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
};

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const generateSlots = (startTime, endTime, duration) => {
  const slots = [];
  let [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
    const h1 = Math.floor(m / 60);
    const m1 = m % 60;
    const h2 = Math.floor((m + duration) / 60);
    const m2 = (m + duration) % 60;
    slots.push({
      startTime: `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')}`,
      endTime: `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`,
    });
  }
  return slots;
};

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
};

const buildPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

module.exports = {
  formatDate,
  formatTime,
  formatCurrency,
  calculateAge,
  generateSlots,
  paginate,
  buildPaginationMeta,
};
