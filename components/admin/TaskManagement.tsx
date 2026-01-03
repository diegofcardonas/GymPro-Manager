
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

    const columns = [
        { status: TaskStatus.PENDING, color: 'text-gray-400' },
        { status: TaskStatus.IN_PROGRESS, color: 'text-blue-500' },
        { status: TaskStatus.COMPLETED, color: 'text-green-500' }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('tasks.title')}</h2>
                    <p className="text-gray-500 font-medium">{t('nav.tasks')}</p>
                </div>
                <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-6 h-6" /> {t('tasks.newTask')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(({ status, color }) => (
                    <div key={status} className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-4xl min-h-[500px] flex flex-col border border-black/[0.03] dark:border-white/[0.03]">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] ${color}`}>
                                {t(`enums.TaskStatus.${status.replace(' ', '_').toUpperCase()}`)}
                            </h3>
                            <span className="bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm">
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
                                    onDelete={() => { if(window.confirm(t('general.confirmDelete'))) deleteTask(task.id); }}
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
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-black/[0.03] dark:border-white/[0.03] group relative transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}>
                    {t(`enums.TaskPriority.${task.priority}`)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg hover:text-primary transition-colors"><PencilIcon className="w-4 h-4"/></button>
                    <button onClick={onDelete} className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 truncate">{task.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
            
            <div className="flex items-center justify-between border-t border-gray-50 dark:border-white/[0.03] pt-3">
                <div className="flex items-center gap-2" title={`${t('tasks.assignTo')}: ${assignee?.name}`}>
                    <img src={assignee?.avatarUrl} className="w-6 h-6 rounded-full border border-white dark:border-gray-700 shadow-sm" alt="" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[80px]">{assignee?.name.split(' ')[0]}</span>
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
                <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{task ? t('tasks.editTask') : t('tasks.newTask')}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('tasks.taskName')}</label>
                        <input 
                            type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('tasks.description')}</label>
                        <textarea 
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm min-h-[100px] shadow-inner font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1">
                                <UserGroupIcon className="w-3 h-3" /> {t('tasks.assignTo')}
                            </label>
                            <select 
                                value={formData.assignedToId} onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white shadow-inner"
                            >
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({t(`enums.Role.${s.role}`)})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('tasks.dueDate')}</label>
                            <input 
                                type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('tasks.priority')}</label>
                            <div className="flex gap-2">
                                {(['Low', 'Medium', 'High'] as TaskPriority[]).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({...formData, priority: p})}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all border-2
                                            ${formData.priority === p 
                                                ? (p === 'High' ? 'bg-red-500 border-red-500 text-white' : p === 'Medium' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-blue-500 border-blue-500 text-white')
                                                : 'bg-white dark:bg-gray-900 border-black/5 dark:border-white/5 text-gray-400'}`}
                                    >
                                        {t(`enums.TaskPriority.${p}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('tasks.status')}</label>
                            <select 
                                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white appearance-none shadow-inner"
                            >
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{t(`enums.TaskStatus.${s.replace(' ', '_').toUpperCase()}`)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row gap-4">
                    <button onClick={onClose} className="flex-1 px-8 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-2xl font-black transition-all border border-black/5 dark:border-white/5 shadow-sm uppercase text-xs tracking-widest">
                        {t('general.cancel')}
                    </button>
                    <button onClick={() => onSave(formData)} className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest">
                        {t('general.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskManagement;
