import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Calendar as CalendarIcon, Plus, UserRound, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../services/api';
import Button from '../../components/ui/Button';

export default function CalendarView() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  
  const [selectedPsy, setSelectedPsy] = useState('');
  const [view, setView] = useState('timeGridWeek'); // timeGridDay, timeGridWeek, dayGridMonth

  const { data: psychologists } = useQuery({
    queryKey: ['psychologists'],
    queryFn: () => api.get('/psychologists').then(res => res.data),
  });

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  }, [selectedPsy]);

  const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
    try {
      const { startStr, endStr } = fetchInfo;
      const res = await api.get(`/appointments/calendar?start=${startStr}&end=${endStr}${selectedPsy ? `&psychologistId=${selectedPsy}` : ''}`);
      
      const formattedEvents = res.data.map(apt => ({
        id: apt.id,
        title: `${apt.patient.firstName} - ${apt.specialty.name}`,
        start: `${apt.date.split('T')[0]}T${apt.startTime}`,
        end: `${apt.date.split('T')[0]}T${apt.endTime}`,
        backgroundColor: apt.status === 'RESERVED' ? '#f59e0b' : apt.status === 'CONFIRMED' ? '#3b82f6' : apt.status === 'ATTENDED' ? '#10b981' : '#ef4444',
        borderColor: 'transparent',
        extendedProps: {
          status: apt.status,
          patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
          psychologistName: `${apt.psychologist.firstName} ${apt.psychologist.lastName}`,
          specialtyName: apt.specialty.name,
        }
      }));
      successCallback(formattedEvents);
    } catch (error) {
      console.error(error);
      failureCallback(error);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: (id) => api.patch(`/appointments/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-events']);
      toast.success('Cita cancelada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al cancelar la cita')
  });

  const handleEventClick = (info) => {
    const { event } = info;
    const { extendedProps } = event;

    // Show details modal using SweetAlert
    Swal.fire({
      title: 'Detalle de la Cita',
      html: `
        <div class="text-left space-y-3 mt-4">
          <p><strong>Paciente:</strong> ${extendedProps.patientName}</p>
          <p><strong>Psicólogo:</strong> ${extendedProps.psychologistName}</p>
          <p><strong>Especialidad:</strong> ${extendedProps.specialtyName}</p>
          <p><strong>Fecha:</strong> ${event.start.toLocaleDateString()}</p>
          <p><strong>Hora:</strong> ${event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.end ? event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
          <p><strong>Estado:</strong> 
            <span class="px-2 py-1 rounded text-xs font-bold ${
              extendedProps.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
              extendedProps.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
              extendedProps.status === 'ATTENDED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }">${extendedProps.status}</span>
          </p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: extendedProps.status === 'RESERVED' || extendedProps.status === 'CONFIRMED',
      confirmButtonText: 'Ver/Editar',
      cancelButtonText: 'Cerrar',
      denyButtonText: 'Cancelar Cita',
      confirmButtonColor: '#3B82F6',
      denyButtonColor: '#EF4444',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/appointments/${event.id}/edit`);
      } else if (result.isDenied) {
        Swal.fire({
          title: '¿Confirmar cancelación?',
          text: 'Esta acción cambiará el estado de la cita a cancelada.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, cancelar cita'
        }).then((confirmRes) => {
          if (confirmRes.isConfirmed) {
            cancelMutation.mutate(event.id);
          }
        });
      }
    });
  };

  const handleDateSelect = (selectInfo) => {
    // Only allow selection in timeGrid views where we have specific times
    if (selectInfo.view.type === 'dayGridMonth') {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.changeView('timeGridDay', selectInfo.startStr);
      return;
    }

    const start = selectInfo.startStr;
    navigate(`/appointments/new?start=${start}&psychologistId=${selectedPsy}`);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="flex flex-col p-1 text-xs overflow-hidden h-full">
        <span className="font-bold truncate">{eventInfo.event.title}</span>
        <span className="truncate opacity-90">{eventInfo.event.extendedProps.patientName}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-primary-500" /> Calendario de Citas
          </h1>
          <p className="text-surface-600 dark:text-surface-400">Gestiona las reservas y horarios.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <select
              value={selectedPsy}
              onChange={(e) => setSelectedPsy(e.target.value)}
              className="pl-9 h-10 w-full rounded-lg border border-surface-300 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-surface-700 dark:bg-surface-950 dark:text-white"
            >
              <option value="">Todos los psicólogos</option>
              {psychologists?.map(psy => (
                <option key={psy.id} value={psy.id}>
                  {psy.firstName} {psy.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <Link to="/appointments/new">
            <Button>
              <Plus size={20} className="mr-2" /> Nueva Cita
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4 flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 min-h-0 calendar-container">
          {/* We define some CSS specifically for FullCalendar inside this container via the main stylesheet */}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={esLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            events={fetchEvents}
            eventClick={handleEventClick}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            eventContent={renderEventContent}
            height="100%"
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '08:00',
              endTime: '20:00',
            }}
          />
        </div>
      </div>

      <style>{`
        /* FullCalendar Customizations for Dark Mode and Theme */
        .calendar-container {
          --fc-border-color: var(--color-surface-200);
          --fc-button-bg-color: var(--color-surface-100);
          --fc-button-border-color: var(--color-surface-300);
          --fc-button-text-color: var(--color-surface-700);
          --fc-button-hover-bg-color: var(--color-surface-200);
          --fc-button-hover-border-color: var(--color-surface-400);
          --fc-button-active-bg-color: var(--color-primary-600);
          --fc-button-active-border-color: var(--color-primary-600);
          --fc-button-active-text-color: #fff;
          --fc-today-bg-color: var(--color-primary-50);
          --fc-event-bg-color: var(--color-primary-500);
          --fc-event-border-color: var(--color-primary-600);
        }
        
        .dark .calendar-container {
          --fc-border-color: var(--color-surface-800);
          --fc-button-bg-color: var(--color-surface-800);
          --fc-button-border-color: var(--color-surface-700);
          --fc-button-text-color: var(--color-surface-300);
          --fc-button-hover-bg-color: var(--color-surface-700);
          --fc-button-hover-border-color: var(--color-surface-600);
          --fc-today-bg-color: rgba(59, 130, 246, 0.1);
        }

        .fc-theme-standard .fc-scrollgrid { border-radius: 0.5rem; overflow: hidden; }
        .fc .fc-button { text-transform: capitalize; border-radius: 0.5rem; }
        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 700; color: var(--color-surface-900); }
        .dark .fc .fc-toolbar-title { color: white; }
        .fc-event { border-radius: 4px; border: none; cursor: pointer; transition: transform 0.1s; }
        .fc-event:hover { transform: scale(1.02); filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
