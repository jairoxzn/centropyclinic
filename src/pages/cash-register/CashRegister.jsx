import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, LogIn, LogOut, ArrowRightLeft, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const openSchema = z.object({
  initialAmount: z.coerce.number().min(0, 'Monto inválido'),
});

const closeSchema = z.object({
  finalAmount: z.coerce.number().min(0, 'Monto inválido'),
  observations: z.string().optional(),
});

const movementSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  amount: z.coerce.number().min(0.1, 'Monto inválido'),
  concept: z.string().min(1, 'El concepto es requerido'),
});

export default function CashRegister() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('movements'); // movements, new-movement, close-register

  const { data: currentRegister, isLoading } = useQuery({
    queryKey: ['current-register'],
    queryFn: () => api.get('/cash-register/current').then(res => res.data),
  });

  const { data: movements } = useQuery({
    queryKey: ['register-movements', currentRegister?.id],
    queryFn: () => api.get(`/cash-register/${currentRegister.id}/movements`).then(res => res.data),
    enabled: !!currentRegister?.id,
  });

  const { register: regOpen, handleSubmit: handleOpenSubmit } = useForm({
    resolver: zodResolver(openSchema),
    defaultValues: { initialAmount: 0 }
  });

  const { register: regMovement, handleSubmit: handleMovementSubmit, reset: resetMovement } = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: 'OUT' }
  });

  const { register: regClose, handleSubmit: handleCloseSubmit } = useForm({
    resolver: zodResolver(closeSchema),
  });

  const openMutation = useMutation({
    mutationFn: (data) => api.post('/cash-register/open', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-register']);
      toast.success('Caja abierta correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al abrir caja')
  });

  const movementMutation = useMutation({
    mutationFn: (data) => api.post('/cash-register/movements', { ...data, cashRegisterId: currentRegister.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['register-movements']);
      queryClient.invalidateQueries(['current-register']); // update balances
      toast.success('Movimiento registrado');
      resetMovement();
      setActiveTab('movements');
    },
    onError: (error) => toast.error(error.message || 'Error al registrar movimiento')
  });

  const closeMutation = useMutation({
    mutationFn: (data) => api.patch(`/cash-register/${currentRegister.id}/close`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-register']);
      toast.success('Caja cerrada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al cerrar caja')
  });

  const formatCurrency = (val) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val || 0);

  if (isLoading) return <div>Cargando caja...</div>;

  // View when register is closed
  if (!currentRegister) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white dark:bg-surface-900 p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl text-center animate-scale-in">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet size={40} />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Caja Cerrada</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8">Debes abrir la caja para poder registrar pagos y movimientos del día.</p>
        
        <form onSubmit={handleOpenSubmit((data) => openMutation.mutate(data))} className="space-y-4 text-left">
          <Input 
            label="Monto Inicial en Caja (S/)" 
            type="number" 
            step="0.01" 
            {...regOpen('initialAmount')}
            className="text-lg font-bold"
          />
          <Button type="submit" className="w-full" size="lg" isLoading={openMutation.isPending}>
            <LogIn size={20} className="mr-2" /> Abrir Caja Ahora
          </Button>
        </form>
      </div>
    );
  }

  // Calculate current expected amount (Simplified calculation if backend doesn't provide it)
  // Usually the backend should provide currentBalance, totalIn, totalOut
  const expectedTotal = parseFloat(currentRegister.initialAmount) 
    + parseFloat(currentRegister.totalIncome || 0) 
    - parseFloat(currentRegister.totalExpense || 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-primary-500" /> Control de Caja
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Abierta el {new Date(currentRegister.openedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'new-movement' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('new-movement')}
          >
            <ArrowRightLeft size={16} className="mr-2" /> Nuevo Movimiento
          </Button>
          <Button 
            variant={activeTab === 'close-register' ? 'danger' : 'outline'} 
            onClick={() => setActiveTab('close-register')}
            className={activeTab !== 'close-register' ? 'text-red-600 border-red-200 hover:bg-red-50' : ''}
          >
            <LogOut size={16} className="mr-2" /> Cerrar Caja
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm">
          <p className="text-sm text-surface-500">Monto Inicial</p>
          <p className="text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(currentRegister.initialAmount)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-900/50 shadow-sm">
          <p className="text-sm text-green-700 dark:text-green-400">Total Ingresos (+)</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(currentRegister.totalIncome)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm">
          <p className="text-sm text-red-700 dark:text-red-400">Total Egresos (-)</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-400">{formatCurrency(currentRegister.totalExpense)}</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-200 dark:border-primary-900/50 shadow-sm">
          <p className="text-sm text-primary-700 dark:text-primary-400">Total Esperado en Caja</p>
          <p className="text-xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(expectedTotal)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        
        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-surface-600 dark:text-surface-300">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-900 dark:text-white font-semibold">
                <tr>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Concepto</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {movements?.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-surface-500">No hay movimientos registrados.</td></tr>
                ) : (
                  movements?.map((mov) => (
                    <tr key={mov.id}>
                      <td className="px-6 py-4">{new Date(mov.createdAt).toLocaleTimeString()}</td>
                      <td className="px-6 py-4">
                        {mov.type === 'IN' 
                          ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">INGRESO</span>
                          : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">EGRESO</span>
                        }
                      </td>
                      <td className="px-6 py-4">{mov.concept}</td>
                      <td className={`px-6 py-4 text-right font-bold ${mov.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {mov.type === 'IN' ? '+' : '-'}{formatCurrency(mov.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* New Movement Tab */}
        {activeTab === 'new-movement' && (
          <div className="p-6 max-w-2xl mx-auto animate-fade-in">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Registrar Movimiento Manual</h3>
            <form onSubmit={handleMovementSubmit((data) => movementMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tipo de Movimiento</label>
                  <select 
                    {...regMovement('type')}
                    className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <option value="OUT">Egreso (Salida de dinero)</option>
                    <option value="IN">Ingreso (Entrada extra)</option>
                  </select>
                </div>
                <Input label="Monto (S/)" type="number" step="0.01" {...regMovement('amount')} />
                <div className="md:col-span-2">
                  <Input label="Concepto / Motivo" placeholder="Ej. Compra de útiles, Pago de servicios..." {...regMovement('concept')} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={movementMutation.isPending}>Registrar Movimiento</Button>
              </div>
            </form>
          </div>
        )}

        {/* Close Register Tab */}
        {activeTab === 'close-register' && (
          <div className="p-6 max-w-2xl mx-auto animate-fade-in">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-4 rounded-xl mb-6">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                <LogOut size={20} /> Cierre de Caja
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Estás a punto de cerrar la caja actual. Cuenta el dinero físico y regístralo aquí. 
                El sistema calculará automáticamente si hay algún descuadre.
              </p>
            </div>

            <form onSubmit={handleCloseSubmit((data) => closeMutation.mutate(data))} className="space-y-4">
              <Input 
                label="Monto Físico en Caja (S/)" 
                type="number" 
                step="0.01" 
                {...regClose('finalAmount')}
                className="text-lg font-bold"
                placeholder={`Monto esperado: S/ ${expectedTotal.toFixed(2)}`}
              />
              <Input label="Observaciones (Opcional)" {...regClose('observations')} placeholder="Detalles sobre algún descuadre si lo hubiera..." />
              
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800 mt-6">
                <Button variant="outline" type="button" onClick={() => setActiveTab('movements')}>Cancelar</Button>
                <Button variant="danger" type="submit" isLoading={closeMutation.isPending}>
                  Confirmar Cierre de Caja
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
