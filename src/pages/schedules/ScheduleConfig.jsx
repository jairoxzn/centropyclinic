import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Save, Copy, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';

const DAYS = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' }
];

export default function ScheduleConfig() {
  const queryClient = useQueryClient();
  const [selectedPsy, setSelectedPsy] = useState('');
  
  const { data: psychologists } = useQuery({
    queryKey: ['psychologists'],
    queryFn: () => api.get('/psychologists').then(res => res.data),
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules', selectedPsy],
    queryFn: () => api.get(`/schedules/psychologist/${selectedPsy}`).then(res => res.data),
    enabled: !!selectedPsy,
  });

  // Local state for editing schedules
  const [localSchedules, setLocalSchedules] = useState([]);
  
  // Update local state when server data changes
  useState(() => {
    if (schedules) setLocalSchedules(schedules);
  }, [schedules]);

  // Ensure localSchedules updates when selectedPsy changes and fetch completes
  // We use a small hack by running a side effect in render body, better in useEffect but for simplicity
  if (schedules && localSchedules !== schedules && !localSchedules._isDirty) {
    setLocalSchedules(schedules);
    schedules._isDirty = true;
  }

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/schedules/psychologist/${selectedPsy}`, { schedules: data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules', selectedPsy]);
      toast.success('Horarios actualizados correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al guardar horarios')
  });

  const handleToggleDay = (dayValue) => {
    const exists = localSchedules.find(s => s.dayOfWeek === dayValue);
    if (exists) {
      setLocalSchedules(prev => prev.filter(s => s.dayOfWeek !== dayValue));
    } else {
      setLocalSchedules(prev => [...prev, { dayOfWeek: dayValue, startTime: '08:00', endTime: '17:00', slotDuration: 60 }]);
    }
  };

  const handleChangeTime = (dayValue, field, value) => {
    setLocalSchedules(prev => prev.map(s => s.dayOfWeek === dayValue ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    if (!selectedPsy) return toast.error('Selecciona un psicólogo');
    mutation.mutate(localSchedules.map(({ id, psychologistId, createdAt, updatedAt, ...rest }) => rest)); // clean up properties
  };

  const handleCopyToAll = (dayValue) => {
    const sourceSchedule = localSchedules.find(s => s.dayOfWeek === dayValue);
    if (!sourceSchedule) return;
    
    setLocalSchedules(prev => prev.map(s => {
      // Don't modify the source or unselected days
      return { 
        ...s, 
        startTime: sourceSchedule.startTime, 
        endTime: sourceSchedule.endTime, 
        slotDuration: sourceSchedule.slotDuration 
      };
    }));
    toast.success('Horario copiado a los demás días activos');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Clock className="text-primary-500" /> Horarios y Disponibilidad
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Configura las horas de atención de los psicólogos.</p>
        </div>
        {selectedPsy && (
          <Button onClick={handleSave} isLoading={mutation.isPending}>
            <Save size={20} className="mr-2" /> Guardar Cambios
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Seleccionar Psicólogo
          </label>
          <select 
            value={selectedPsy}
            onChange={e => {
              setSelectedPsy(e.target.value);
              setLocalSchedules([]); // reset while loading new
            }}
            className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
          >
            <option value="">-- Seleccione un profesional --</option>
            {psychologists?.map(psy => (
              <option key={psy.id} value={psy.id}>
                {psy.firstName} {psy.lastName} - {psy.specialties?.[0]?.specialty?.name || 'Sin especialidad'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPsy && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-900/30 flex items-start gap-3">
            <Info className="text-primary-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-primary-800 dark:text-primary-300">
              Marca los días que atiende el psicólogo y ajusta su hora de inicio y fin. 
              La duración de la cita (minutos) determinará cómo se divide el día para las reservas.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {loadingSchedules ? (
              <div className="text-center py-8 text-surface-500">Cargando horarios...</div>
            ) : (
              DAYS.map(day => {
                const schedule = localSchedules?.find(s => s.dayOfWeek === day.value);
                const isActive = !!schedule;

                return (
                  <div key={day.value} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-colors ${isActive ? 'border-primary-200 bg-primary-50/50 dark:border-primary-900/50 dark:bg-primary-900/10' : 'border-surface-200 dark:border-surface-800 opacity-70'}`}>
                    
                    <div className="flex items-center gap-3 w-40">
                      <button 
                        type="button"
                        onClick={() => handleToggleDay(day.value)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-primary-500 text-white' : 'border-2 border-surface-300 dark:border-surface-600'}`}
                      >
                        {isActive && <Check size={14} />}
                      </button>
                      <span className={`font-medium ${isActive ? 'text-surface-900 dark:text-white' : 'text-surface-500 dark:text-surface-400'}`}>
                        {day.label}
                      </span>
                    </div>

                    {isActive && (
                      <div className="flex flex-wrap items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-surface-500">Inicio</label>
                          <input 
                            type="time" 
                            value={schedule.startTime}
                            onChange={(e) => handleChangeTime(day.value, 'startTime', e.target.value)}
                            className="flex h-9 rounded-md border border-surface-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-surface-500">Fin</label>
                          <input 
                            type="time" 
                            value={schedule.endTime}
                            onChange={(e) => handleChangeTime(day.value, 'endTime', e.target.value)}
                            className="flex h-9 rounded-md border border-surface-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-surface-500">Minutos / cita</label>
                          <input 
                            type="number" 
                            value={schedule.slotDuration}
                            step="15"
                            min="15"
                            max="120"
                            onChange={(e) => handleChangeTime(day.value, 'slotDuration', parseInt(e.target.value))}
                            className="flex h-9 w-20 rounded-md border border-surface-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                          />
                        </div>

                        <div className="ml-auto">
                          <button 
                            type="button" 
                            onClick={() => handleCopyToAll(day.value)}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            title="Copiar estas horas a los demás días activos"
                          >
                            <Copy size={14} /> Copiar a todos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
