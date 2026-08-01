import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, UserRound, Calendar, 
  CreditCard, FileText, Settings, LogOut, Menu, X, Sun, Moon,
  Stethoscope, Building2, Clock, PackageOpen
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

import { useSettings } from '../context/SettingsContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'] },
  { path: '/appointments', label: 'Citas', icon: Calendar, roles: ['ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST', 'PATIENT'] },
  { path: '/patients', label: 'Pacientes', icon: Users, roles: ['ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'] },
  { path: '/psychologists', label: 'Psicólogos', icon: UserRound, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/clinical-records', label: 'Historias Clínicas', icon: FileText, roles: ['ADMIN', 'PSYCHOLOGIST'] },
  { path: '/payments', label: 'Pagos y Caja', icon: CreditCard, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/specialties', label: 'Especialidades', icon: Stethoscope, roles: ['ADMIN'] },
  { path: '/offices', label: 'Consultorios', icon: Building2, roles: ['ADMIN'] },
  { path: '/schedules', label: 'Horarios', icon: Clock, roles: ['ADMIN', 'PSYCHOLOGIST'] },
  { path: '/package-catalogs', label: 'Catálogo de Paquetes', icon: PackageOpen, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/settings', label: 'Configuración', icon: Settings, roles: ['ADMIN', 'RECEPTIONIST', 'PSYCHOLOGIST'] },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <span className="text-xl font-bold text-primary-600 dark:text-primary-400 truncate max-w-[200px]">{settings?.clinicName || 'PsyClinic Pro'}</span>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-surface-600 dark:text-surface-300">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-surface-600 dark:text-surface-300">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center justify-center h-16 border-b border-surface-200 dark:border-surface-800">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 truncate px-4">{settings?.clinicName || 'PsyClinic Pro'}</span>
        </div>

        <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold uppercase">
            {user?.email?.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.email}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{user?.role}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium" 
                  : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-200 dark:border-surface-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
