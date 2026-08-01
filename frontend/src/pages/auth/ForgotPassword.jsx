import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSent(true);
      toast.success('Si el correo existe, recibirás instrucciones.');
    } catch (error) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Revisa tu correo</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Hemos enviado un enlace para restablecer tu contraseña.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full">
            Volver al inicio de sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} className="mr-1" /> Volver
        </Link>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Recuperar Contraseña</h2>
        <p className="text-surface-600 dark:text-surface-400 mt-1">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo Electrónico"
          id="email"
          type="email"
          placeholder="ejemplo@correo.com"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Enviar enlace de recuperación
        </Button>
      </form>
    </div>
  );
}
