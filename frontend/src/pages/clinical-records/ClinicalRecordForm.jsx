import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  evolution: z.string().min(1, 'La evolución es requerida'),
  objectives: z.string().optional(),
  notes: z.string().optional(),
});

export default function ClinicalRecordForm() {
  const { patientId, recordId: sessionId } = useParams();
  const isEditing = !!sessionId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] }
  });

  const { data: clinicalRecord, isLoading: loadingRecord } = useQuery({
    queryKey: ['clinical-records', patientId],
    queryFn: () => api.get(`/clinical-records/patient/${patientId}`).then(res => res.data),
  });

  const sessionToEdit = useMemo(() => {
    if (isEditing && clinicalRecord?.sessions) {
      return clinicalRecord.sessions.find(s => s.id === sessionId);
    }
    return null;
  }, [isEditing, clinicalRecord, sessionId]);

  useEffect(() => {
    if (sessionToEdit) {
      reset({
        date: new Date(sessionToEdit.date).toISOString().split('T')[0],
        evolution: sessionToEdit.evolution || '',
        objectives: sessionToEdit.objectives || '',
        notes: sessionToEdit.notes || '',
      });
    }
  }, [sessionToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing 
      ? api.put(`/clinical-records/sessions/${sessionId}`, data) 
      : api.post(`/clinical-records/${clinicalRecord.id}/sessions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clinical-records', patientId]);
      toast.success(`Sesión ${isEditing ? 'actualizada' : 'registrada'} correctamente`);
      navigate(`/clinical-records/${patientId}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar el registro');
    }
  });

  const onSubmit = (data) => {
    if (!isEditing && !clinicalRecord?.id) {
      toast.error("No se pudo obtener la historia clínica base");
      return;
    }
    mutation.mutate(data);
  };

  if (loadingRecord) return <div>Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to={`/clinical-records/${patientId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isEditing ? 'Editar Evolución (Sesión)' : 'Nueva Evolución (Sesión)'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Fecha de Sesión</label>
            <input 
              type="date"
              {...register('date')}
              className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Evolución / Desarrollo de la sesión *</label>
            <textarea
              {...register('evolution')}
              rows="5"
              className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
              placeholder="Desarrollo de la sesión, actividades, respuestas del paciente..."
            ></textarea>
            {errors.evolution && <p className="mt-1 text-sm text-red-500">{errors.evolution.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Objetivos trabajados (Opcional)</label>
            <textarea
              {...register('objectives')}
              rows="2"
              className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
              placeholder="Objetivos terapéuticos abordados..."
            ></textarea>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-900/30">
            <label className="block text-sm font-semibold text-amber-800 dark:text-amber-500 mb-1">Notas Privadas (Opcional)</label>
            <p className="text-xs text-amber-700/70 dark:text-amber-500/70 mb-2">Estas notas solo son visibles para el equipo clínico, no se imprimirán en reportes.</p>
            <textarea
              {...register('notes')}
              rows="3"
              className="w-full rounded-lg border border-amber-300 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-700/50 dark:bg-black/20 dark:text-white"
              placeholder="Anotaciones internas del terapeuta..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Link to={`/clinical-records/${patientId}`}>
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" isLoading={mutation.isPending}>
            <Save size={18} className="mr-2" />
            {isEditing ? 'Guardar Cambios' : 'Registrar Evolución'}
          </Button>
        </div>
      </form>
    </div>
  );
}
