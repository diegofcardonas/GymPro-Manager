export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  TRAINER = 'TRAINER',
  RECEPTIONIST = 'RECEPTIONIST',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  GROUP_INSTRUCTOR = 'GROUP_INSTRUCTOR',
  NUTRITIONIST = 'NUTRITIONIST',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
}

export enum MembershipStatus {
  ACTIVE = 'Activo',
  EXPIRED = 'Vencido',
  PENDING = 'Pendiente',
}

export enum FitnessLevel {
    BEGINNER = 'Principiante',
    INTERMEDIATE = 'Intermedio',
    ADVANCED = 'Avanzado',
}

export enum NotificationType {
    INFO = 'info',
    WARNING = 'warning',
    SUCCESS = 'success',
    ALERT = 'alert',
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: NotificationType;
    linkTo?: string;
}

// Toast Notification Types
export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export interface ThemePalette {
  primary: string; // HSL value string 'H S% L%'
  'primary-foreground': string; // HSL value string 'H S% L%'
}

export interface Theme {
  name: string;
  displayName: string;
  light: ThemePalette;
  dark: ThemePalette;
}


export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface DailyRoutine {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  exercises: Exercise[];
}

export interface AssignedRoutine {
  trainerId: string;
  routine: DailyRoutine[];
}

export interface PreEstablishedRoutine {
  id: string;
  name: string;
  description: string;
  routines: DailyRoutine[];
  trainerId?: string;
}

export interface ProgressNote {
    date: string;
    note: string;
}

export interface MembershipTier {
    id: string;
    name: string;
    price: number;
    duration: number; // in months
    features: string[];
    color: string; // hex color string
}

export enum PaymentStatus {
    COMPLETED = 'Completado',
    PENDING = 'Pendiente',
    FAILED = 'Fallido',
}

export enum PaymentMethod {
    CASH = 'Efectivo',
    CARD = 'Tarjeta',
    TRANSFER = 'Transferencia',
    OTHER = 'Otro'
}

export interface Payment {
    id: string;
    userId: string;
    amount: number;
    date: string;
    status: PaymentStatus;
    tierId: string;
    paymentMethod?: PaymentMethod; 
    description?: string; 
}

export interface Expense {
    id: string;
    category: string; 
    amount: number;
    date: string; // ISO string
    description?: string;
    registeredBy: string; // Admin User ID
}

// New Interface for Budgets
export interface Budget {
    id: string;
    category: string;
    amount: number; // The limit
    period: 'monthly' | 'yearly';
    year: number;
}

export interface LoggedSet {
  weight: number;
  reps: number;
}

export interface LoggedExercise {
  name: string;
  plannedSets: number;
  plannedReps: string;
  completedSets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string for the date of the workout
  day: DailyRoutine['day'];
  loggedExercises: LoggedExercise[];
  trainerNotes?: string;
}

export interface GymClass {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  capacity: number;
  bookedClientIds: string[];
}

export interface Message {
  id: string;
  conversationId: string; // e.g., 'user1-user2' sorted alphabetically
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string; // Admin's ID
  timestamp: string;
}

// --- New Types for AI Coach ---
export interface AICoachMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: string;
}

// --- New Types for Gamification ---
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // e.g., 'trophy', 'star', 'fire'
}

export interface Challenge {
    id: string;
    name: string;
    description: string;
    goal: number; // e.g., 20 workouts, 50km
    unit: string; // e.g., 'workouts', 'km'
    startDate: string; // ISO string
    endDate: string; // ISO string
    participants: { userId: string; progress: number }[];
}

// --- New Types for Equipment Management ---
export enum EquipmentStatus {
    OPERATIONAL = 'Operativo',
    IN_REPAIR = 'En Reparación',
    OUT_OF_SERVICE = 'Fuera de Servicio',
}

export interface EquipmentItem {
    id: string;
    name: string;
    type: string; // e.g., 'Cardio', 'Strength', 'Free Weights'
    location: string;
    status: EquipmentStatus;
}

export interface IncidentReport {
    id: string;
    equipmentId: string;
    reportedById: string;
    description: string;
    timestamp: string;
    isResolved: boolean;
}

// --- New Types for Nutrition Log ---
export interface NutritionLog {
    id: string;
    date: string; // ISO string
    mealDescription: string;
    aiAnalysis?: {
        estimatedCalories: string;
        estimatedMacros: {
            protein: string;
            carbs: string;
            fat: string;
        };
        suggestion: string;
    };
}

export type Visibility = 'everyone' | 'connections' | 'me';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  avatarUrl: string;
  role: Role;
  joinDate: string;
  membership: {
    status: MembershipStatus;
    startDate: string;
    endDate: string;
    tierId?: string;
  };
  trainerIds?: string[];
  assignedRoutines?: AssignedRoutine[];
  fitnessGoals?: string;
  dietaryPreferences?: string;
  height?: number; // in cm
  weight?: number; // in kg
  birthDate?: string; // ISO string YYYY-MM-DD
  age?: number; // derived or manually set if birthDate missing
  gender?: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decirlo';
  fitnessLevel?: FitnessLevel;
  medicalConditions?: string;
  emergencyContact?: {
      name: string;
      phone: string;
  };
  skills?: string; // For trainers, e.g., "Yoga, CrossFit, Nutrition"
  progressNotes?: ProgressNote[]; // For clients, general notes from trainer
  workoutHistory?: WorkoutSession[]; // For clients, logged workouts
  
  // New fields for advanced features
  achievements?: string[]; // Array of Achievement IDs
  aiCoachHistory?: AICoachMessage[];
  nutritionLogs?: NutritionLog[];
  blockedUserIds?: string[]; // Array of User IDs

  // User-configurable settings
  notificationPreferences?: {
    newMessages: boolean;
    routineUpdates: boolean;
    classReminders: boolean;
  };
  privacySettings?: {
    profileVisibility: Visibility;
    activityVisibility: Visibility;
    showInSearch: boolean;
  };
}

export interface SortConfig {
  key: keyof User | `membership.${keyof User['membership']}`;
  direction: 'ascending' | 'descending';
}