
import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TaskStatus, Task } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ClipboardDocumentCheckIcon } from '../icons/ClipboardDocumentCheckIcon';

const TaskBoard: React.FC = () => {
    const { tasks, currentUser, updateTask } = useContext(AuthContext);

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

    if (myTasks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl text-center border border-black/5 opacity-50 flex flex-col items-center">
                <ClipboardDocumentCheckIcon className="w-12 h-12 mb-4 text-gray-400" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No tienes tareas asignadas</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-black text-lg">Mis Tareas</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase">{myTasks.filter(t => t.status !== TaskStatus.COMPLETED).length} pendientes</span>
            </div>
            {myTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-black/5 group flex items-start gap-4 transition-all hover:shadow-md">
                    <button 
                        onClick={() => handleToggleStatus(task)}
                        className={`mt-1 p-1 rounded-lg transition-all ${task.status === TaskStatus.COMPLETED ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-300 hover:text-primary'}`}
                    >
                        <CheckCircleIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-300' : 'text-gray-900 dark:text-white'}`}>{task.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${task.priority === 'Alta' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>{task.priority}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                            <ClockIcon className="w-3 h-3" />
                            Vence: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskBoard;
