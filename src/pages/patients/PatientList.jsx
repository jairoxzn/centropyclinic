import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Plus, UserRound, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: () => searchTerm 
      ? api.get(`/patients/search?q=${searchTerm}`).then(res => res.data)
      : api.get('/patients').then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Paciente eliminado correctamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar paciente');
    }
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer y borrará al paciente de forma lógica.",
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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Pacientes</h1>
          <p className="text-surface-600 dark:text-surface-400">Gestiona la información de todos los pacientes.</p>
        </div>
        <Link to="/patients/new">
          <Button className="w-full sm:w-auto">
            <Plus size={20} className="mr-2" />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
            <Input 
              placeholder="Buscar por DNI, nombre o apellido..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-600 dark:text-surface-300">
            <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">DNI</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado Civil</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cargando pacientes...
                    </div>
                  </td>
                </tr>
              ) : patients?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">
                    No se encontraron pacientes.
                  </td>
                </tr>
              ) : (
                patients?.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-surface-500">{patient.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-surface-900 dark:text-white">
                      {patient.dni}
                    </td>
                    <td className="px-6 py-4">
                      {patient.phone || <span className="text-surface-400 italic">No registrado</span>}
                    </td>
                    <td className="px-6 py-4">
                      {patient.maritalStatus === 'SINGLE' && 'Soltero/a'}
                      {patient.maritalStatus === 'MARRIED' && 'Casado/a'}
                      {patient.maritalStatus === 'DIVORCED' && 'Divorciado/a'}
                      {patient.maritalStatus === 'WIDOWED' && 'Viudo/a'}
                      {patient.maritalStatus === 'COHABITING' && 'Conviviente'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${patient.id}`}>
                          <Button variant="ghost" size="icon" title="Ver detalles">
                            <Eye size={18} />
                          </Button>
                        </Link>
                        <Link to={`/patients/${patient.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Editar">
                            <Edit size={18} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => handleDelete(patient.id)}
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
