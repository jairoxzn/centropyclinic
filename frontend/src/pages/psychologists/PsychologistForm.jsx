import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Correo inválido'),
  licenseNumber: z.string().min(1, 'El número de colegiatura (CPP) es requerido'),
  phone: z.string().optional(),
  officeId: z.string().optional().nullable(),
  specialties: z.array(z.string()).optional(),
});

export default function PsychologistForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { specialties: [] }
  });

  const selectedSpecialties = watch('specialties') || [];

  const { data: psychologist, isLoading: psyLoading } = useQuery({
    queryKey: ['psychologist', id],
    queryFn: () => api.get(`/psychologists/${id}`).then(res => res.data),
    enabled: isEditing,
  });

  const { data: specialties, isLoading: specLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.get('/specialties').then(res => res.data),
  });

  const { data: offices, isLoading: offLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: () => api.get('/offices').then(res => res.data),
  });

  useEffect(() => {
    if (psychologist) {
      reset({
        ...psychologist,
        email: psychologist.user.email,
        officeId: psychologist.officeId || '',
        specialties: psychologist.specialties?.map(s => s.specialtyId) || [],
      });
    }
  }, [psychologist, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      // transform officeId to null if empty
      const payload = { ...data, officeId: data.officeId || null };
      return isEditing ? api.put(`/psychologists/${id}`, payload) : api.post('/psychologists', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['psychologists']);
      toast.success(`Psicólogo ${isEditing ? 'actualizado' : 'creado'} correctamente`);
      navigate('/psychologists');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al procesar el psicólogo');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const toggleSpecialty = (specId) => {
    const current = new Set(selectedSpecialties);
    if (current.has(specId)) {
      current.delete(specId);
    } else {
      current.add(specId);
    }
    setValue('specialties', Array.from(current), { shouldValidate: true, shouldDirty: true });
  };

  const isLoading = (isEditing && psyLoading) || specLoading || offLoading;

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/psychologists">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isEditing ? 'Editar Psicólogo' : 'Nuevo Psicólogo'}
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {isEditing ? 'Actualiza los datos del profesional.' : 'Registra un nuevo psicólogo en el sistema.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
        
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
            Datos Personales y Profesionales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombres" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Apellidos" {...register('lastName')} error={errors.lastName?.message} />
            <Input label="Correo Electrónico (Usuario)" type="email" {...register('email')} error={errors.email?.message} disabled={isEditing} />
            <Input label="Teléfono" {...register('phone')} error={errors.phone?.message} />
            <Input label="Nº de Colegiatura (CPP)" {...register('licenseNumber')} error={errors.licenseNumber?.message} />
            
            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Consultorio Asignado</label>
              <select 
                {...register('officeId')}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
              >
                <option value="">No asignado</option>
                {offices?.map(o => (
                  <option key={o.id} value={o.id}>
                    Consultorio {o.number} (Piso {o.floor}) {o.status !== 'ACTIVE' ? ` - ${o.status}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
            Especialidades
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {specialties?.map(spec => {
              const isSelected = selectedSpecialties.includes(spec.id);
              return (
                <div 
                  key={spec.id}
                  onClick={() => toggleSpecialty(spec.id)}
                  className={`cursor-pointer border rounded-lg p-3 transition-colors flex items-center justify-between ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                      : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <span className="text-sm font-medium">{spec.name}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {specialties?.length === 0 && (
            <p className="text-sm text-surface-500 italic">No hay especialidades registradas en el sistema.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Link to="/psychologists">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? 'Guardar Cambios' : 'Registrar Psicólogo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
