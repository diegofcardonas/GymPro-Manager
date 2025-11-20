
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { GymClass, Role, User } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../shared/ConfirmationModal';

// Helper to generate consistent pastel colors based on string input
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return {
        bg: `hsl(${hue}, 70%, 90%)`,
        text: `hsl(${hue}, 80%, 30%)`,
        border: `hsl(${hue}, 60%, 80%)`
    };
};

const ClassSchedule: React.FC = () => {
    const { t } = useTranslation();
    const { users, gymClasses, addGymClass, updateGymClass, deleteGymClass } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<GymClass | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [selectedDateForNewClass, setSelectedDateForNewClass] = useState<string>('');
    const [selectedTrainerFilter, setSelectedTrainerFilter] = useState<string>('all');
    const [classToDelete, setClassToDelete] = useState<string | null>(null);

    const trainers = useMemo(() => users.filter(u => u.role === Role.TRAINER), [users]);
    
    const filteredClasses = useMemo(() => {
        let result = [...gymClasses];
        if (selectedTrainerFilter !== 'all') {
            result = result.filter(c => c.trainerId === selectedTrainerFilter);
        }
        return result.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [gymClasses, selectedTrainerFilter]);

    const handleAddNew = (date?: string) => {
        setEditingClass(null);
        if (date) {
            setSelectedDateForNewClass(date);
        } else {
            setSelectedDateForNewClass('');
        }
        setIsModalOpen(true);
    };

    const handleEdit = (gymClass: GymClass) => {
        setEditingClass(gymClass);
        setSelectedDateForNewClass('');
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.nativeEvent.stopImmediatePropagation();
        setClassToDelete(id);
    };

    const confirmDelete = () => {
        if (classToDelete) {
            deleteGymClass(classToDelete);
            setClassToDelete(null);
        }
    };

    const handleSave = (gymClass: Omit<GymClass, 'id'> & { id?: string }) => {
        if (gymClass.id) {
            updateGymClass(gymClass as GymClass);
        } else {
            addGymClass({ ...gymClass, bookedClientIds: [] });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard.classSchedule')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Organiza y visualiza las sesiones de entrenamiento.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* View Toggles */}
                    <div className="flex items-center bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title="Vista Calendario"
                        >
                            <CalendarDaysIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                             title="Vista Lista"
                        >
                            <ClipboardListIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Trainer Filter */}
                    <div className="relative flex-grow lg:flex-grow-0 min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FilterIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={selectedTrainerFilter}
                            onChange={(e) => setSelectedTrainerFilter(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-primary focus:border-primary text-gray-900 dark:text-white shadow-sm appearance-none"
                        >
                            <option value="all">{t('admin.userManagement.allTrainers')}</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={() => handleAddNew()} className="flex-grow lg:flex-grow-0 px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 text-primary-foreground shadow-lg hover:shadow-primary/30">
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">{t('general.create')}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-xl overflow-hidden min-h-[650px]">
                {viewMode === 'calendar' ? (
                    <CalendarView 
                        classes={filteredClasses} 
                        trainers={trainers}
                        onDateClick={handleAddNew} 
                        onClassClick={handleEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredClasses.length > 0 ? filteredClasses.map(gymClass => {
                            const trainer = trainers.find(t => t.id === gymClass.trainerId);
                            const { bg, text, border } = stringToColor(gymClass.name);
                            
                            return (
                                <div key={gymClass.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 dark:hover:bg-gray-800 gap-4 transition-colors group cursor-pointer" onClick={() => handleEdit(gymClass)}>
                                    <div className="flex items-start gap-4">
                                         <div className="w-2 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: text }}></div>
                                         <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">{gymClass.name}</p>
                                                <span 
                                                    className="px-2 py-0.5 text-xs font-bold rounded-md border"
                                                    style={{ backgroundColor: bg, color: text, borderColor: border }}
                                                >
                                                    {trainer?.name || t('general.unassigned')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {new Date(gymClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(gymClass.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="flex items-center gap-1"><CalendarDaysIcon className="w-4 h-4"/> {new Date(gymClass.startTime).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4"/> {gymClass.bookedClientIds.length} / {gymClass.capacity}</span>
                                            </p>
                                         </div>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0 self-end sm:self-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(gymClass); }} className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary bg-gray-100 dark:bg-gray-700 rounded-lg hover:scale-105 transition-transform"><PencilIcon className="h-5 w-5" /></button>
                                        <button onClick={(e) => handleDelete(gymClass.id, e)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:scale-105 transition-transform"><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <CalendarDaysIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No hay clases programadas con estos filtros.</p>
                                <button onClick={() => handleAddNew()} className="mt-4 text-primary hover:underline font-medium">Crear una clase ahora</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ClassModal
                    gymClass={editingClass}
                    trainers={trainers}
                    preSelectedDate={selectedDateForNewClass}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            
            <ConfirmationModal 
                isOpen={!!classToDelete}
                onClose={() => setClassToDelete(null)}
                onConfirm={confirmDelete}
                title={t('general.warning')}
                message={t('general.confirmDelete')}
                confirmText={t('general.delete')}
                isDangerous
            />
        </div>
    );
};

const CalendarView: React.FC<{ 
    classes: GymClass[]; 
    trainers: User[];
    onDateClick: (date: string) => void; 
    onClassClick: (gymClass: GymClass) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}> = ({ classes, trainers, onDateClick, onClassClick, onDelete }) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        // 0 = Sunday, 1 = Monday ...
        const day = new Date(year, month, 1).getDay();
        // Adjust to make Monday = 0
        return day === 0 ? 6 : day - 1;
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const prevMonthDate = new Date(year, month - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

    const days = useMemo(() => {
        const dayList = [];
        for (let i = 0; i < firstDay; i++) {
            dayList.push({ 
                day: daysInPrevMonth - firstDay + 1 + i, 
                month: month - 1, 
                year: month === 0 ? year - 1 : year,
                isCurrentMonth: false 
            });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            dayList.push({ day: i, month, year, isCurrentMonth: true });
        }
        const remainingCells = 42 - dayList.length;
        for (let i = 1; i <= remainingCells; i++) {
            dayList.push({ 
                day: i, 
                month: month + 1, 
                year: month === 11 ? year + 1 : year,
                isCurrentMonth: false 
            });
        }
        return dayList;
    }, [year, month, daysInMonth, firstDay, daysInPrevMonth]);

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const weekDays = [t('days.Monday'), t('days.Tuesday'), t('days.Wednesday'), t('days.Thursday'), t('days.Friday'), t('days.Saturday'), t('days.Sunday')];

    return (
        <div className="flex flex-col h-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize tracking-tight">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-0.5">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                        <button onClick={goToToday} className="px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">Hoy</button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {day.substring(0, 3)}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 dark:bg-gray-700 gap-px border-b border-gray-200 dark:border-gray-700">
                {days.map((d, index) => {
                    const cellDateStr = new Date(d.year, d.month, d.day).toDateString();
                    const isToday = cellDateStr === new Date().toDateString();
                    
                    const dayClasses = classes.filter(c => {
                        const cDate = new Date(c.startTime);
                        return cDate.getDate() === d.day && cDate.getMonth() === d.month && cDate.getFullYear() === d.year;
                    }).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    // Mobile: Show simplified dots or just 1 class. Desktop: Show max 3 + button
                    const maxVisible = 3;
                    const overflowCount = dayClasses.length - maxVisible;

                    return (
                        <div 
                            key={index} 
                            onClick={() => onDateClick(new Date(d.year, d.month, d.day).toISOString().split('T')[0])}
                            className={`min-h-[120px] group bg-white dark:bg-gray-800 p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer flex flex-col gap-1 relative
                                ${!d.isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/50 text-gray-400' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-transform ${isToday ? 'bg-red-500 text-white shadow-md scale-110' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {d.day}
                                </div>
                                {/* Add Icon on Hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400">
                                        <PlusIcon className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-1.5 mt-1 overflow-hidden">
                                {dayClasses.slice(0, maxVisible).map((cls) => {
                                    const { bg, text, border } = stringToColor(cls.name);
                                    return (
                                        <div
                                            key={cls.id}
                                            onClick={(e) => { e.stopPropagation(); onClassClick(cls); }}
                                            className="text-left px-2 py-1 rounded-md text-[10px] lg:text-xs font-semibold truncate border shadow-sm transition-transform hover:scale-[1.02] w-full relative overflow-hidden flex justify-between items-center group/item"
                                            style={{ backgroundColor: bg, color: text, borderColor: border }}
                                            title={`${cls.name} - ${trainers.find(t=>t.id===cls.trainerId)?.name}`}
                                        >
                                            <div className="truncate flex-1">
                                                <span className="mr-1 opacity-70 font-mono">{new Date(cls.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                {cls.name}
                                            </div>
                                            <button onClick={(e) => onDelete(cls.id, e)} className="ml-1 p-0.5 rounded hover:bg-red-500 hover:text-white text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity md:opacity-0 md:group-hover/item:opacity-100 opacity-100">
                                                 <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {overflowCount > 0 && (
                                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center bg-gray-100 dark:bg-gray-700 rounded-md py-0.5">
                                        +{overflowCount} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ClassModal: React.FC<{
    gymClass: GymClass | null;
    trainers: User[];
    preSelectedDate?: string;
    onSave: (gymClass: Omit<GymClass, 'id'> & { id?: string }) => void;
    onClose: () => void;
}> = ({ gymClass, trainers, preSelectedDate, onSave, onClose }) => {
    const { t } = useTranslation();
    
    // Initialize state with either existing class data OR defaults (possibly using preSelectedDate)
    const initialDate = gymClass 
        ? new Date(gymClass.startTime).toISOString().split('T')[0] 
        : preSelectedDate || new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({ 
        name: '', description: '', trainerId: '', capacity: 10, bookedClientIds: [] as string[]
    });
    const [date, setDate] = useState(initialDate);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    useEffect(() => {
        if (gymClass) {
            setFormData({
                name: gymClass.name,
                description: gymClass.description,
                trainerId: gymClass.trainerId,
                capacity: gymClass.capacity,
                bookedClientIds: gymClass.bookedClientIds
            });
            setDate(new Date(gymClass.startTime).toISOString().split('T')[0]);
            setStartTime(new Date(gymClass.startTime).toTimeString().substring(0,5));
            setEndTime(new Date(gymClass.endTime).toTimeString().substring(0,5));
        } else {
            // Reset for new class
             setFormData({ name: '', description: '', trainerId: '', capacity: 10, bookedClientIds: [] });
             setDate(preSelectedDate || new Date().toISOString().split('T')[0]);
             setStartTime('09:00');
             setEndTime('10:00');
        }
    }, [gymClass, preSelectedDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        onSave({
            ...formData,
            id: gymClass?.id,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            capacity: Number(formData.capacity)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{gymClass ? 'Editar Clase' : 'Nueva Clase'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Define los detalles de la sesión.</p>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Clase</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="ej. Yoga Matutino" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="Detalles de la clase..." />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entrenador</label>
                        <select name="trainerId" value={formData.trainerId} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" required>
                            <option value="">Selecciona un entrenador...</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" required />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidad Máxima</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Inicio</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Fin</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-gray-900 dark:text-white" required />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-xl font-semibold text-gray-800 dark:text-white transition-colors">{t('general.cancel')}</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-primary-foreground transition-colors shadow-lg hover:shadow-primary/30">{t('general.save')}</button>
                </div>
            </form>
        </div>
    );
};

export default ClassSchedule;
