import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    clinicName: 'PsyClinic Pro',
    primaryColor: '#0f766e',
    logo: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings(res.data);
        applyThemeColor(res.data.primaryColor);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const res = await api.put('/settings', newSettings);
      setSettings(res.data);
      applyThemeColor(res.data.primaryColor);
      toast.success('Configuración actualizada');
    } catch (error) {
      toast.error('Error al actualizar configuración');
      throw error;
    }
  };

  const applyThemeColor = (hexColor) => {
    if (!hexColor) return;
    
    // We can inject a CSS variable to root to override tailwind's primary color
    // A more advanced approach involves generating HSL values, but for a simple hex:
    const root = document.documentElement;
    // We set a custom property that we can use in Tailwind or just use it for specific elements if needed.
    // For full tailwind primary override, we would need to provide HSL values if our tailwind uses HSL, 
    // or we can just set a variable and configure tailwind to use it.
    // Since we don't know the exact tailwind config, we'll set it as a raw hex var.
    root.style.setProperty('--color-primary-brand', hexColor);
    
    // Optionally, we could try to set it dynamically, but Tailwind's primary classes (e.g. text-primary-600) 
    // are compiled at build time unless configured with CSS variables. 
    // We will use this variable in specific places or adjust the tailwind config later.
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
