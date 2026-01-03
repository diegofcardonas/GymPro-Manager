
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

export enum TaskStatus {
    PENDING = 'Pendiente',
    IN_PROGRESS = 'En Progreso',
    COMPLETED = 'Completado',
}

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
    id: string;
    title: string;
    description: string;
    assignedToId: string;
    assignedById: string;
    dueDate: string;
    status: TaskStatus;
    priority: TaskPriority;
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

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
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

export interface MembershipTier {
    id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
    color: string;
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
    date: string;
    description?: string;
    registeredBy: string;
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  day: DailyRoutine['day'];
  loggedExercises: LoggedExercise[];
  trainerNotes?: string;
}

export interface LoggedExercise {
  name: string;
  plannedSets: number;
  plannedReps: string;
  completedSets: LoggedSet[];
}

export interface LoggedSet {
  weight: number;
  reps: number;
}

export interface GymClass {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedClientIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
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
  authorId: string;
  timestamp: string;
}

export interface AICoachMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface Challenge {
    id: string;
    name: string;
    description: string;
    goal: number;
    unit: string;
    startDate: string;
    endDate: string;
    participants: { userId: string; progress: number }[];
}

export enum EquipmentStatus {
    OPERATIONAL = 'Operativo',
    IN_REPAIR = 'En Reparación',
    OUT_OF_SERVICE = 'Fuera de Servicio',
}

export interface EquipmentItem {
    id: string;
    name: string;
    type: string;
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

export interface NutritionLog {
    id: string;
    date: string;
    mealDescription: string;
    imageUrl?: string;
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

export interface SocialPost {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    imageUrl?: string;
    type: 'achievement' | 'workout' | 'general';
    likes: string[]; // User IDs
    comments: { id: string; userId: string; text: string; timestamp: string }[];
    timestamp: string;
}

export type Visibility = 'everyone' | 'connections' | 'me';

export interface SortConfig {
    key: string;
    direction: 'ascending' | 'descending';
}

export interface Theme {
  name: string;
  displayName: string;
  light: {
    primary: string;
    'primary-foreground': string;
  };
  dark: {
    primary: string;
    'primary-foreground': string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address?: string;
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
  height?: number;
  weight?: number;
  birthDate?: string;
  age?: number;
  gender?: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decirlo';
  fitnessLevel?: FitnessLevel;
  medicalConditions?: string;
  personalBests?: {
      benchPress?: number;
      squat?: number;
      deadlift?: number;
  };
  emergencyContact?: {
      name: string;
      phone: string;
      relation?: string;
  };
  skills?: string;
  bio?: string;
  experienceYears?: number;
  socialLinks?: {
      instagram?: string;
      linkedin?: string;
  };
  progressNotes?: { date: string; note: string }[];
  workoutHistory?: WorkoutSession[];
  achievements?: string[];
  aiCoachHistory?: AICoachMessage[];
  nutritionLogs?: NutritionLog[];
  blockedUserIds?: string[];
  notificationPreferences?: {
    newMessages: boolean;
    routineUpdates: boolean;
    classReminders: boolean;
    pushNotifications?: boolean;
  };
  privacySettings?: {
    profileVisibility: Visibility;
    activityVisibility: Visibility;
    showInSearch: boolean;
  };
}
