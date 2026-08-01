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
  dni: z.string().min(8, 'Mínimo 8 caracteres').max(15, 'Máximo 15 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Correo inválido'),
  birthDate: z.string().min(1, 'La fecha es requerida'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Seleccione un género' }) }),
  phone: z.string().optional(),
  address: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'COHABITING']).optional().or(z.literal('')),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  observations: z.string().optional(),
});

export default function PatientForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/patients/${id}`).then(res => res.data),
    enabled: isEditing,
  });

  useEffect(() => {
    if (patient) {
      reset({
        ...patient,
        email: patient.user.email,
        birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '',
        maritalStatus: patient.maritalStatus || '',
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? api.put(`/patients/${id}`, data) : api.post('/patients', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success(`Paciente ${isEditing ? 'actualizado' : 'creado'} correctamente`);
      navigate('/patients');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al procesar el paciente');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {isEditing ? 'Actualiza los datos del paciente.' : 'Registra un nuevo paciente en el sistema.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
        
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
            Datos Personales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="DNI/Documento" {...register('dni')} error={errors.dni?.message} />
            <Input label="Correo Electrónico" type="email" {...register('email')} error={errors.email?.message} disabled={isEditing} />
            <Input label="Nombres" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Apellidos" {...register('lastName')} error={errors.lastName?.message} />
            <Input label="Fecha de Nacimiento" type="date" {...register('birthDate')} error={errors.birthDate?.message} />
            
            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Género</label>
              <select 
                {...register('gender')}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
              >
                <option value="">Seleccione...</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
            Contacto y Otros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Teléfono" {...register('phone')} error={errors.phone?.message} />
            <Input label="Dirección" {...register('address')} error={errors.address?.message} />
            
            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Estado Civil</label>
              <select 
                {...register('maritalStatus')}
                className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
              >
                <option value="">Seleccione...</option>
                <option value="SINGLE">Soltero/a</option>
                <option value="MARRIED">Casado/a</option>
                <option value="DIVORCED">Divorciado/a</option>
                <option value="WIDOWED">Viudo/a</option>
                <option value="COHABITING">Conviviente</option>
              </select>
            </div>
            
            <Input label="Ocupación" {...register('occupation')} error={errors.occupation?.message} />
            <Input label="Contacto de Emergencia (Nombre)" {...register('emergencyContact')} error={errors.emergencyContact?.message} />
            <Input label="Teléfono de Emergencia" {...register('emergencyPhone')} error={errors.emergencyPhone?.message} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Observaciones</label>
          <textarea
            {...register('observations')}
            rows="3"
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Link to="/patients">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  );
}
