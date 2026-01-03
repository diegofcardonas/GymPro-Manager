
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TaskStatus, Task, TaskPriority } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ClipboardDocumentCheckIcon } from '../icons/ClipboardDocumentCheckIcon';
import { Skeleton } from './Skeleton';
import { useTranslation } from 'react-i18next';

const TaskBoard: React.FC = () => {
    const { t } = useTranslation();
    const { tasks, currentUser, users, updateTask, addToast } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const myTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.assignedToId === currentUser.id)
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks, currentUser]);

    const handleUpdateStatus = (task: Task, newStatus: TaskStatus) => {
        if (task.status === newStatus) return;
        updateTask({ ...task, status: newStatus });
        addToast(t('tasks.statusUpdateSuccess'), 'success');
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-fade-in w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2 px-2">
                    <Skeleton width={120} height={28} />
                    <Skeleton width={80} height={16} />
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-black/5 flex items-start gap-4">
                        <Skeleton variant="circular" width={32} height={32} />
                        <div className="flex-1 space-y-3">
                            <Skeleton width="60%" height={20} />
                            <Skeleton width="90%" height={12} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (myTasks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-4xl text-center border border-black/5 opacity-50 flex flex-col items-center animate-fade-in w-full max-w-2xl mx-auto">
                <ClipboardDocumentCheckIcon className="w-16 h-16 mb-4 text-gray-400" />
                <p className="font-black uppercase tracking-widest text-sm">{t('tasks.noTasks')}</p>
                <p className="text-xs text-gray-400 mt-2">{t('tasks.noTasksDesc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in w-full max-w-2xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">{t('tasks.myTasks')}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-white uppercase bg-primary px-2.5 py-1 rounded-full shadow-sm">
                        {myTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
                    </span>
                </div>
            </div>
            
            <div className="space-y-4">
                {myTasks.map(task => {
                    const assigner = users.find(u => u.id === task.assignedById);
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;
                    
                    return (
                        <div 
                            key={task.id} 
                            className={`bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-black/[0.05] dark:border-white/[0.05] flex flex-col transition-all duration-300 hover:shadow-md ${task.status === TaskStatus.COMPLETED ? 'opacity-75 grayscale-[0.5]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                    <h4 className={`font-bold text-lg leading-tight transition-all ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {task.title}
                                    </h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {t('tasks.assignedBy')}: {assigner?.name || 'Admin'}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm
                                    ${task.priority === 'High' ? 'bg-red-500 text-white' : task.priority === 'Medium' ? 'bg-orange-400 text-white' : 'bg-blue-400 text-white'}
                                `}>
                                    {t(`enums.TaskPriority.${task.priority}`)}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{task.description}</p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-gray-50 dark:border-white/[0.03]">
                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                    <ClockIcon className="w-4 h-4" />
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                                </div>

                                <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-2xl shadow-inner border border-black/5 w-full sm:w-auto">
                                    {Object.values(TaskStatus).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(task, status)}
                                            className={`flex-1 sm:flex-initial px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all
                                                ${task.status === status 
                                                    ? (status === TaskStatus.COMPLETED ? 'bg-green-500 text-white shadow-lg' : status === TaskStatus.IN_PROGRESS ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-400 text-white shadow-lg')
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            {t(`enums.TaskStatus.${status.replace(' ', '_').toUpperCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskBoard;
