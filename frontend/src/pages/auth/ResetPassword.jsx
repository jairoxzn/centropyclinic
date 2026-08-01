import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      setIsSuccess(true);
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">¡Contraseña Actualizada!</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Tu contraseña ha sido cambiada exitosamente.
        </p>
        <Link to="/login">
          <Button className="w-full">
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Nueva Contraseña</h2>
        <p className="text-surface-600 dark:text-surface-400 mt-1">
          Ingresa tu nueva contraseña a continuación.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nueva Contraseña"
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />
        
        <Input
          label="Confirmar Nueva Contraseña"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Guardar Contraseña
        </Button>
      </form>
    </div>
  );
}
