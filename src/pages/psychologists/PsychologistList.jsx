import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, UserRound, Edit, Trash2, ShieldCheck, Stethoscope, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../services/api';
import Button from '../../components/ui/Button';

export default function PsychologistList() {
  const queryClient = useQueryClient();

  const { data: psychologists, isLoading } = useQuery({
    queryKey: ['psychologists'],
    queryFn: () => api.get('/psychologists').then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/psychologists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['psychologists']);
      toast.success('Psicólogo eliminado correctamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar psicólogo');
    }
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <UserRound className="text-primary-500" /> Psicólogos
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Gestiona el personal psicológico de la clínica.</p>
        </div>
        <Link to="/psychologists/new">
          <Button className="w-full sm:w-auto">
            <Plus size={20} className="mr-2" />
            Nuevo Psicólogo
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-600 dark:text-surface-300">
            <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-4">Profesional</th>
                <th className="px-6 py-4">CPP / Licencia</th>
                <th className="px-6 py-4">Especialidades</th>
                <th className="px-6 py-4">Consultorio</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cargando profesionales...
                    </div>
                  </td>
                </tr>
              ) : psychologists?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">
                    No hay psicólogos registrados.
                  </td>
                </tr>
              ) : (
                psychologists?.map((psy) => (
                  <tr key={psy.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                          {psy.firstName.charAt(0)}{psy.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">
                            {psy.firstName} {psy.lastName}
                          </p>
                          <p className="text-xs text-surface-500 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-green-500" /> {psy.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-surface-900 dark:text-white">
                      {psy.licenseNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {psy.specialties?.length > 0 ? psy.specialties.map(ps => (
                          <span key={ps.specialtyId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Stethoscope size={10} className="mr-1" />
                            {ps.specialty.name}
                          </span>
                        )) : <span className="text-surface-400 text-xs italic">Sin especialidad</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {psy.office ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {psy.office.number} (Piso {psy.office.floor})
                        </span>
                      ) : (
                        <span className="text-surface-400 text-xs italic">No asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/psychologists/${psy.id}`}>
                          <Button variant="ghost" size="icon" title="Ver Perfil" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30">
                            <Eye size={18} />
                          </Button>
                        </Link>
                        <Link to={`/psychologists/${psy.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Editar">
                            <Edit size={18} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => handleDelete(psy.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
