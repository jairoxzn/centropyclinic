import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserRound, Phone, MapPin, Briefcase, Heart, PhoneForwarded, FileText, CalendarPlus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [packages, setPackages] = useState([]);
  const [packageCatalogs, setPackageCatalogs] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [schedulingPkg, setSchedulingPkg] = useState(null);
  const [psychologists, setPsychologists] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ psychologistId: '', specialtyId: '', duration: 60, sessions: [] });
  const [isScheduling, setIsScheduling] = useState(false);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/patients/${id}`).then(res => res.data),
  });

  useEffect(() => {
    if (activeTab === 'packages' && id) {
      fetchPackages();
      fetchCatalogs();
    }
  }, [activeTab, id]);

  if (isLoading) return <div>Cargando...</div>;
  if (!patient) return <div>Paciente no encontrado</div>;

  const age = Math.floor((new Date() - new Date(patient.birthDate).getTime()) / 3.15576e+10);
  
  const statusMap = {
    SINGLE: 'Soltero/a',
    MARRIED: 'Casado/a',
    DIVORCED: 'Divorciado/a',
    WIDOWED: 'Viudo/a',
    COHABITING: 'Conviviente',
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get(`/patient-packages/patient/${id}`);
      setPackages(res.data);
    } catch (error) {
      toast.error('Error al cargar paquetes');
    }
  };

  const fetchCatalogs = async () => {
    try {
      const res = await api.get('/package-catalogs');
      setPackageCatalogs(res.data.filter(c => c.isActive));
    } catch (error) {
      toast.error('Error al cargar catálogo de paquetes');
    }
  };

  const handleAssignPackage = async (e) => {
    e.preventDefault();
    if (!selectedCatalogId) return;
    setIsAssigning(true);
    try {
      await api.post('/patient-packages/assign', { patientId: id, packageCatalogId: selectedCatalogId });
      toast.success('Paquete asignado exitosamente');
      setSelectedCatalogId('');
      fetchPackages();
    } catch (error) {
      toast.error('Error al asignar paquete');
    } finally {
      setIsAssigning(false);
    }
  };

  const addMinutes = (time, minutes) => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const openSchedule = async (pkg) => {
    const remaining = pkg.totalSessions - pkg.usedSessions;
    setScheduleForm({
      psychologistId: '',
      specialtyId: '',
      duration: 60,
      sessions: Array.from({ length: remaining }, () => ({ date: '', time: '' })),
    });
    setSchedulingPkg(pkg);
    try {
      const res = await api.get('/psychologists');
      setPsychologists(res.data.filter(p => p.isActive));
    } catch (error) {
      toast.error('Error al cargar psicólogos');
    }
  };

  const onPsychologistChange = (psychologistId) => {
    const psy = psychologists.find(p => p.id === psychologistId);
    const psySpecialties = psy ? psy.specialties.map(ps => ps.specialty).filter(s => s.isActive) : [];
    setScheduleForm(prev => ({
      ...prev,
      psychologistId,
      specialtyId: psySpecialties.length ? psySpecialties[0].id : '',
    }));
  };

  const updateSession = (index, field, value) => {
    setScheduleForm(prev => {
      const sessions = prev.sessions.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, sessions };
    });
  };

  const handleScheduleSessions = async (e) => {
    e.preventDefault();
    const filled = scheduleForm.sessions.filter(s => s.date && s.time);
    if (filled.length === 0) {
      toast.error('Complete al menos una fecha y hora de sesión');
      return;
    }
    if (!scheduleForm.psychologistId) {
      toast.error('Seleccione un psicólogo');
      return;
    }
    if (!scheduleForm.specialtyId) {
      toast.error('El psicólogo seleccionado no tiene especialidades asignadas');
      return;
    }
    setIsScheduling(true);
    try {
      const sessions = filled.map(s => ({
        psychologistId: scheduleForm.psychologistId,
        specialtyId: scheduleForm.specialtyId,
        date: s.date,
        startTime: s.time,
        endTime: addMinutes(s.time, scheduleForm.duration),
      }));
      await api.post(`/patient-packages/${schedulingPkg.id}/schedule-sessions`, { sessions });
      toast.success(`${filled.length} sesión(es) programada(s) en el calendario`);
      setSchedulingPkg(null);
      fetchPackages();
    } catch (error) {
      toast.error(error.message || 'Error al programar sesiones');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Detalle del Paciente
          </h1>
        </div>
        <div className="ml-auto">
          <Link to={`/patients/${id}/edit`}>
            <Button>Editar Datos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-3xl font-bold mb-4">
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 font-mono mt-1">DNI: {patient.dni}</p>
          <div className="mt-4 inline-block px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-full text-sm text-surface-700 dark:text-surface-300">
            {age} años • {patient.gender === 'MALE' ? 'Masculino' : patient.gender === 'FEMALE' ? 'Femenino' : 'Otro'}
          </div>
        </div>

        {/* Info Cards and Tabs */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex border-b border-surface-200 dark:border-surface-800 mb-6 gap-6">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'profile' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
            >
              Información General
              {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('packages')}
              className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'packages' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
            >
              Paquetes de Sesiones
              {activeTab === 'packages' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full"></span>}
            </button>
          </div>

          <div className="space-y-6">
          {activeTab === 'profile' ? (
            <>
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <UserRound size={20} className="text-primary-500" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Correo Electrónico</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><Phone size={14} /> Teléfono</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient.phone || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><MapPin size={14} /> Dirección</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><Heart size={14} /> Estado Civil</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient.maritalStatus ? statusMap[patient.maritalStatus] : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><Briefcase size={14} /> Ocupación</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient.occupation || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <PhoneForwarded size={20} className="text-red-500" />
              Contacto de Emergencia
            </h3>
            {patient.emergencyContact ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Nombre</p>
                  <p className="font-medium text-surface-900 dark:text-white">{patient.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Teléfono</p>
                  <p className="font-medium text-surface-900 dark:text-white">{patient.emergencyPhone || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-surface-500 italic">No hay contacto de emergencia registrado.</p>
            )}
          </div>
          
          {patient.observations && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-sm">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500 mb-2 flex items-center gap-2">
                <FileText size={20} />
                Observaciones
              </h3>
              <p className="text-amber-800 dark:text-amber-200/80 whitespace-pre-line">{patient.observations}</p>
            </div>
          )}
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Vender Nuevo Paquete</h3>
                <form onSubmit={handleAssignPackage} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Seleccionar del Catálogo</label>
                    <select required value={selectedCatalogId} onChange={e => setSelectedCatalogId(e.target.value)} className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                      <option value="">Selecciona un paquete...</option>
                      {packageCatalogs.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.totalSessions} sesiones) - S/ {parseFloat(cat.price).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" disabled={isAssigning || !selectedCatalogId}>
                    {isAssigning ? 'Asignando...' : 'Asignar Paquete'}
                  </Button>
                </form>
              </div>

              {schedulingPkg && (
                <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                      <CalendarPlus size={20} className="text-primary-500" />
                      Programar Sesiones: {schedulingPkg.packageCatalog.name}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setSchedulingPkg(null)}>
                      <X size={18} />
                    </Button>
                  </div>
                  <form onSubmit={handleScheduleSessions} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Psicólogo</label>
                        <select
                          value={scheduleForm.psychologistId}
                          onChange={e => onPsychologistChange(e.target.value)}
                          className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                          <option value="">Selecciona un psicólogo...</option>
                          {psychologists.map(p => (
                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Especialidad</label>
                        <select
                          value={scheduleForm.specialtyId}
                          onChange={e => setScheduleForm(prev => ({ ...prev, specialtyId: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                          <option value="">Selecciona una especialidad...</option>
                          {(() => {
                            const psy = psychologists.find(p => p.id === scheduleForm.psychologistId);
                            const opts = psy ? psy.specialties.map(ps => ps.specialty).filter(s => s.isActive) : [];
                            return opts.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ));
                          })()}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Duración (minutos)</label>
                        <input
                          type="number"
                          min="15"
                          step="5"
                          value={scheduleForm.duration}
                          onChange={e => setScheduleForm(prev => ({ ...prev, duration: Number(e.target.value) || 60 }))}
                          className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {scheduleForm.sessions.map((s, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-3 items-end bg-surface-50 dark:bg-surface-950/50 border border-surface-100 dark:border-surface-800 rounded-xl p-3">
                          <span className="text-sm font-semibold text-surface-700 dark:text-surface-300 w-24 shrink-0">
                            Sesión {i + 1}
                          </span>
                          <input
                            type="date"
                            value={s.date}
                            onChange={e => updateSession(i, 'date', e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                          <input
                            type="time"
                            value={s.time}
                            onChange={e => updateSession(i, 'time', e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={isScheduling}>
                        {isScheduling ? 'Programando...' : 'Guardar Sesiones'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setSchedulingPkg(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    <tr>
                      <th className="p-4 font-semibold">Paquete</th>
                      <th className="p-4 font-semibold text-center">Sesiones Programadas</th>
                      <th className="p-4 font-semibold">Progreso</th>
                      <th className="p-4 font-semibold">Estado</th>
                      <th className="p-4 font-semibold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pkg => {
                      const progress = Math.round((pkg.usedSessions / pkg.totalSessions) * 100);
                      const remaining = pkg.totalSessions - pkg.usedSessions;
                      const canSchedule = ['ADMIN', 'RECEPTIONIST'].includes(user?.role) && pkg.status === 'ACTIVE' && remaining > 0;
                      return (
                        <tr key={pkg.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/30">
                          <td className="p-4 font-medium text-surface-900 dark:text-white">
                            {pkg.packageCatalog.name}
                            <div className="text-xs font-normal text-surface-500 mt-0.5">Asignado el {new Date(pkg.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-surface-700 dark:text-surface-300">
                            {pkg.usedSessions} / {pkg.totalSessions}
                          </td>
                          <td className="p-4">
                            <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5">
                              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-bold w-max ${pkg.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-surface-200 text-surface-700 dark:bg-surface-800 dark:text-surface-400'}`}>
                              {pkg.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {canSchedule ? (
                              <Button size="sm" variant="outline" onClick={() => openSchedule(pkg)}>
                                <CalendarPlus size={16} className="mr-1.5" /> Programar
                              </Button>
                            ) : (
                              <span className="text-xs text-surface-400">{remaining} restantes</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {packages.length === 0 && (
                      <tr><td colSpan="5" className="p-6 text-center text-surface-500">El paciente no tiene paquetes comprados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
