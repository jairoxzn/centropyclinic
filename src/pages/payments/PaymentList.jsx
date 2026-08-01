import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Banknote, Search, Calendar, FileText, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  appointmentId: z.string().optional(),
  patientPackageId: z.string().optional(),
  amount: z.coerce.number().min(0.1, 'El monto debe ser mayor a 0'),
  method: z.enum(['CASH', 'YAPE', 'PLIN', 'TRANSFER', 'CARD', 'ONLINE']),
  operationNumber: z.string().optional(),
  observations: z.string().optional(),
});

export default function PaymentList() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentTarget, setPaymentTarget] = useState('appointment'); // 'appointment' | 'package'

  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(res => res.data),
  });

  const { data: unpaidAppointments, isLoading: loadingApts } = useQuery({
    queryKey: ['unpaid-appointments'],
    queryFn: () => api.get('/appointments?status=PENDING_PAYMENT').then(res => res.data), // Assumes endpoint supports this filter, or returns all
  });

  const { data: unpaidPackages, isLoading: loadingPkgs } = useQuery({
    queryKey: ['unpaid-packages'],
    queryFn: () => api.get('/patient-packages/unpaid').then(res => res.data),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedAptId = watch('appointmentId');
  const selectedPkgId = watch('patientPackageId');
  const selectedMethod = watch('method');

  const mutation = useMutation({
    mutationFn: (data) => api.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['unpaid-appointments']);
      queryClient.invalidateQueries(['unpaid-packages']);
      toast.success('Pago registrado exitosamente');
      handleCloseForm();
    },
    onError: (error) => toast.error(error.message || 'Error al registrar el pago')
  });

  const handleAptSelect = (e) => {
    const id = e.target.value;
    setValue('appointmentId', id);
    if (id) {
      const apt = unpaidAppointments?.find(a => a.id === id);
      if (apt) {
        const paid = apt.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        const remaining = parseFloat(apt.cost) - paid;
        setValue('amount', remaining > 0 ? remaining : apt.cost);
      }
    } else {
      setValue('amount', '');
    }
  };

  const handlePkgSelect = (e) => {
    const id = e.target.value;
    setValue('patientPackageId', id);
    if (id) {
      const pkg = unpaidPackages?.find(p => p.id === id);
      if (pkg) {
        const paid = pkg.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        const remaining = parseFloat(pkg.price) - paid;
        setValue('amount', remaining > 0 ? remaining : pkg.price);
      }
    } else {
      setValue('amount', '');
    }
  };

  const onSubmit = (data) => {
    if (!data.appointmentId && !data.patientPackageId) {
      toast.error('Debe seleccionar una cita o un paquete');
      return;
    }
    
    // Clean up empty strings so backend validation doesn't fail on empty UUIDs
    const payload = { ...data };
    if (!payload.appointmentId) delete payload.appointmentId;
    if (!payload.patientPackageId) delete payload.patientPackageId;
    
    mutation.mutate(payload);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    reset();
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);

  const getMethodBadge = (method) => {
    const map = {
      CASH: { label: 'Efectivo', color: 'bg-green-100 text-green-800' },
      YAPE: { label: 'Yape', color: 'bg-purple-100 text-purple-800' },
      PLIN: { label: 'Plin', color: 'bg-cyan-100 text-cyan-800' },
      TRANSFER: { label: 'Transferencia', color: 'bg-blue-100 text-blue-800' },
      CARD: { label: 'Tarjeta', color: 'bg-orange-100 text-orange-800' },
      ONLINE: { label: 'Online', color: 'bg-slate-100 text-slate-800' }
    };
    const { label, color } = map[method] || { label: method, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{label}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-primary-500" /> Pagos y Abonos
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Gestiona los pagos de las citas.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Banknote size={20} className="mr-2" /> Registrar Pago
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm animate-slide-up">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
            Nuevo Pago
          </h2>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentTarget" checked={paymentTarget === 'appointment'} onChange={() => { setPaymentTarget('appointment'); setValue('patientPackageId', ''); }} />
              Cita Médica
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentTarget" checked={paymentTarget === 'package'} onChange={() => { setPaymentTarget('package'); setValue('appointmentId', ''); }} />
              Paquete de Sesiones
            </label>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="w-full">
                {paymentTarget === 'appointment' ? (
                  <>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cita a Pagar</label>
                    <select 
                      onChange={handleAptSelect}
                  className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                >
                  <option value="">-- Seleccione una cita --</option>
                  {unpaidAppointments?.map(apt => (
                    <option key={apt.id} value={apt.id}>
                      {new Date(apt.date).toLocaleDateString()} {apt.startTime} - {apt.patient?.firstName} {apt.patient?.lastName} ({formatCurrency(apt.cost)})
                    </option>
                  ))}
                </select>
                {errors.appointmentId && <p className="mt-1 text-sm text-red-500">{errors.appointmentId.message}</p>}
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Paquete a Pagar</label>
                    <select 
                      onChange={handlePkgSelect}
                      className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                    >
                      <option value="">-- Seleccione un paquete --</option>
                      {unpaidPackages?.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.packageCatalog?.name} - {pkg.patient?.firstName} {pkg.patient?.lastName} ({formatCurrency(pkg.price)})
                        </option>
                      ))}
                    </select>
                    {errors.patientPackageId && <p className="mt-1 text-sm text-red-500">{errors.patientPackageId.message}</p>}
                  </>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Método de Pago</label>
                <select 
                  {...register('method')}
                  className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
                >
                  <option value="">-- Seleccione --</option>
                  <option value="CASH">Efectivo</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CARD">Tarjeta (POS)</option>
                </select>
                {errors.method && <p className="mt-1 text-sm text-red-500">{errors.method.message}</p>}
              </div>

              <Input 
                label="Monto a Pagar (S/)" 
                type="number"
                step="0.01"
                {...register('amount')} 
                error={errors.amount?.message}
                className="font-bold text-lg text-primary-600 dark:text-primary-400"
              />

              {['YAPE', 'PLIN', 'TRANSFER'].includes(selectedMethod) && (
                <Input 
                  label="Nº Operación / Referencia" 
                  {...register('operationNumber')} 
                  error={errors.operationNumber?.message}
                />
              )}

              <div className="md:col-span-2">
                <Input 
                  label="Observaciones (Opcional)" 
                  {...register('observations')} 
                />
              </div>

            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={handleCloseForm}>Cancelar</Button>
              <Button type="submit" isLoading={mutation.isPending}>Confirmar Pago</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
            <Input 
              placeholder="Buscar por paciente, recibo..." 
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
                <th className="px-6 py-4">Recibo</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Paciente / Cita</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {loadingPayments ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">Cargando pagos...</td>
                </tr>
              ) : payments?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">No hay pagos registrados.</td>
                </tr>
              ) : (
                payments?.map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-surface-900 dark:text-white flex items-center gap-2">
                      <FileText size={16} className="text-surface-400" />
                      #{payment.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(payment.paidAt).toLocaleDateString()}
                      <span className="text-xs text-surface-400 block">{new Date(payment.paidAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900 dark:text-white">
                        {payment.appointment?.patient?.firstName || payment.patientPackage?.patient?.firstName} {payment.appointment?.patient?.lastName || payment.patientPackage?.patient?.lastName}
                      </p>
                      {payment.appointment ? (
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <Calendar size={12} /> Cita: {new Date(payment.appointment.date).toLocaleDateString()}
                        </p>
                      ) : payment.patientPackage ? (
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <FileText size={12} /> Paquete: {payment.patientPackage.packageCatalog?.name}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      {getMethodBadge(payment.method)}
                      {payment.operationNumber && (
                        <p className="text-xs text-surface-500 mt-1 font-mono">Ref: {payment.operationNumber}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-surface-900 dark:text-white">
                      {formatCurrency(payment.amount)}
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
