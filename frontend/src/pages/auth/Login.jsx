import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, UserCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleQuickLogin = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Bienvenido a PsyClinic Pro');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl shadow-primary-900/5 dark:shadow-black/20 border border-surface-100 dark:border-surface-800 p-8 sm:p-10 transition-all">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Iniciar Sesión</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
          Ingresa tus credenciales para acceder a la plataforma.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Correo Electrónico
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-3 bg-surface-50 dark:bg-surface-950 border ${errors.email ? 'border-red-300 dark:border-red-900/50 focus:ring-red-500' : 'border-surface-200 dark:border-surface-800 focus:ring-primary-500'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all dark:text-white`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium animate-fade-in">{errors.email.message}</p>}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
              Contraseña
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-4 py-3 bg-surface-50 dark:bg-surface-950 border ${errors.password ? 'border-red-300 dark:border-red-900/50 focus:ring-red-500' : 'border-surface-200 dark:border-surface-800 focus:ring-primary-500'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all dark:text-white`}
            />
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium animate-fade-in">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full py-3.5 text-sm font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 rounded-xl group" 
          isLoading={isLoading}
        >
          {!isLoading && (
            <span className="flex items-center justify-center gap-2">
              Ingresar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-4 justify-center text-xs font-semibold text-surface-400 uppercase tracking-wider">
          <UserCircle size={14} /> Accesos de prueba
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-surface-50 dark:bg-surface-950 p-2.5 rounded-lg border border-surface-100 dark:border-surface-800 flex justify-between items-center group cursor-pointer hover:border-primary-200 dark:hover:border-primary-800 transition-colors" onClick={() => handleQuickLogin('admin@psyclinicpro.com', 'admin123')}>
            <span className="font-medium text-surface-600 dark:text-surface-300">Admin</span>
            <span className="font-mono text-surface-500 dark:text-surface-400">admin@psyclinicpro.com / admin123</span>
          </div>
          <div className="bg-surface-50 dark:bg-surface-950 p-2.5 rounded-lg border border-surface-100 dark:border-surface-800 flex justify-between items-center group cursor-pointer hover:border-teal-200 dark:hover:border-teal-800 transition-colors" onClick={() => handleQuickLogin('recepcion@psyclinicpro.com', 'recep123')}>
            <span className="font-medium text-surface-600 dark:text-surface-300">Recepción</span>
            <span className="font-mono text-surface-500 dark:text-surface-400">recepcion@psyclinicpro.com / recep123</span>
          </div>
          <div className="bg-surface-50 dark:bg-surface-950 p-2.5 rounded-lg border border-surface-100 dark:border-surface-800 flex justify-between items-center group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors" onClick={() => handleQuickLogin('dra.garcia@psyclinicpro.com', 'psy123')}>
            <span className="font-medium text-surface-600 dark:text-surface-300">Psicólogo</span>
            <span className="font-mono text-surface-500 dark:text-surface-400">dra.garcia@psyclinicpro.com / psy123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
