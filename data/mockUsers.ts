
import { User, Role, MembershipStatus, DailyRoutine, FitnessLevel } from '../types';
import { MOCK_TIERS } from './membershipTiers';

// Helper for routines
const ROUTINE_A: DailyRoutine[] = [
    { day: 'Monday', exercises: [{ name: 'Sentadilla Libre', sets: 4, reps: '10' }, { name: 'Prensa', sets: 3, reps: '12' }, { name: 'Extensiones', sets: 3, reps: '15' }] },
    { day: 'Wednesday', exercises: [{ name: 'Press Banca', sets: 4, reps: '10' }, { name: 'Aperturas', sets: 3, reps: '12' }, { name: 'Flexiones', sets: 3, reps: 'Al fallo' }] },
    { day: 'Friday', exercises: [{ name: 'Peso Muerto', sets: 4, reps: '8' }, { name: 'Remo Barra', sets: 4, reps: '10' }, { name: 'Jalón al Pecho', sets: 3, reps: '12' }] },
];

const defaultPrefs = { newMessages: true, routineUpdates: true, classReminders: true };
const defaultPrivacy = { profileVisibility: 'everyone' as const, activityVisibility: 'connections' as const, showInSearch: true };

const TRAINERS: User[] = [
    {
        id: 't1',
        name: 'Chris Validator',
        email: 'chris.v@gympro.com',
        password: 'password123',
        phone: '300-111-2222',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: Role.TRAINER,
        joinDate: '2022-01-15',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        skills: 'Hipertrofia, Powerlifting, Biomecánica',
        birthDate: '1990-05-20',
        age: 34,
        gender: 'Masculino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
    {
        id: 't2',
        name: 'Valentina Rojas',
        email: 'valentina.r@gympro.com',
        password: 'password123',
        phone: '310-333-4444',
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: Role.TRAINER,
        joinDate: '2022-06-10',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        skills: 'Yoga, Pilates, Entrenamiento Funcional',
        birthDate: '1995-08-12',
        age: 29,
        gender: 'Femenino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    }
];

const STAFF: User[] = [
    {
        id: 'r1',
        name: 'Mariana Pajón',
        email: 'reception@gympro.com',
        password: 'password123',
        phone: '320-999-8888',
        avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
        role: Role.RECEPTIONIST,
        joinDate: '2023-01-10',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        birthDate: '1998-02-14',
        age: 26,
        gender: 'Femenino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
    {
        id: 's1',
        name: 'Carlos Andrés Ventas',
        email: 'sales@gympro.com',
        password: 'password123',
        phone: '314-555-6677',
        avatarUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
        role: Role.SALES_AGENT,
        joinDate: '2024-02-01',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        birthDate: '1992-04-10',
        age: 32,
        gender: 'Masculino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
    {
        id: 'tec1',
        name: 'Ing. Mario Mecánico',
        email: 'maintenance@gympro.com',
        password: 'password123',
        phone: '318-222-3344',
        avatarUrl: 'https://randomuser.me/api/portraits/men/20.jpg',
        role: Role.MAINTENANCE,
        joinDate: '2023-11-15',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        birthDate: '1985-06-20',
        age: 39,
        gender: 'Masculino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    }
];

const HEALTH_STAFF: User[] = [
    {
        id: 'n1',
        name: 'Dra. Sofía Vergara',
        email: 'nutrition@gympro.com',
        password: 'password123',
        phone: '311-222-3333',
        avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
        role: Role.NUTRITIONIST,
        joinDate: '2023-05-15',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        skills: 'Nutrición Clínica, Suplementación Deportiva',
        birthDate: '1985-09-10',
        age: 39,
        gender: 'Femenino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    }
];

const STATIC_CLIENTS: User[] = [
    {
        id: '2',
        name: 'Samantha Williams',
        email: 'samantha.w@example.com',
        password: 'password123',
        phone: '310-555-0101',
        avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
        role: Role.CLIENT,
        joinDate: '2023-06-15',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-06-15', endDate: '2025-06-15', tierId: 'tier_premium' },
        trainerIds: ['t1', 't2'],
        assignedRoutines: [{ trainerId: 't1', routine: ROUTINE_A }],
        fitnessGoals: 'Tonificar y mejorar resistencia cardiovascular.',
        dietaryPreferences: 'Vegetariana, alérgica a las nueces.',
        medicalConditions: 'Ligera molestia en rodilla derecha.',
        height: 165, weight: 60, fitnessLevel: FitnessLevel.INTERMEDIATE,
        birthDate: '1996-04-10', age: 28, gender: 'Femenino',
        emergencyContact: { name: 'Pedro Williams', phone: '310-999-9999' },
        workoutHistory: [], nutritionLogs: [],
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    }
];

export const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Administrador Principal',
        email: 'admin@gympro.com',
        password: 'password123',
        phone: '300-123-4567',
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Gym&background=0D8ABC&color=fff',
        role: Role.ADMIN,
        joinDate: '2023-01-01',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2030-01-01' },
        birthDate: '1980-01-01',
        age: 44,
        gender: 'Masculino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
    ...TRAINERS,
    ...STAFF,
    ...HEALTH_STAFF,
    ...STATIC_CLIENTS
];
