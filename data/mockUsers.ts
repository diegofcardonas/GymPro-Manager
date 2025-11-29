
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
        name: 'Carlos Mendoza',
        email: 'carlos.m@gympro.com',
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
    },
    {
        id: 't3',
        name: 'Andrés "El Toro" Díaz',
        email: 'andres.d@gympro.com',
        password: 'password123',
        phone: '315-555-6666',
        avatarUrl: 'https://randomuser.me/api/portraits/men/66.jpg',
        role: Role.TRAINER,
        joinDate: '2021-03-20',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        skills: 'CrossFit, Calistenia, Resistencia',
        birthDate: '1988-11-05',
        age: 36,
        gender: 'Masculino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    }
];

const STAFF: User[] = [
    {
        id: 'r1',
        name: 'Mariana Pajón (Recepción)',
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
        id: 'm1',
        name: 'Roberto Gómez (Gerente)',
        email: 'manager@gympro.com',
        password: 'password123',
        phone: '300-000-1111',
        avatarUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
        role: Role.GENERAL_MANAGER,
        joinDate: '2020-01-01',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        birthDate: '1975-06-30',
        age: 49,
        gender: 'Masculino',
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
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
    },
    {
        id: 'p1',
        name: 'Dr. Camilo Echeverry',
        email: 'physio@gympro.com',
        password: 'password123',
        phone: '312-444-5555',
        avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
        role: Role.PHYSIOTHERAPIST,
        joinDate: '2023-08-20',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-01-01', endDate: '2025-01-01' },
        skills: 'Rehabilitación Deportiva, Masaje Tejido Profundo',
        birthDate: '1982-03-25',
        age: 42,
        gender: 'Masculino',
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
    // Clients
    {
        id: '2',
        name: 'Samantha Williams',
        email: 'samantha.w@example.com',
        password: 'password123',
        phone: '310-555-0101',
        avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
        role: Role.CLIENT,
        joinDate: '2023-06-15',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2024-06-15', endDate: '2025-06-15', tierId: 'tier2' },
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
    },
    {
        id: '3',
        name: 'Juan Pablo Montoya',
        email: 'juan.p@example.com',
        password: 'password123',
        phone: '311-666-0202',
        avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
        role: Role.CLIENT,
        joinDate: '2023-02-10',
        membership: { status: MembershipStatus.EXPIRED, startDate: '2023-02-10', endDate: '2024-02-10', tierId: 'tier3' },
        trainerIds: ['t3'],
        fitnessGoals: 'Ganar masa muscular (Hipertrofia).',
        height: 178, weight: 85, fitnessLevel: FitnessLevel.ADVANCED,
        birthDate: '1992-11-20', age: 31, gender: 'Masculino',
        emergencyContact: { name: 'Maria Montoya', phone: '311-888-8888' },
        workoutHistory: [], nutritionLogs: [],
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
    {
        id: '4',
        name: 'Luisa Fernanda W',
        email: 'luisa.f@example.com',
        password: 'password123',
        phone: '312-777-0303',
        avatarUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
        role: Role.CLIENT,
        joinDate: '2024-05-01',
        membership: { status: MembershipStatus.PENDING, startDate: '2024-05-01', endDate: '2025-05-01', tierId: 'tier1' },
        trainerIds: [],
        fitnessGoals: 'Bajar de peso post-embarazo.',
        height: 160, weight: 70, fitnessLevel: FitnessLevel.BEGINNER,
        birthDate: '1994-07-07', age: 30, gender: 'Femenino',
        workoutHistory: [], nutritionLogs: [],
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    },
    {
        id: '5',
        name: 'Carlos Vives Jr.',
        email: 'carlosjr@example.com',
        password: 'password123',
        phone: '313-888-0404',
        avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
        role: Role.CLIENT,
        joinDate: '2023-11-20',
        membership: { status: MembershipStatus.ACTIVE, startDate: '2023-11-20', endDate: '2024-11-20', tierId: 'tier2' },
        trainerIds: ['t1'],
        fitnessGoals: 'Preparación física para fútbol.',
        height: 175, weight: 72, fitnessLevel: FitnessLevel.INTERMEDIATE,
        birthDate: '2000-01-15', age: 24, gender: 'Masculino',
        workoutHistory: [], nutritionLogs: [],
        notificationPreferences: defaultPrefs, privacySettings: defaultPrivacy
    }
];
