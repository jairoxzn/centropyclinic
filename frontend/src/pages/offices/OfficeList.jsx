import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Building2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function OfficeList() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ number: '', floor: '', status: 'ACTIVE', observations: '' });

  const { data: offices, isLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: () => api.get('/offices').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, floor: Number(data.floor) };
      return editingId ? api.put(`/offices/${editingId}`, payload) : api.post('/offices', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['offices']);
      toast.success(`Consultorio ${editingId ? 'actualizado' : 'creado'}`);
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar el consultorio');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/offices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['offices']);
      toast.success('Consultorio eliminado');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.number || !formData.floor) return toast.error('Número y piso son requeridos');
    mutation.mutate(formData);
  };

  const handleEdit = (office) => {
    setFormData({ 
      number: office.number, 
      floor: office.floor.toString(), 
      status: office.status, 
      observations: office.observations || '' 
    });
    setEditingId(office.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Eliminar consultorio?',
      text: "Se eliminará si no tiene psicólogos asignados.",
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
    setFormData({ number: '', floor: '', status: 'ACTIVE', observations: '' });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-semibold">Activo</span>;
      case 'MAINTENANCE': return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded text-xs font-semibold">Mantenimiento</span>;
      case 'INACTIVE': return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-semibold">Inactivo</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-primary-500" /> Consultorios
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Administra los espacios físicos de la clínica.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={20} className="mr-2" /> Nuevo Consultorio
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm animate-slide-up">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            {editingId ? 'Editar Consultorio' : 'Nuevo Consultorio'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input 
                label="Número/Nombre" 
                value={formData.number} 
                onChange={e => setFormData({...formData, number: e.target.value})} 
                placeholder="Ej. 101, A" 
                autoFocus
              />
              <Input 
                label="Piso" 
                type="number"
                value={formData.floor} 
                onChange={e => setFormData({...formData, floor: e.target.value})} 
                placeholder="Ej. 1" 
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Estado</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
              <Input 
                label="Observaciones" 
                value={formData.observations} 
                onChange={e => setFormData({...formData, observations: e.target.value})} 
                placeholder="Opcional..." 
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="bg-surface-100 dark:bg-surface-800 h-32 rounded-xl animate-pulse"></div>)
        ) : offices?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
            <Building2 size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
            <p className="text-surface-500">No hay consultorios registrados.</p>
          </div>
        ) : (
          offices?.map((office) => (
            <div key={office.id} className={`bg-white dark:bg-surface-900 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow relative group ${
              office.status === 'MAINTENANCE' ? 'border-amber-200 dark:border-amber-900/50' : 
              office.status === 'INACTIVE' ? 'border-red-200 dark:border-red-900/50' : 
              'border-surface-200 dark:border-surface-800'
            }`}>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleEdit(office)} className="p-1 text-surface-500 hover:text-primary-600 transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(office.id)} className="p-1 text-surface-500 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-lg">
                  {office.number}
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white">Piso {office.floor}</h3>
                </div>
              </div>
              
              <div className="mb-3">
                {getStatusBadge(office.status)}
              </div>

              {office.observations && (
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-2 line-clamp-2 italic">
                  "{office.observations}"
                </p>
              )}
              
              <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-500 font-medium">
                {office._count?.psychologists || 0} profesionales asignados
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
