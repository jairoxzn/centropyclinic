import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { User, Shield, Palette, Users, Save, Check, PackageOpen, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Settings Form State
  const [clinicName, setClinicName] = useState(settings?.clinicName || 'PsyClinic Pro');
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || '#0f766e');
  const [isSaving, setIsSaving] = useState(false);
  
  // Staff State
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  // New Staff Form State
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('RECEPTIONIST');
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Package Catalog State
  const [packageCatalogs, setPackageCatalogs] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageSessions, setNewPackageSessions] = useState(4);
  const [newPackagePrice, setNewPackagePrice] = useState(0);
  const [creatingPackage, setCreatingPackage] = useState(false);

  useEffect(() => {
    if (settings) {
      setClinicName(settings.clinicName);
      setPrimaryColor(settings.primaryColor);
    }
  }, [settings]);

  useEffect(() => {
    if (activeTab === 'staff' && user?.role === 'ADMIN') {
      fetchStaff();
    }
    if (activeTab === 'packages' && user?.role === 'ADMIN') {
      fetchPackages();
    }
  }, [activeTab, user?.role]);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await api.get('/package-catalogs');
      setPackageCatalogs(res.data);
    } catch (error) {
      toast.error('Error al cargar paquetes');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setCreatingPackage(true);
    try {
      await api.post('/package-catalogs', {
        name: newPackageName,
        totalSessions: newPackageSessions,
        price: newPackagePrice
      });
      toast.success('Paquete creado exitosamente');
      setNewPackageName('');
      setNewPackageSessions(4);
      setNewPackagePrice(0);
      fetchPackages();
    } catch (error) {
      toast.error('Error al crear paquete');
    } finally {
      setCreatingPackage(false);
    }
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await api.get('/staff');
      setStaffList(res.data);
    } catch (error) {
      toast.error('Error al cargar el personal');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ clinicName, primaryColor });
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreatingStaff(true);
    try {
      await api.post('/staff/register', {
        email: newStaffEmail,
        password: newStaffPassword,
        role: newStaffRole
      });
      toast.success('Cuenta de personal creada exitosamente');
      setNewStaffEmail('');
      setNewStaffPassword('');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setCreatingStaff(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    ...(user?.role === 'ADMIN' ? [
      { id: 'appearance', label: 'Apariencia', icon: Palette },
      { id: 'packages', label: 'Catálogo de Paquetes', icon: PackageOpen },
      { id: 'staff', label: 'Cuentas de Personal', icon: Users }
    ] : [])
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Configuración del Sistema</h1>
        <p className="text-surface-500 dark:text-surface-400">Gestiona las preferencias y accesos de la plataforma.</p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 bg-surface-50 dark:bg-surface-950 p-4 border-b md:border-b-0 md:border-r border-surface-200 dark:border-surface-800 flex flex-row md:flex-col gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all min-w-max md:min-w-0 ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-200 dark:border-primary-800/50' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 p-6 sm:p-8 min-h-[500px]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6 border-b border-surface-100 dark:border-surface-800 pb-4">Detalles de la Cuenta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Correo Electrónico</label>
                  <input type="text" disabled value={user?.email || ''} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Rol Asignado</label>
                  <input type="text" disabled value={user?.role || ''} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-500 cursor-not-allowed font-semibold text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex gap-4">
                <Shield className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-500">Privacidad y Seguridad</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-600/80 mt-1">Si necesitas modificar tu correo electrónico o contraseña, contacta al administrador general del sistema para solicitar un restablecimiento seguro de credenciales.</p>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && user?.role === 'ADMIN' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6 border-b border-surface-100 dark:border-surface-800 pb-4">Personalización Visual</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Nombre del Sistema / Clínica</label>
                  <input 
                    type="text" 
                    value={clinicName} 
                    onChange={e => setClinicName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                  />
                  <p className="text-xs text-surface-500 mt-2">Este nombre aparecerá en la barra lateral superior y en el login.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Color Primario del Tema (Acento)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border-0 p-1 bg-surface-100 dark:bg-surface-800" 
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 mt-2">Color hexadecimal para los botones primarios e íconos.</p>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span> : <Save size={18} />}
                  Guardar Apariencia
                </button>
              </div>
            </div>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && user?.role === 'ADMIN' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Gestión de Personal</h2>
                <p className="text-surface-500 text-sm mb-6 border-b border-surface-100 dark:border-surface-800 pb-4">Crea cuentas de acceso para recepcionistas y psicólogos. Si creas la cuenta de un Psicólogo, asegúrate de crearle luego su Perfil Profesional en la sección "Psicólogos".</p>
              </div>

              {/* Crear personal */}
              <div className="bg-surface-50 dark:bg-surface-950/50 p-6 rounded-2xl border border-surface-200 dark:border-surface-800">
                <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2"><User size={18}/> Registrar Nuevo Acceso</h3>
                <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Correo (Email)</label>
                    <input required type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Contraseña Inicial</label>
                    <input required type="text" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Rol</label>
                    <select required value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm">
                      <option value="RECEPTIONIST">Recepcionista</option>
                      <option value="PSYCHOLOGIST">Psicólogo</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" disabled={creatingStaff} className="w-full py-2.5 bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-lg text-sm font-bold hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors">
                      {creatingStaff ? 'Creando...' : 'Crear Cuenta'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    <tr>
                      <th className="p-3 font-semibold rounded-tl-lg">Email</th>
                      <th className="p-3 font-semibold">Rol</th>
                      <th className="p-3 font-semibold">Estado</th>
                      <th className="p-3 font-semibold rounded-tr-lg">Fecha Creación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStaff ? (
                      <tr><td colSpan="4" className="p-4 text-center text-surface-500">Cargando...</td></tr>
                    ) : (
                      staffList.map(staff => (
                        <tr key={staff.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/30">
                          <td className="p-3 font-medium text-surface-900 dark:text-white">{staff.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-surface-200 dark:bg-surface-700 text-xs rounded font-semibold text-surface-700 dark:text-surface-300">
                              {staff.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-bold flex items-center w-max gap-1 ${staff.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {staff.isActive ? <Check size={12}/> : null} {staff.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-3 text-surface-500">{new Date(staff.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* PACKAGES TAB */}
          {activeTab === 'packages' && user?.role === 'ADMIN' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Catálogo de Paquetes</h2>
                <p className="text-surface-500 text-sm mb-6 border-b border-surface-100 dark:border-surface-800 pb-4">Define los tipos de paquetes (ej. Paquete de 4 sesiones) que luego los pacientes podrán adquirir. Las citas podrán descontarse de estos paquetes.</p>
              </div>

              {/* Crear paquete */}
              <div className="bg-surface-50 dark:bg-surface-950/50 p-6 rounded-2xl border border-surface-200 dark:border-surface-800">
                <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2"><Plus size={18}/> Nuevo Paquete</h3>
                <form onSubmit={handleCreatePackage} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Nombre</label>
                    <input required type="text" placeholder="Ej: Paquete 4 Sesiones" value={newPackageName} onChange={e => setNewPackageName(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Sesiones en Total</label>
                    <input required type="number" min="1" value={newPackageSessions} onChange={e => setNewPackageSessions(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Precio Total (S/)</label>
                    <input required type="number" min="0" step="0.01" value={newPackagePrice} onChange={e => setNewPackagePrice(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" disabled={creatingPackage} className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors">
                      {creatingPackage ? 'Guardando...' : 'Añadir al Catálogo'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    <tr>
                      <th className="p-3 font-semibold rounded-tl-lg">Nombre</th>
                      <th className="p-3 font-semibold">Sesiones</th>
                      <th className="p-3 font-semibold">Precio Total</th>
                      <th className="p-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPackages ? (
                      <tr><td colSpan="4" className="p-4 text-center text-surface-500">Cargando...</td></tr>
                    ) : (
                      packageCatalogs.map(pkg => (
                        <tr key={pkg.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/30">
                          <td className="p-3 font-medium text-surface-900 dark:text-white">{pkg.name}</td>
                          <td className="p-3 text-surface-600 dark:text-surface-400">{pkg.totalSessions}</td>
                          <td className="p-3 font-mono text-primary-600 dark:text-primary-400 font-bold">S/ {parseFloat(pkg.price).toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-bold flex items-center w-max gap-1 ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {pkg.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                    {packageCatalogs.length === 0 && !loadingPackages && (
                      <tr><td colSpan="4" className="p-4 text-center text-surface-500">No hay paquetes en el catálogo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
