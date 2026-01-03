
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TaskStatus, Task } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ClipboardDocumentCheckIcon } from '../icons/ClipboardDocumentCheckIcon';
import { Skeleton } from './Skeleton';

const TaskBoard: React.FC = () => {
    const { tasks, currentUser, updateTask } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const myTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.assignedToId === currentUser.id);
    }, [tasks, currentUser]);

    const handleToggleStatus = (task: Task) => {
        const statusMap: Record<TaskStatus, TaskStatus> = {
            [TaskStatus.PENDING]: TaskStatus.IN_PROGRESS,
            [TaskStatus.IN_PROGRESS]: TaskStatus.COMPLETED,
            [TaskStatus.COMPLETED]: TaskStatus.PENDING
        };
        updateTask({ ...task, status: statusMap[task.status] });
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
                            <div className="flex justify-between items-start">
                                <Skeleton width="60%" height={20} />
                                <Skeleton width={40} height={16} />
                            </div>
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
                <p className="font-black uppercase tracking-widest text-sm">No tienes tareas asignadas</p>
                <p className="text-xs text-gray-400 mt-2">¡Buen trabajo manteniendo tu lista limpia!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-black text-xl text-gray-900 dark:text-white">Mis Tareas</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {myTasks.filter(t => t.status !== TaskStatus.COMPLETED).length} pendientes
                </span>
            </div>
            
            <div className="space-y-4">
                {myTasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-black/5 group flex items-start gap-4 transition-all duration-300 hover:shadow-md ${task.status === TaskStatus.COMPLETED ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''}`}
                    >
                        <button 
                            onClick={() => handleToggleStatus(task)}
                            className={`mt-1 p-1 rounded-xl transition-all transform active:scale-75 duration-300 shadow-sm
                                ${task.status === TaskStatus.COMPLETED 
                                    ? 'bg-green-500 text-white shadow-green-500/20 scale-100 rotate-0' 
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-300 hover:text-primary hover:scale-110'
                                }`}
                        >
                            <CheckCircleIcon className={`w-6 h-6 transition-all duration-500 ${task.status === TaskStatus.COMPLETED ? 'scale-100 rotate-0' : 'scale-75 -rotate-12 opacity-50'}`} />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <h4 className={`font-bold text-base truncate transition-all duration-500 ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-400 translate-x-1' : 'text-gray-900 dark:text-white'}`}>
                                    {task.title}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase flex-shrink-0 transition-opacity duration-500
                                    ${task.status === TaskStatus.COMPLETED ? 'opacity-30' : 'opacity-100'}
                                    ${task.priority === 'Alta' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}
                                `}>
                                    {task.priority}
                                </span>
                            </div>
                            <p className={`text-xs transition-all duration-500 line-clamp-2 leading-relaxed ${task.status === TaskStatus.COMPLETED ? 'text-gray-400 opacity-50' : 'text-gray-500'}`}>{task.description}</p>
                            <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                                <div className={`p-1 rounded-md transition-colors ${new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED ? 'text-red-400' : ''}`}>
                                    <ClockIcon className="w-3.5 h-3.5 inline mr-1" />
                                    Vence: {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </div>
                                <span className="text-gray-200 dark:text-gray-700">•</span>
                                <span className={`transition-colors ${task.status === TaskStatus.IN_PROGRESS ? 'text-primary' : task.status === TaskStatus.COMPLETED ? 'text-green-500/50' : ''}`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskBoard;
