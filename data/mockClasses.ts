
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
        name: 'HIIT Matutino 🔥',
        description: 'Entrenamiento de intervalos de alta intensidad para quemar grasa y mejorar resistencia.',
        trainerId: 't1', // Carlos
        startTime: getISODate(0, 7, 45).start, // Today 7am
        endTime: getISODate(0, 7, 45).end,
        capacity: 15,
        bookedClientIds: ['2', '5'],
    },
    {
        id: 'c2',
        name: 'Yoga Flow 🧘‍♂️',
        description: 'Clase de Vinyasa Yoga para mejorar flexibilidad y reducir estrés.',
        trainerId: 't2', // Valentina
        startTime: getISODate(0, 18, 60).start, // Today 6pm
        endTime: getISODate(0, 18, 60).end,
        capacity: 20,
        bookedClientIds: ['2', '4'],
    },
    {
        id: 'c3',
        name: 'CrossFit WOD 🏋️',
        description: 'Entrenamiento del día: Levantamientos olímpicos y gimnasia.',
        trainerId: 't3', // Andrés
        startTime: getISODate(1, 17, 60).start, // Tomorrow 5pm
        endTime: getISODate(1, 17, 60).end,
        capacity: 12,
        bookedClientIds: ['3', '5'],
    },
    {
        id: 'c4',
        name: 'Glúteos y Abdomen 🍑',
        description: 'Enfoque total en tren inferior y zona media.',
        trainerId: 't2', // Valentina
        startTime: getISODate(1, 19, 50).start, // Tomorrow 7pm
        endTime: getISODate(1, 19, 50).end,
        capacity: 25,
        bookedClientIds: ['2', '4', '5'],
    },
    {
        id: 'c5',
        name: 'Powerlifting Básico 💪',
        description: 'Técnica de Sentadilla, Banca y Peso Muerto para principiantes.',
        trainerId: 't1', // Carlos
        startTime: getISODate(2, 18, 90).start, // In 2 days 6pm
        endTime: getISODate(2, 18, 90).end,
        capacity: 10,
        bookedClientIds: ['3'],
    },
];
