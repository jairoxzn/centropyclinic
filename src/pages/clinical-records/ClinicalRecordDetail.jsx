import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Plus, FileSignature, Clock, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';

export default function ClinicalRecordDetail() {
  const { patientId } = useParams();
  const queryClient = useQueryClient();

  // We fetch the patient to get basic info
  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.get(`/patients/${patientId}`).then(res => res.data),
  });

  // We fetch all records for this patient
  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['clinical-records', patientId],
    queryFn: () => api.get(`/clinical-records/patient/${patientId}`).then(res => res.data),
  });

  if (loadingPatient) return <div>Cargando información del paciente...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/clinical-records">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              Historia Clínica de {patient?.firstName} {patient?.lastName}
            </h1>
            <p className="text-surface-600 dark:text-surface-400 font-mono">
              DNI: {patient?.dni}
            </p>
          </div>
        </div>
        
        <Link to={`/clinical-records/${patientId}/new`}>
          <Button>
            <Plus size={20} className="mr-2" />
            Nueva Evolución
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Patient Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="font-bold text-surface-900 dark:text-white border-b border-surface-200 dark:border-surface-800 pb-2 mb-3">
              Datos Generales
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-surface-500">Fecha de Nac.</p>
                <p className="font-medium text-surface-900 dark:text-white">{new Date(patient?.birthDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-surface-500">Teléfono</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient?.phone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-surface-500">Contacto de Emerg.</p>
                <p className="font-medium text-surface-900 dark:text-white">{patient?.emergencyContact || '-'}</p>
                <p className="text-surface-900 dark:text-white">{patient?.emergencyPhone || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline of Records */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock size={20} className="text-primary-500" /> Historial de Atenciones
            </h2>

            {loadingRecords ? (
              <div className="text-center py-8 text-surface-500">Cargando registros...</div>
            ) : !records?.sessions || records.sessions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-xl">
                <FileSignature size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
                <p className="text-surface-500">No hay registros clínicos para este paciente.</p>
                <p className="text-sm text-surface-400 mt-1">Crea la primera evolución para comenzar.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-surface-200 dark:border-surface-700 ml-3 space-y-8 pb-4">
                {records.sessions.map((session, index) => (
                  <div key={session.id} className="relative pl-6 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="absolute w-4 h-4 bg-primary-500 rounded-full -left-[9px] top-1 border-4 border-white dark:border-surface-900"></div>
                    
                    <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-5 border border-surface-100 dark:border-surface-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-surface-900 dark:text-white text-lg">
                            Sesión #{session.sessionNumber} - {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </h4>
                        </div>
                        {session.appointmentId && (
                          <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 text-xs px-2 py-1 rounded font-medium">
                            Cita Vinculada
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-4 text-sm mt-4">
                        {session.evolution && (
                          <div>
                            <h5 className="font-semibold text-surface-700 dark:text-surface-300">Evolución:</h5>
                            <p className="text-surface-600 dark:text-surface-400 mt-1 whitespace-pre-line">{session.evolution}</p>
                          </div>
                        )}
                        {session.objectives && (
                          <div>
                            <h5 className="font-semibold text-surface-700 dark:text-surface-300">Objetivos:</h5>
                            <p className="text-surface-600 dark:text-surface-400 mt-1 whitespace-pre-line">{session.objectives}</p>
                          </div>
                        )}
                        {session.notes && (
                          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg mt-2">
                            <h5 className="font-semibold text-amber-800 dark:text-amber-500">Notas Privadas:</h5>
                            <p className="text-amber-700 dark:text-amber-400/80 mt-1 whitespace-pre-line italic">{session.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 flex justify-end">
                        <Link to={`/clinical-records/${patientId}/edit/${session.id}`}>
                          <Button variant="ghost" size="sm">
                            Editar Sesión
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
