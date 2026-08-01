import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Moon, Sun, ShieldCheck, Clock, Users } from 'lucide-react';

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      
      {/* Sección Izquierda - Visual / Brand (Oculto en móviles) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden">
        {/* Fondo decorativo moderno con SVG / Blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-800 to-primary-950 z-0 opacity-90"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <ShieldCheck size={32} className="text-primary-100" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{settings?.clinicName || 'PsyClinic Pro'}</h1>
            </div>
            <p className="text-primary-200 text-lg max-w-md mt-4 font-light leading-relaxed">
              Plataforma integral diseñada exclusivamente para la gestión moderna y eficiente de consultorios psicológicos.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 w-max transform hover:translate-x-2 transition-transform cursor-default shadow-lg">
              <div className="bg-primary-500/30 p-3 rounded-full">
                <Users size={24} className="text-primary-100" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Gestión de Pacientes</h3>
                <p className="text-sm text-primary-200">Historias clínicas digitales seguras</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 w-max transform hover:translate-x-2 transition-transform cursor-default ml-8 shadow-lg">
              <div className="bg-teal-500/30 p-3 rounded-full">
                <Clock size={24} className="text-teal-100" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Agenda Inteligente</h3>
                <p className="text-sm text-primary-200">Organización y recordatorios automáticos</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-primary-300 font-medium">
              &copy; {new Date().getFullYear()} PsyClinic Pro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative p-6 sm:p-12">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          title={theme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden text-center mb-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/60 dark:to-primary-800/40 p-4 rounded-2xl mb-4 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-100/50 dark:border-primary-800/50">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">{settings?.clinicName || 'PsyClinic Pro'}</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">Gestión Inteligente</p>
          </div>
          
          {/* El contenedor Outlet renderiza Login.jsx */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
