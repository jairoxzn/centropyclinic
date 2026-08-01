import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Stethoscope, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SpecialtyList() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data: specialties, isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.get('/specialties').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => editingId ? api.put(`/specialties/${editingId}`, data) : api.post('/specialties', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['specialties']);
      toast.success(`Especialidad ${editingId ? 'actualizada' : 'creada'}`);
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar la especialidad');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/specialties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['specialties']);
      toast.success('Especialidad eliminada');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('El nombre es requerido');
    mutation.mutate(formData);
  };

  const handleEdit = (spec) => {
    setFormData({ name: spec.name, description: spec.description || '' });
    setEditingId(spec.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Eliminar especialidad?',
      text: "Si tiene psicólogos asignados, podría causar problemas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="text-primary-500" /> Especialidades
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Áreas de atención psicológica.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={20} className="mr-2" /> Nueva Especialidad
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm animate-slide-up">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            {editingId ? 'Editar Especialidad' : 'Nueva Especialidad'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nombre de la especialidad" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Ej. Psicología Clínica" 
                autoFocus
              />
              <Input 
                label="Descripción (Opcional)" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Breve descripción..." 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={handleCloseForm}>
                <X size={18} className="mr-1" /> Cancelar
              </Button>
              <Button type="submit" isLoading={mutation.isPending}>
                <Save size={18} className="mr-1" /> Guardar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="bg-surface-100 dark:bg-surface-800 h-32 rounded-xl animate-pulse"></div>)
        ) : specialties?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
            <Stethoscope size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
            <p className="text-surface-500">No hay especialidades registradas.</p>
          </div>
        ) : (
          specialties?.map((spec) => (
            <div key={spec.id} className="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleEdit(spec)} className="p-1.5 text-surface-500 hover:text-primary-600 bg-surface-100 hover:bg-primary-50 dark:bg-surface-800 dark:hover:bg-primary-900/30 rounded-md transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(spec.id)} className="p-1.5 text-surface-500 hover:text-red-600 bg-surface-100 hover:bg-red-50 dark:bg-surface-800 dark:hover:bg-red-900/30 rounded-md transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope size={24} />
              </div>
              <h3 className="font-bold text-surface-900 dark:text-white text-lg">{spec.name}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                {spec.description || 'Sin descripción'}
              </p>
              
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-500 font-medium flex justify-between items-center">
                <span>{spec._count?.psychologists || 0} Psicólogos</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
