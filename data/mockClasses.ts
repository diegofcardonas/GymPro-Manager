
import { GymClass } from '../types';

const getISODate = (dayOffset: number, hour: number, durationMinutes: number): { start: string, end: string } => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + dayOffset);
    startDate.setHours(hour, 0, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    return { start: startDate.toISOString(), end: endDate.toISOString() };
};

export const MOCK_CLASSES: GymClass[] = [
    {
        id: 'c1',
        name: 'HIIT Matutino',
        description: 'Entrenamiento de intervalos de alta intensidad para empezar el día. ¡Prepárate para sudar!',
        trainerId: 't1', // Carlos Vives
        startTime: getISODate(1, 8, 45).start, // Tomorrow at 8:00 AM
        endTime: getISODate(1, 8, 45).end,
        capacity: 15,
        bookedClientIds: ['2', '5', '9'],
    },
    {
        id: 'c2',
        name: 'Vinyasa Yoga Flow',
        description: 'Una clase de yoga dinámica centrada en el movimiento sincronizado con la respiración.',
        trainerId: 't2', // Daniela Pineda
        startTime: getISODate(1, 18, 60).start, // Tomorrow at 6:00 PM
        endTime: getISODate(1, 18, 60).end,
        capacity: 20,
        bookedClientIds: ['6', '10', '14', '20'],
    },
    {
        id: 'c3',
        name: 'Fuerza y Acondicionamiento',
        description: 'Construye fuerza bruta y mejora tu condición general con este entrenamiento intenso.',
        trainerId: 't3', // Bernardo Arias
        startTime: getISODate(2, 17, 75).start, // Day after tomorrow at 5:00 PM
        endTime: getISODate(2, 17, 75).end,
        capacity: 12,
        bookedClientIds: ['25', '29', '34'],
    },
    {
        id: 'c4',
        name: 'Cardio de Resistencia',
        description: 'Supera tus límites con una mezcla de correr, ciclismo y remo.',
        trainerId: 't4', // Sara Correa
        startTime: getISODate(2, 9, 60).start, // Day after tomorrow at 9:00 AM
        endTime: getISODate(2, 9, 60).end,
        capacity: 18,
        bookedClientIds: [],
    },
    {
        id: 'c5',
        name: 'Fundamentos de Powerlifting',
        description: 'Aprende los fundamentos de los tres grandes levantamientos: sentadilla, banca y peso muerto.',
        trainerId: 't5', // Juan Castro
        startTime: getISODate(3, 19, 90).start, // In 3 days at 7:00 PM
        endTime: getISODate(3, 19, 90).end,
        capacity: 10,
        bookedClientIds: ['3', '15', '21'],
    },
];
