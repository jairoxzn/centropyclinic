import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Search, Eye, Plus } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ClinicalRecordList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients-with-records', searchTerm],
    queryFn: () => searchTerm 
      ? api.get(`/patients/search?q=${searchTerm}`).then(res => res.data)
      : api.get('/patients').then(res => res.data),
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <FileText className="text-primary-500" /> Historias Clínicas
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Busca a un paciente para gestionar su historia clínica.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
            <Input 
              placeholder="Buscar por DNI, nombre o apellido del paciente..." 
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
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-surface-500">Buscando...</td></tr>
              ) : patients?.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-surface-500">No se encontraron pacientes.</td></tr>
              ) : (
                patients?.map((patient) => {
                  const age = Math.floor((new Date() - new Date(patient.birthDate).getTime()) / 3.15576e+10);
                  
                  return (
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
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-surface-900 dark:text-white">
                        {patient.dni}
                      </td>
                      <td className="px-6 py-4">
                        {age} años
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/clinical-records/${patient.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye size={16} className="mr-2" />
                            Ver Historia
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
