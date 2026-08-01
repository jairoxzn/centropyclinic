import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientDetail from './pages/patients/PatientDetail';

import PsychologistList from './pages/psychologists/PsychologistList';
import PsychologistForm from './pages/psychologists/PsychologistForm';
import PsychologistDetail from './pages/psychologists/PsychologistDetail';
import SpecialtyList from './pages/specialties/SpecialtyList';
import OfficeList from './pages/offices/OfficeList';
import ScheduleConfig from './pages/schedules/ScheduleConfig';
import Settings from './pages/settings/Settings';

import CalendarView from './pages/appointments/Calendar';
import AppointmentForm from './pages/appointments/AppointmentForm';

import PaymentList from './pages/payments/PaymentList';
import CashRegister from './pages/cash-register/CashRegister';

import ClinicalRecordList from './pages/clinical-records/ClinicalRecordList';
import ClinicalRecordDetail from './pages/clinical-records/ClinicalRecordDetail';
import ClinicalRecordForm from './pages/clinical-records/ClinicalRecordForm';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Citas y Calendario */}
          <Route path="appointments" element={<CalendarView />} />
          <Route path="appointments/new" element={<AppointmentForm />} />
          <Route path="appointments/:id/edit" element={<AppointmentForm />} />

          {/* Pagos y Caja */}
          <Route path="payments" element={<PaymentList />} />
          <Route path="cash-register" element={<CashRegister />} />

          {/* Historia Clínica */}
          <Route path="clinical-records" element={<ClinicalRecordList />} />
          <Route path="clinical-records/:patientId" element={<ClinicalRecordDetail />} />
          <Route path="clinical-records/:patientId/new" element={<ClinicalRecordForm />} />
          <Route path="clinical-records/:patientId/edit/:recordId" element={<ClinicalRecordForm />} />

          {/* Pacientes */}
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/new" element={<PatientForm />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="patients/:id/edit" element={<PatientForm />} />
          
          {/* Psicólogos, Especialidades, Consultorios, Horarios */}
          <Route path="psychologists" element={<PsychologistList />} />
          <Route path="psychologists/new" element={<PsychologistForm />} />
          <Route path="psychologists/:id" element={<PsychologistDetail />} />
          <Route path="psychologists/:id/edit" element={<PsychologistForm />} />
          <Route path="specialties" element={<SpecialtyList />} />
          <Route path="offices" element={<OfficeList />} />
          <Route path="schedules" element={<ScheduleConfig />} />

          {/* Configuración */}
          <Route path="settings" element={<Settings />} />

          {/* Add more routes here as we build them */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
