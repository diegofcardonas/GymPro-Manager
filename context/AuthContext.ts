
import { createContext } from 'react';
import { User, Notification, PreEstablishedRoutine, Payment, WorkoutSession, GymClass, Message, Announcement, Challenge, Achievement, EquipmentItem, IncidentReport, AICoachMessage, NutritionLog, Role, MembershipStatus, ToastMessage, Expense, Budget, Task, SocialPost } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  myClients?: User[]; 
  myTrainers?: User[];
  notifications: Notification[];
  preEstablishedRoutines: PreEstablishedRoutine[];
  payments: Payment[];
  gymClasses: GymClass[];
  messages: Message[];
  announcements: Announcement[];
  challenges: Challenge[];
  achievements: Achievement[];
  equipment: EquipmentItem[];
  incidents: IncidentReport[];
  expenses: Expense[];
  budgets: Budget[];
  posts: SocialPost[];
  tasks: Task[];
  
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  removeToast: (id: string) => void;

  logout: () => void;
  updateCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  resetUsers: () => void;
  toggleBlockUser: (userIdToBlock: string) => void;

  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  deleteNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  
  addRoutineTemplate: (routine: PreEstablishedRoutine) => void;
  updateRoutineTemplate: (routine: PreEstablishedRoutine) => void;
  deleteRoutineTemplate: (routineId: string) => void;

  logWorkout: (userId: string, session: WorkoutSession) => void;

  addGymClass: (gymClass: Omit<GymClass, 'id'>) => void;
  updateGymClass: (gymClass: GymClass) => void;
  deleteGymClass: (classId: string) => void;
  bookClass: (classId: string, userId: string) => void; 
  
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  markMessagesAsRead: (conversationId: string, userId: string) => void;

  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (announcementId: string) => void;
  
  sendAICoachMessage: (userId: string, message: AICoachMessage) => Promise<AICoachMessage | null>;
  
  addChallenge: (challenge: Omit<Challenge, 'id' | 'participants'>) => void;
  updateChallenge: (challenge: Challenge) => void;
  deleteChallenge: (challengeId: string) => void;
  joinChallenge: (challengeId: string, userId: string) => void;

  unlockAchievement: (userId: string, achievementId: string) => void;
  
  addEquipment: (equipment: Omit<EquipmentItem, 'id'>) => void;
  updateEquipment: (equipment: EquipmentItem) => void;
  deleteEquipment: (equipmentId: string) => void;

  reportIncident: (incident: Omit<IncidentReport, 'id' | 'timestamp' | 'isResolved'>) => void;
  resolveIncident: (incidentId: string) => void;
  toggleReportModal: () => void;
  
  addNutritionLog: (userId: string, log: Omit<NutritionLog, 'id'>) => Promise<void>;
  
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;

  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  addPost: (post: Omit<SocialPost, 'id' | 'likes' | 'comments' | 'timestamp'>) => void;
  likePost: (postId: string, userId: string) => void;
  
  login: (email: string, password: string) => Promise<string | void>;
  register: (user: any) => Promise<string | void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  myClients: [],
  myTrainers: [],
  notifications: [],
  preEstablishedRoutines: [],
  payments: [],
  gymClasses: [],
  messages: [],
  announcements: [],
  challenges: [],
  achievements: [],
  equipment: [],
  incidents: [],
  expenses: [],
  budgets: [],
  posts: [],
  tasks: [],
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  logout: () => {},
  updateCurrentUser: () => {},
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  resetUsers: () => {},
  toggleBlockUser: () => {},
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
  deleteNotification: () => {},
  addNotification: () => {},
  addRoutineTemplate: () => {},
  updateRoutineTemplate: () => {},
  deleteRoutineTemplate: () => {},
  logWorkout: () => {},
  addGymClass: () => {},
  updateGymClass: () => {},
  deleteGymClass: () => {},
  bookClass: () => {},
  sendMessage: () => {},
  markMessagesAsRead: () => {},
  addAnnouncement: () => {},
  updateAnnouncement: () => {},
  deleteAnnouncement: () => {},
  sendAICoachMessage: async () => null,
  addChallenge: () => {},
  updateChallenge: () => {},
  deleteChallenge: () => {},
  joinChallenge: () => {},
  unlockAchievement: () => {},
  addEquipment: () => {},
  updateEquipment: () => {},
  deleteEquipment: () => {},
  reportIncident: () => {},
  resolveIncident: () => {},
  toggleReportModal: () => {},
  addNutritionLog: async () => {},
  addPayment: () => {},
  addExpense: () => {},
  deleteExpense: () => {},
  addBudget: () => {},
  updateBudget: () => {},
  deleteBudget: () => {},
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  addPost: () => {},
  likePost: () => {},
  login: async () => {},
  register: async () => {},
});
