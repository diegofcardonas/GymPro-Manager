
import { Task, TaskStatus } from '../types';

export const MOCK_TASKS: Task[] = [
    {
        id: 'task1',
        title: 'Revisión de Inventario',
        description: 'Verificar el stock de suplementos y bebidas en la tienda.',
        assignedToId: 'r1', // Mariana (Recepcionista)
        assignedById: '1', // Admin
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: TaskStatus.PENDING,
        priority: 'Alta'
    },
    {
        id: 'task2',
        title: 'Mantenimiento de Máquinas de Cardio',
        description: 'Llamar al técnico para revisión trimestral de las caminadoras.',
        assignedToId: 'm1', // Roberto (Gerente)
        assignedById: '1',
        dueDate: new Date(Date.now() + 172800000).toISOString(), // In 2 days
        status: TaskStatus.IN_PROGRESS,
        priority: 'Media'
    },
    {
        id: 'task3',
        title: 'Actualizar Planes de Entrenamiento',
        description: 'Revisar y actualizar rutinas de Samantha Williams y Michael Brown.',
        assignedToId: 't1', // Carlos (Entrenador)
        assignedById: '1',
        dueDate: new Date(Date.now() + 43200000).toISOString(), // Tomorrow morning
        status: TaskStatus.PENDING,
        priority: 'Alta'
    },
    {
        id: 'task4',
        title: 'Organizar Clase Especial',
        description: 'Planificar evento de Zumba para el próximo sábado.',
        assignedToId: 't2', // Valentina
        assignedById: 'm1',
        dueDate: new Date(Date.now() + 345600000).toISOString(), // In 4 days
        status: TaskStatus.PENDING,
        priority: 'Baja'
    }
];
