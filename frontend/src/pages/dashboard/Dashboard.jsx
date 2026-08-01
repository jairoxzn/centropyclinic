import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserRound, CalendarCheck, CalendarX, 
  TrendingUp, DollarSign, Wallet, Activity
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, delay = 0 }) => (
  <div 
    className="relative overflow-hidden bg-white dark:bg-surface-900/80 p-6 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.split(' ')[0]}`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-surface-900 dark:text-white mt-2 tracking-tight">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} shadow-inner`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
    </div>
    {trend && (
      <div className="mt-5 flex items-center text-sm bg-surface-50 dark:bg-surface-950/50 w-max px-3 py-1.5 rounded-full border border-surface-100 dark:border-surface-800">
        <span className={`font-bold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
          {trendValue}
        </span>
        <span className="text-surface-500 dark:text-surface-400 ml-2 font-medium">este mes</span>
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
    refetchInterval: 60000,
  });

  const { data: monthlyChart } = useQuery({
    queryKey: ['dashboardMonthlyChart'],
    queryFn: () => api.get('/dashboard/chart/monthly').then(res => res.data),
  });

  const { data: weeklyChart } = useQuery({
    queryKey: ['dashboardWeeklyChart'],
    queryFn: () => api.get('/dashboard/chart/weekly').then(res => res.data),
  });

  if (statsLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-surface-100 dark:bg-surface-800 h-36 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val || 0);

  const barChartData = {
    labels: monthlyChart?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: monthlyChart?.map(d => d.income) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        borderRadius: 8,
        borderSkipped: false,
      }
    ],
  };

  const lineChartData = {
    labels: weeklyChart?.map(d => d.day) || [],
    datasets: [
      {
        label: 'Ingresos Diarios',
        data: weeklyChart?.map(d => d.income) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10B981',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }
      },
      x: { 
        grid: { display: false, drawBorder: false },
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }
      },
    },
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Hola, <span className="text-primary-600 dark:text-primary-400">{user?.email?.split('@')[0] || 'Usuario'}</span> 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 text-lg">Aquí tienes el resumen de la clínica de hoy.</p>
        </div>
        <div className="bg-white dark:bg-surface-900 px-4 py-2 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-medium text-surface-600 dark:text-surface-300">Sistema Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pacientes" 
          value={stats.totalPatients} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
          trend="up" trendValue={stats.newPatients + " nuevos"}
          delay={0}
        />
        <StatCard 
          title="Citas Hoy" 
          value={stats.todayAppointments} 
          icon={CalendarCheck} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" 
          delay={50}
        />
        <StatCard 
          title="Ingresos del Día" 
          value={formatCurrency(stats.dailyIncome)} 
          icon={DollarSign} 
          colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" 
          delay={100}
        />
        <StatCard 
          title="Saldo Pendiente" 
          value={formatCurrency(stats.pendingBalance)} 
          icon={Wallet} 
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" 
          delay={150}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl p-6 rounded-3xl border border-surface-200/60 dark:border-surface-800/60 shadow-lg shadow-surface-200/20 dark:shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
              <Activity className="text-primary-500" size={20} />
              Ingresos Últimos 7 Días
            </h3>
          </div>
          <div className="h-[250px] w-full">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl p-6 rounded-3xl border border-surface-200/60 dark:border-surface-800/60 shadow-lg shadow-surface-200/20 dark:shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
              <Activity className="text-primary-500" size={20} />
              Ingresos Mensuales (Últimos 6 meses)
            </h3>
          </div>
          <div className="h-[250px] w-full">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        
        {/* Top Psychologists */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Psicólogos con más citas (Histórico)</h3>
          {stats.topPsychologists?.length > 0 ? (
            <div className="space-y-4">
              {stats.topPsychologists.map((psy, i) => (
                <div key={psy.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800/50 border border-transparent hover:border-surface-200 dark:hover:border-surface-700 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                      {psy.firstName.charAt(0)}{psy.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-surface-900 dark:text-white text-base">{psy.firstName} {psy.lastName}</h4>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{psy.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{psy._count.appointments}</span>
                    <p className="text-xs text-surface-500 uppercase font-semibold">Citas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-8">No hay datos suficientes</p>
          )}
        </div>

        {/* Top Specialties */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Especialidades Demandadas</h3>
          {stats.topSpecialties?.length > 0 ? (
            <div className="space-y-5">
              {stats.topSpecialties.map((spec, i) => {
                // Calculate percentage relative to the first (highest) item
                const maxCount = stats.topSpecialties[0]._count.appointments;
                const percentage = maxCount > 0 ? (spec._count.appointments / maxCount) * 100 : 0;
                
                return (
                  <div key={spec.id} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-surface-800 dark:text-surface-200">{spec.name}</span>
                      <span className="text-sm font-bold text-surface-500">{spec._count.appointments} citas</span>
                    </div>
                    <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-primary-500 h-2.5 rounded-full relative group-hover:bg-primary-400 transition-colors"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-8">No hay datos suficientes</p>
          )}
        </div>
      </div>
    </div>
  );
}
