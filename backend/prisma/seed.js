require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── CLEAN ──────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cashMovement.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.clinicalFile.deleteMany();
  await prisma.clinicalSession.deleteMany();
  await prisma.clinicalRecord.deleteMany();
  await prisma.patientDocument.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.psychologistSpecialty.deleteMany();
  await prisma.psychologist.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.office.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinicSettings.deleteMany();

  console.log('✅ Database cleaned');

  // ─── SETTINGS ───────────────────────────────────────
  await prisma.clinicSettings.create({
    data: {
      clinicName: 'PsyClinic Pro',
      email: 'contacto@psyclinicpro.com',
      phone: '+51 999 888 777',
      whatsapp: '+51 999 888 777',
      address: 'Av. Javier Prado Este 1234, San Isidro, Lima',
      consultationCost: 100.00,
      consultationDuration: 60,
      currency: 'PEN',
      timezone: 'America/Lima',
    },
  });
  console.log('✅ Clinic settings created');

  // ─── SPECIALTIES ────────────────────────────────────
  const specialties = await Promise.all([
    prisma.specialty.create({ data: { name: 'Psicología Clínica', description: 'Diagnóstico y tratamiento de trastornos mentales y emocionales' } }),
    prisma.specialty.create({ data: { name: 'Psicología Infantil', description: 'Atención especializada para niños y adolescentes' } }),
    prisma.specialty.create({ data: { name: 'Psicoterapia', description: 'Terapia psicológica individual y grupal' } }),
    prisma.specialty.create({ data: { name: 'Psicología Familiar', description: 'Terapia de pareja y familia' } }),
    prisma.specialty.create({ data: { name: 'Neuropsicología', description: 'Evaluación y rehabilitación neuropsicológica' } }),
    prisma.specialty.create({ data: { name: 'Psicología Educativa', description: 'Orientación y apoyo en el ámbito educativo' } }),
    prisma.specialty.create({ data: { name: 'Psicología Organizacional', description: 'Bienestar laboral y desarrollo organizacional' } }),
  ]);
  console.log('✅ 7 specialties created');

  // ─── OFFICES ────────────────────────────────────────
  const offices = await Promise.all([
    prisma.office.create({ data: { number: '101', floor: 1, status: 'ACTIVE' } }),
    prisma.office.create({ data: { number: '102', floor: 1, status: 'ACTIVE' } }),
    prisma.office.create({ data: { number: '201', floor: 2, status: 'ACTIVE' } }),
    prisma.office.create({ data: { number: '202', floor: 2, status: 'ACTIVE' } }),
    prisma.office.create({ data: { number: '301', floor: 3, status: 'MAINTENANCE', observations: 'En remodelación' } }),
  ]);
  console.log('✅ 5 offices created');

  // ─── ADMIN USER ─────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@psyclinicpro.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created (admin@psyclinicpro.com / admin123)');

  // ─── RECEPTIONIST ───────────────────────────────────
  const receptionistPassword = await bcrypt.hash('recep123', 12);
  await prisma.user.create({
    data: {
      email: 'recepcion@psyclinicpro.com',
      password: receptionistPassword,
      role: 'RECEPTIONIST',
      isActive: true,
    },
  });
  console.log('✅ Receptionist user created (recepcion@psyclinicpro.com / recep123)');

  // ─── PSYCHOLOGISTS ──────────────────────────────────
  const psyPassword = await bcrypt.hash('psy123', 12);

  const psyUser1 = await prisma.user.create({
    data: { email: 'dra.garcia@psyclinicpro.com', password: psyPassword, role: 'PSYCHOLOGIST' },
  });
  const psy1 = await prisma.psychologist.create({
    data: {
      userId: psyUser1.id,
      firstName: 'María Elena',
      lastName: 'García López',
      licenseNumber: 'CPP-12345',
      phone: '+51 987 654 321',
      officeId: offices[0].id,
    },
  });
  await prisma.psychologistSpecialty.createMany({
    data: [
      { psychologistId: psy1.id, specialtyId: specialties[0].id },
      { psychologistId: psy1.id, specialtyId: specialties[2].id },
    ],
  });

  const psyUser2 = await prisma.user.create({
    data: { email: 'dr.torres@psyclinicpro.com', password: psyPassword, role: 'PSYCHOLOGIST' },
  });
  const psy2 = await prisma.psychologist.create({
    data: {
      userId: psyUser2.id,
      firstName: 'Carlos Alberto',
      lastName: 'Torres Mendoza',
      licenseNumber: 'CPP-67890',
      phone: '+51 987 123 456',
      officeId: offices[1].id,
    },
  });
  await prisma.psychologistSpecialty.createMany({
    data: [
      { psychologistId: psy2.id, specialtyId: specialties[1].id },
      { psychologistId: psy2.id, specialtyId: specialties[3].id },
    ],
  });

  const psyUser3 = await prisma.user.create({
    data: { email: 'dra.santos@psyclinicpro.com', password: psyPassword, role: 'PSYCHOLOGIST' },
  });
  const psy3 = await prisma.psychologist.create({
    data: {
      userId: psyUser3.id,
      firstName: 'Ana Lucía',
      lastName: 'Santos Rivera',
      licenseNumber: 'CPP-11223',
      phone: '+51 976 543 210',
      officeId: offices[2].id,
    },
  });
  await prisma.psychologistSpecialty.createMany({
    data: [
      { psychologistId: psy3.id, specialtyId: specialties[4].id },
      { psychologistId: psy3.id, specialtyId: specialties[5].id },
    ],
  });
  console.log('✅ 3 psychologists created');

  // ─── SCHEDULES ──────────────────────────────────────
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const psy of [psy1, psy2, psy3]) {
    for (const day of days) {
      await prisma.schedule.create({
        data: {
          psychologistId: psy.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '17:00',
          slotDuration: 60,
        },
      });
    }
    // Saturday half day
    await prisma.schedule.create({
      data: {
        psychologistId: psy.id,
        dayOfWeek: 'SATURDAY',
        startTime: '08:00',
        endTime: '13:00',
        slotDuration: 60,
      },
    });
  }
  console.log('✅ Schedules created for all psychologists');

  // ─── PATIENTS ───────────────────────────────────────
  const patientPassword = await bcrypt.hash('12345678', 12);

  const patients = [];
  const patientData = [
    { email: 'juan.perez@gmail.com', firstName: 'Juan Carlos', lastName: 'Pérez Díaz', dni: '70123456', gender: 'MALE', birthDate: new Date('1990-05-15'), phone: '+51 912 345 678', maritalStatus: 'SINGLE', occupation: 'Ingeniero' },
    { email: 'maria.lopez@gmail.com', firstName: 'María Fernanda', lastName: 'López Castillo', dni: '70234567', gender: 'FEMALE', birthDate: new Date('1985-08-22'), phone: '+51 923 456 789', maritalStatus: 'MARRIED', occupation: 'Profesora' },
    { email: 'pedro.ramirez@gmail.com', firstName: 'Pedro Antonio', lastName: 'Ramírez Gutiérrez', dni: '70345678', gender: 'MALE', birthDate: new Date('1978-12-03'), phone: '+51 934 567 890', maritalStatus: 'DIVORCED', occupation: 'Abogado' },
    { email: 'lucia.mendoza@gmail.com', firstName: 'Lucía Andrea', lastName: 'Mendoza Flores', dni: '70456789', gender: 'FEMALE', birthDate: new Date('1995-03-10'), phone: '+51 945 678 901', maritalStatus: 'SINGLE', occupation: 'Estudiante' },
    { email: 'roberto.silva@gmail.com', firstName: 'Roberto', lastName: 'Silva Vargas', dni: '70567890', gender: 'MALE', birthDate: new Date('1988-07-28'), phone: '+51 956 789 012', maritalStatus: 'COHABITING', occupation: 'Contador' },
  ];

  for (const pd of patientData) {
    const user = await prisma.user.create({
      data: { email: pd.email, password: patientPassword, role: 'PATIENT' },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dni: pd.dni,
        firstName: pd.firstName,
        lastName: pd.lastName,
        birthDate: pd.birthDate,
        gender: pd.gender,
        phone: pd.phone,
        maritalStatus: pd.maritalStatus,
        occupation: pd.occupation,
        emergencyContact: 'Familiar cercano',
        emergencyPhone: '+51 999 000 111',
      },
    });
    patients.push(patient);
  }
  console.log('✅ 5 patients created');

  // ─── APPOINTMENTS ───────────────────────────────────
  const today = new Date();
  const appointments = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    // Skip Sunday
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);

    const apt = await prisma.appointment.create({
      data: {
        patientId: patients[i % patients.length].id,
        psychologistId: [psy1, psy2, psy3][i % 3].id,
        specialtyId: specialties[i % specialties.length].id,
        date: date,
        startTime: `${String(8 + i).padStart(2, '0')}:00`,
        endTime: `${String(9 + i).padStart(2, '0')}:00`,
        cost: 100.00,
        status: i === 0 ? 'CONFIRMED' : i === 1 ? 'ATTENDED' : 'RESERVED',
      },
    });
    appointments.push(apt);
  }
  console.log('✅ 5 sample appointments created');

  // ─── PAYMENTS ───────────────────────────────────────
  // Payment for attended appointment
  if (appointments[1]) {
    await prisma.payment.create({
      data: {
        appointmentId: appointments[1].id,
        amount: 50.00,
        method: 'CASH',
        status: 'PARTIAL',
        paidAt: new Date(),
      },
    });
    await prisma.payment.create({
      data: {
        appointmentId: appointments[1].id,
        amount: 50.00,
        method: 'YAPE',
        status: 'PAID',
        operationNumber: 'YP-123456',
        paidAt: new Date(),
      },
    });
  }
  console.log('✅ Sample payments created');

  // ─── CLINICAL RECORDS ───────────────────────────────
  const record = await prisma.clinicalRecord.create({
    data: {
      patientId: patients[0].id,
      consultReason: 'Ansiedad generalizada y dificultad para dormir',
      background: 'Sin antecedentes psiquiátricos previos. Refiere episodios de ansiedad desde hace 6 meses.',
      diagnosis: 'Trastorno de ansiedad generalizada (TAG)',
      treatment: 'Terapia cognitivo-conductual. Técnicas de relajación y mindfulness.',
      consentSigned: true,
    },
  });

  await prisma.clinicalSession.create({
    data: {
      clinicalRecordId: record.id,
      sessionNumber: 1,
      date: new Date(),
      startTime: '08:00',
      endTime: '09:00',
      notes: 'Primera sesión. Entrevista inicial. Paciente muestra disposición al tratamiento.',
      evolution: 'Paciente identifica sus principales fuentes de ansiedad.',
      objectives: 'Establecer rapport. Identificar patrones de pensamiento ansiogénico.',
      nextSession: 'Continuar con técnicas de reestructuración cognitiva.',
    },
  });
  console.log('✅ Clinical record with session created');

  // ─── HOLIDAYS ───────────────────────────────────────
  await prisma.holiday.createMany({
    data: [
      { name: 'Año Nuevo', date: new Date('2026-01-01'), isRecurring: true },
      { name: 'Día del Trabajo', date: new Date('2026-05-01'), isRecurring: true },
      { name: 'Fiestas Patrias', date: new Date('2026-07-28'), isRecurring: true },
      { name: 'Fiestas Patrias', date: new Date('2026-07-29'), isRecurring: true },
      { name: 'Navidad', date: new Date('2026-12-25'), isRecurring: true },
    ],
  });
  console.log('✅ Holidays created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Credenciales de acceso:                 ║');
  console.log('║                                          ║');
  console.log('║  Admin:                                  ║');
  console.log('║  📧 admin@psyclinicpro.com               ║');
  console.log('║  🔑 admin123                             ║');
  console.log('║                                          ║');
  console.log('║  Recepcionista:                          ║');
  console.log('║  📧 recepcion@psyclinicpro.com           ║');
  console.log('║  🔑 recep123                             ║');
  console.log('║                                          ║');
  console.log('║  Psicólogos:                             ║');
  console.log('║  📧 dra.garcia@psyclinicpro.com          ║');
  console.log('║  📧 dr.torres@psyclinicpro.com           ║');
  console.log('║  📧 dra.santos@psyclinicpro.com          ║');
  console.log('║  🔑 psy123                               ║');
  console.log('║                                          ║');
  console.log('║  Pacientes: DNI como contraseña          ║');
  console.log('╚══════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
