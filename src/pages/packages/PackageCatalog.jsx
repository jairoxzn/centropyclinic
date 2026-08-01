import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, PackageOpen, Save, X, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function PackageCatalog() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', totalSessions: 4, price: 0 });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['package-catalogs'],
    queryFn: () => api.get('/package-catalogs').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => editingId ? api.put(`/package-catalogs/${editingId}`, data) : api.post('/package-catalogs', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['package-catalogs']);
      toast.success(`Paquete ${editingId ? 'actualizado' : 'creado'}`);
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar el paquete');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/package-catalogs/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['package-catalogs']);
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el estado');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('El nombre es requerido');
    mutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      totalSessions: parseInt(formData.totalSessions),
      price: parseFloat(formData.price),
    });
  };

  const handleEdit = (pkg) => {
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      totalSessions: pkg.totalSessions,
      price: parseFloat(pkg.price),
    });
    setEditingId(pkg.id);
    setIsFormOpen(true);
  };

  const handleToggleActive = (pkg) => {
    toggleMutation.mutate({ id: pkg.id, isActive: !pkg.isActive });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', totalSessions: 4, price: 0 });
  };

  const formatPrice = (price) => `S/ ${parseFloat(price).toFixed(2)}`;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <PackageOpen className="text-primary-500" /> Catálogo de Paquetes
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Define los tipos de paquetes (ej. Paquete de 4 sesiones) que los pacientes podrán adquirir.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={20} className="mr-2" /> Nuevo Paquete
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm animate-slide-up">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            {editingId ? 'Editar Paquete' : 'Nuevo Paquete'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del paquete"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Paquete 4 Sesiones"
                autoFocus
              />
              <Input
                label="Descripción (Opcional)"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción..."
              />
              <Input
                label="Sesiones en Total"
                type="number"
                min="1"
                value={formData.totalSessions}
                onChange={e => setFormData({ ...formData, totalSessions: e.target.value })}
              />
              <Input
                label="Precio Total (S/)"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
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
          [1, 2, 3].map(i => <div key={i} className="bg-surface-100 dark:bg-surface-800 h-40 rounded-xl animate-pulse"></div>)
        ) : packages?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
            <PackageOpen size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
            <p className="text-surface-500">No hay paquetes en el catálogo.</p>
          </div>
        ) : (
          packages?.map((pkg) => (
            <div key={pkg.id} className="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleEdit(pkg)} className="p-1.5 text-surface-500 hover:text-primary-600 bg-surface-100 hover:bg-primary-50 dark:bg-surface-800 dark:hover:bg-primary-900/30 rounded-md transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleToggleActive(pkg)} className="p-1.5 text-surface-500 hover:text-amber-600 bg-surface-100 hover:bg-amber-50 dark:bg-surface-800 dark:hover:bg-amber-900/30 rounded-md transition-colors" title={pkg.isActive ? 'Desactivar' : 'Activar'}>
                  <Power size={16} />
                </button>
              </div>

              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
                <PackageOpen size={24} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-surface-900 dark:text-white text-lg">{pkg.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-bold flex items-center w-max gap-1 ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {pkg.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                {pkg.description || 'Sin descripción'}
              </p>

              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 text-sm text-surface-500 font-medium flex justify-between items-center">
                <span>{pkg.totalSessions} Sesiones</span>
                <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{formatPrice(pkg.price)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
