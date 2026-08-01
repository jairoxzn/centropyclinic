import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Calendar as CalendarIcon, UserRound, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';

const schema = z.object({
  patientId: z.string().min(1, 'Seleccione un paciente'),
  psychologistId: z.string().min(1, 'Seleccione un psicólogo'),
  specialtyId: z.string().min(1, 'Seleccione una especialidad'),
  date: z.string().min(1, 'Seleccione la fecha'),
  startTime: z.string().min(1, 'Seleccione la hora'),
  cost: z.coerce.number().min(0, 'Costo no válido'),
  patientPackageId: z.string().optional().nullable(),
});

export default function AppointmentForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const initialStart = searchParams.get('start');
  const initialPsy = searchParams.get('psychologistId');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { cost: 100 }
  });

  const selectedPsy = watch('psychologistId');
  const selectedDate = watch('date');
  const selectedSpecialty = watch('specialtyId');
  const selectedPatient = watch('patientId');
  const usePackage = watch('patientPackageId');

  // Load appointment if editing
  const { data: appointment, isLoading: loadingApt } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/appointments/${id}`).then(res => res.data),
    enabled: isEditing,
  });

  // Load options
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(res => res.data),
  });

  const { data: psychologists } = useQuery({
    queryKey: ['psychologists'],
    queryFn: () => api.get('/psychologists').then(res => res.data),
  });

  // Load available slots when psy + date selected
  const { data: slots, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', selectedPsy, selectedDate],
    queryFn: () => api.get(`/appointments/slots/${selectedPsy}?date=${selectedDate}`).then(res => res.data),
    enabled: !!selectedPsy && !!selectedDate && !isEditing, // When editing, we don't necessarily fetch slots unless date changes
  });

  // Load patient packages
  const { data: patientPackages } = useQuery({
    queryKey: ['patientPackages', selectedPatient],
    queryFn: () => api.get(`/patient-packages/patient/${selectedPatient}`).then(res => res.data.filter(p => p.status === 'ACTIVE')),
    enabled: !!selectedPatient && !isEditing,
  });

  useEffect(() => {
    if (appointment) {
      reset({
        patientId: appointment.patientId,
        psychologistId: appointment.psychologistId,
        specialtyId: appointment.specialtyId,
        date: new Date(appointment.date).toISOString().split('T')[0],
        startTime: appointment.startTime,
        cost: appointment.cost,
      });
    } else if (initialStart) {
      const dateObj = new Date(initialStart);
      setValue('date', dateObj.toISOString().split('T')[0]);
      // Format time as HH:mm
      setValue('startTime', dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      if (initialPsy) setValue('psychologistId', initialPsy);
    }
  }, [appointment, initialStart, initialPsy, reset, setValue]);

  // Auto-select specialty if psychologist only has one
  useEffect(() => {
    if (selectedPsy && psychologists) {
      const psy = psychologists.find(p => p.id === selectedPsy);
      if (psy && psy.specialties?.length === 1 && !selectedSpecialty) {
        setValue('specialtyId', psy.specialties[0].specialtyId);
      }
    }
  }, [selectedPsy, psychologists, selectedSpecialty, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        cost: usePackage ? 0 : data.cost,
        endTime: calculateEndTime(data.startTime, 60),
      };

      if (isEditing) {
        return api.patch(`/appointments/${id}/reschedule`, { date: data.date, startTime: data.startTime, endTime: payload.endTime });
      }
      return api.post('/appointments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-events']);
      toast.success(`Cita ${isEditing ? 'reprogramada' : 'reservada'} correctamente`);
      navigate('/appointments');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al procesar la cita');
    }
  });

  const calculateEndTime = (start, durationMins) => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + durationMins, 0);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEditing && loadingApt) return <div>Cargando cita...</div>;

  const currentPsy = psychologists?.find(p => p.id === selectedPsy);
  const psySpecialties = currentPsy?.specialties || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/appointments">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isEditing ? 'Reprogramar Cita' : 'Nueva Cita'}
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {isEditing ? 'Cambia la fecha y hora de la cita.' : 'Reserva una nueva cita para un paciente.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-8">
        
        {/* Patient Selection - Disabled if editing */}
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2 flex items-center gap-2">
            <UserRound size={20} className="text-primary-500" /> Paciente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Paciente</label>
              <select {...register('patientId')} disabled={isEditing} className="w-full px-4 py-3 bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl">
                <option value="">Seleccione un paciente</option>
                {patients?.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} - DNI: {p.dni}</option>
                ))}
              </select>
              {errors.patientId && <p className="text-red-500 text-xs mt-1">{errors.patientId.message}</p>}
            </div>

            {patientPackages && patientPackages.length > 0 && (
              <div className="md:col-span-2 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-200 dark:border-primary-800/50">
                <h4 className="font-semibold text-primary-800 dark:text-primary-300 mb-2">El paciente tiene paquetes disponibles</h4>
                <div className="flex items-center gap-3">
                  <select {...register('patientPackageId')} className="w-full px-4 py-2 bg-white dark:bg-surface-900 border border-primary-200 dark:border-primary-700 rounded-lg text-sm text-surface-900 dark:text-white">
                    <option value="">No usar paquete (Cobrar cita individual)</option>
                    {patientPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>Usar {pkg.packageCatalog.name} (Sesiones disponibles: {pkg.totalSessions - pkg.usedSessions})</option>
                    ))}
                  </select>
                </div>
                {usePackage && <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 font-medium">El costo de la cita será de S/ 0.00 al usar este paquete.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Professional and Schedule Selection */}
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2 flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary-500" /> Profesional y Fecha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Psicólogo</label>
              <select 
                {...register('psychologistId')}
                disabled={isEditing}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white disabled:opacity-50"
              >
                <option value="">-- Seleccione --</option>
                {psychologists?.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
              {errors.psychologistId && <p className="mt-1 text-sm text-red-500">{errors.psychologistId.message}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Especialidad</label>
              <select 
                {...register('specialtyId')}
                disabled={isEditing || !selectedPsy}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white disabled:opacity-50"
              >
                <option value="">-- Seleccione --</option>
                {psySpecialties.map(ps => (
                  <option key={ps.specialtyId} value={ps.specialtyId}>{ps.specialty.name}</option>
                ))}
              </select>
              {errors.specialtyId && <p className="mt-1 text-sm text-red-500">{errors.specialtyId.message}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Fecha</label>
              <input 
                type="date"
                {...register('date')}
                min={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
            </div>

          </div>

          {/* Time Slots display based on selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Hora de Inicio</label>
            
            {loadingSlots ? (
              <div className="h-10 flex items-center text-surface-500 animate-pulse">Cargando horarios disponibles...</div>
            ) : !selectedPsy || !selectedDate ? (
              <div className="p-4 border border-dashed border-surface-300 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900/50 text-surface-500 text-center text-sm">
                Seleccione un psicólogo y una fecha para ver los horarios disponibles.
              </div>
            ) : slots?.length === 0 ? (
              <div className="p-4 border border-dashed border-amber-300 dark:border-amber-700 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-center text-sm">
                No hay horarios disponibles para esta fecha.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {slots?.map(slot => {
                  const isSelected = watch('startTime') === slot.startTime;
                  return (
                    <div 
                      key={slot.startTime}
                      onClick={() => !slot.isBooked && setValue('startTime', slot.startTime, { shouldValidate: true })}
                      className={`text-center py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${
                        slot.isBooked 
                          ? 'border-surface-200 bg-surface-100 text-surface-400 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-600 cursor-not-allowed opacity-50' 
                          : isSelected
                            ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                            : 'border-surface-200 bg-white text-surface-700 hover:border-primary-300 hover:bg-primary-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/30'
                      }`}
                    >
                      {slot.startTime}
                    </div>
                  )
                })}
              </div>
            )}
            {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime.message}</p>}
            
            {/* Fallback manual input just in case */}
            {selectedPsy && selectedDate && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-surface-500">¿No ves la hora deseada?</span>
                <input 
                  type="time" 
                  {...register('startTime')}
                  className="flex h-8 rounded border border-surface-300 bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cost - Hidden when rescheduling */}
        {!isEditing && (
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
              Pago y Confirmación
            </h3>
            <div className="w-48">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Costo (S/)</label>
              <input 
                type="number"
                step="0.01"
                {...register('cost')}
                disabled={!!usePackage}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-lg font-bold text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-primary-400 disabled:opacity-50"
              />
              {errors.cost && <p className="mt-1 text-sm text-red-500">{errors.cost.message}</p>}
            </div>
            <p className="text-xs text-surface-500 mt-2">El pago puede registrarse parcialmente o en su totalidad después de confirmar la cita en el módulo de Pagos.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Link to="/appointments">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? 'Confirmar Reprogramación' : 'Reservar Cita'}
          </Button>
        </div>
      </form>
    </div>
  );
}
