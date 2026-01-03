
import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Task, TaskStatus, Role, User, TaskPriority } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

const TaskManagement: React.FC = () => {
    const { t } = useTranslation();
    const { tasks, users, currentUser, addTask, updateTask, deleteTask } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const staffUsers = useMemo(() => users.filter(u => u.role !== Role.CLIENT), [users]);

    const handleSave = (taskData: Omit<Task, 'id' | 'assignedById'>) => {
        if (!currentUser) return;
        if (editingTask) {
            updateTask({ ...editingTask, ...taskData });
        } else {
            addTask({ ...taskData, assignedById: currentUser.id });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Gestión de Tareas</h2>
                    <p className="text-gray-500 font-medium">Asigna y supervisa las responsabilidades del equipo.</p>
                </div>
                <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-6 h-6" /> Nueva Tarea
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map(status => (
                    <div key={status} className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-3xl min-h-[500px] flex flex-col border border-black/5 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">{status}</h3>
                            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </div>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            {tasks.filter(t => t.status === status).map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    users={users} 
                                    onEdit={() => { setEditingTask(task); setIsModalOpen(true); }}
                                    onDelete={() => { if(window.confirm('¿Eliminar tarea?')) deleteTask(task.id); }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <TaskModal 
                    task={editingTask} 
                    staff={staffUsers} 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

const TaskCard: React.FC<{ task: Task; users: User[]; onEdit: () => void; onDelete: () => void }> = ({ task, users, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const assignee = users.find(u => u.id === task.assignedToId);
    const priorityColors: Record<TaskPriority, string> = {
        High: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        Medium: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
        Low: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 group relative transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}>
                    {t(`tasks.priority.${task.priority}`)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg hover:text-primary transition-colors"><PencilIcon className="w-4 h-4"/></button>
                    <button onClick={onDelete} className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-2">{task.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
            
            <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-3">
                <div className="flex items-center gap-2" title={`Responsable: ${assignee?.name}`}>
                    <img src={assignee?.avatarUrl} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" alt="" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{assignee?.name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase">
                    <span className={new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED ? 'text-red-400' : ''}>
                        {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

const TaskModal: React.FC<{ task: Task | null; staff: User[]; onSave: (data: any) => void; onClose: () => void }> = ({ task, staff, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        assignedToId: task?.assignedToId || staff[0]?.id || '',
        dueDate: task?.dueDate.split('T')[0] || new Date().toISOString().split('T')[0],
        priority: task?.priority || 'Medium',
        status: task?.status || TaskStatus.PENDING
    });

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-4xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8 border-b border-black/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-1">Completa los detalles de la asignación</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Título</label>
                        <input 
                            type="text" placeholder="Ej: Revisar stock de cafetería" 
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Descripción</label>
                        <textarea 
                            placeholder="Detalles adicionales sobre la tarea..." 
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm min-h-[100px] shadow-inner"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1">
                                <UserGroupIcon className="w-3 h-3" /> Responsable
                            </label>
                            <div className="relative group">
                                <select 
                                    value={formData.assignedToId} onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white appearance-none shadow-inner"
                                >
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({t(`roles.${s.role}`)})</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <PlusIcon className="w-4 h-4 transform rotate-45" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Fecha Límite</label>
                            <input 
                                type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Prioridad</label>
                            <div className="flex gap-2">
                                {(['Low', 'Medium', 'High'] as TaskPriority[]).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({...formData, priority: p})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2
                                            ${formData.priority === p 
                                                ? (p === 'High' ? 'bg-red-50 border-red-500 text-red-600' : p === 'Medium' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-blue-50 border-blue-500 text-blue-600')
                                                : 'bg-white dark:bg-gray-900 border-transparent text-gray-400'}`}
                                    >
                                        {t(`tasks.priority.${p}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado Inicial</label>
                            <select 
                                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white appearance-none shadow-inner"
                            >
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-black/5 flex flex-col sm:flex-row gap-4">
                    <button onClick={onClose} className="flex-1 px-8 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-2xl font-black transition-all border border-black/5 shadow-sm uppercase text-xs tracking-widest">
                        Cancelar
                    </button>
                    <button onClick={() => onSave(formData)} className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest">
                        Guardar Tarea
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskManagement;
