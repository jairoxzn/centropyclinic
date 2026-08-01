import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserRound, Phone, MapPin, Briefcase, GraduationCap, Building, Calendar, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';

export default function PsychologistDetail() {
  const { id } = useParams();

  const { data: psychologist, isLoading } = useQuery({
    queryKey: ['psychologist', id],
    queryFn: () => api.get(`/psychologists/${id}`).then(res => res.data),
  });

  if (isLoading) return <div className="p-8 text-center text-surface-500">Cargando perfil del psicólogo...</div>;
  if (!psychologist) return <div className="p-8 text-center text-red-500 font-bold">Psicólogo no encontrado</div>;

  const dayMap = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/psychologists">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Perfil Profesional
          </h1>
        </div>
        <div className="ml-auto">
          <Link to={`/psychologists/${id}/edit`}>
            <Button>Editar Perfil</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-bold mb-4 border-2 border-indigo-200 dark:border-indigo-800">
            {psychologist.firstName.charAt(0)}{psychologist.lastName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">
            Lic. {psychologist.firstName} {psychologist.lastName}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 font-mono mt-1">C.P. {psychologist.licenseNumber}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {psychologist.specialties?.map(s => (
              <span key={s.specialtyId} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                {s.specialty.name}
              </span>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <UserRound size={20} className="text-indigo-500" />
              Información de Contacto y Cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Correo Electrónico (Usuario)</p>
                <p className="font-medium text-surface-900 dark:text-white">{psychologist.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><Phone size={14} /> Teléfono</p>
                <p className="font-medium text-surface-900 dark:text-white">{psychologist.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><Building size={14} /> Consultorio Asignado</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {psychologist.office ? `${psychologist.office.number} (Piso ${psychologist.office.floor})` : 'No asignado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><AlertCircle size={14} /> Estado en el Sistema</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {psychologist.isActive ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Activo</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-bold">Inactivo</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Horario de Atención Habitual
            </h3>
            {psychologist.schedules && psychologist.schedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {psychologist.schedules.map(schedule => (
                  <div key={schedule.id} className="p-3 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-center">
                    <p className="font-bold text-surface-800 dark:text-surface-200">{dayMap[schedule.dayOfWeek]}</p>
                    <p className="text-sm text-surface-600 dark:text-surface-400 font-mono mt-1">{schedule.startTime} - {schedule.endTime}</p>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">Citas de {schedule.slotDuration}m</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 italic">Este profesional aún no tiene horarios configurados. Configúralos en la sección de Horarios.</p>
            )}
          </div>
          
          {psychologist.cv && (
            <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 flex items-center gap-2">
                <GraduationCap size={20} className="text-indigo-500" />
                Resumen Curricular (CV)
              </h3>
              <p className="text-surface-700 dark:text-surface-300 whitespace-pre-line">{psychologist.cv}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
