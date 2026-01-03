
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Role, Notification, PreEstablishedRoutine, NotificationType, Payment, WorkoutSession, GymClass, Message, Announcement, Challenge, Achievement, EquipmentItem, IncidentReport, AICoachMessage, NutritionLog, MembershipStatus, ToastMessage, Expense, Budget } from './types';
import { AuthContext } from './context/AuthContext';
import { MOCK_USERS } from './data/mockUsers';
import { MOCK_NOTIFICATIONS } from './data/mockNotifications';
import { MOCK_ROUTINES } from './data/mockRoutines';
import { MOCK_PAYMENTS } from './data/mockPayments';
import { MOCK_CLASSES } from './data/mockClasses';
import { MOCK_MESSAGES } from './data/mockMessages';
import { MOCK_ANNOUNCEMENTS } from './data/mockAnnouncements';
import { MOCK_ACHIEVEMENTS } from './data/mockAchievements';
import { MOCK_CHALLENGES } from './data/mockChallenges';
import { MOCK_EQUIPMENT } from './data/mockEquipment';
import { MOCK_TIERS } from './data/membershipTiers';
import { MOCK_EXPENSES } from './data/mockExpenses';
import { MOCK_BUDGETS } from './data/mockBudgets';
import { ThemeProvider } from './context/ThemeContext';

import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import GeneralManagerDashboard from './components/GeneralManagerDashboard';
import GroupInstructorDashboard from './components/GroupInstructorDashboard';
import NutritionistDashboard from './components/NutritionistDashboard';
import PhysiotherapistDashboard from './components/PhysiotherapistDashboard';
import LoginScreen from './components/LoginScreen';
import Footer from './components/Footer';
import { ToastContainer } from './components/shared/Toast';
import { CommandPalette } from './components/shared/CommandPalette';

import { LogoIcon } from './components/icons/LogoIcon';
import ReportIncidentModal from './components/shared/ReportIncidentModal';
import { GoogleGenAI, Type } from "@google/genai";
import { LogoutIcon } from './components/icons/LogoutIcon';
import SplashScreen from './components/SplashScreen';
import LanguageSwitcher from './components/LanguageSwitcher';

// Hook para persistencia local
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
      return defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Persistencia de usuario para evitar logout al refrescar
  const [currentUser, setCurrentUser] = usePersistentState<User | null>('gympro_current_user', null);

  // Estados de datos maestros
  const [users, setUsers] = usePersistentState<User[]>('gympro_users', MOCK_USERS);
  const [notifications, setNotifications] = usePersistentState<Notification[]>('gympro_notifications', MOCK_NOTIFICATIONS);
  const [preEstablishedRoutines, setPreEstablishedRoutines] = usePersistentState<PreEstablishedRoutine[]>('gympro_routines', MOCK_ROUTINES);
  const [payments, setPayments] = usePersistentState<Payment[]>('gympro_payments', MOCK_PAYMENTS);
  const [gymClasses, setGymClasses] = usePersistentState<GymClass[]>('gympro_classes', MOCK_CLASSES);
  const [messages, setMessages] = usePersistentState<Message[]>('gympro_messages', MOCK_MESSAGES);
  const [announcements, setAnnouncements] = usePersistentState<Announcement[]>('gympro_announcements', MOCK_ANNOUNCEMENTS);
  const [challenges, setChallenges] = usePersistentState<Challenge[]>('gympro_challenges', MOCK_CHALLENGES);
  const [achievements, setAchievements] = usePersistentState<Achievement[]>('gympro_achievements', MOCK_ACHIEVEMENTS);
  const [equipment, setEquipment] = usePersistentState<EquipmentItem[]>('gympro_equipment', MOCK_EQUIPMENT);
  const [incidents, setIncidents] = usePersistentState<IncidentReport[]>('gympro_incidents', []);
  const [expenses, setExpenses] = usePersistentState<Expense[]>('gympro_expenses', MOCK_EXPENSES);
  const [budgets, setBudgets] = usePersistentState<Budget[]>('gympro_budgets', MOCK_BUDGETS);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // AI Instance
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
  const aiChatSessions = useMemo(() => new Map<string, any>(), []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth Actions
  const login = useCallback(async (email: string, password: string): Promise<string | void> => {
    const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (userToLogin) {
      setCurrentUser(userToLogin);
      addToast(t('toast.welcome', { name: userToLogin.name }), 'success');
    } else {
      return t('toast.passwordError');
    }
  }, [users, t, addToast, setCurrentUser]);

  const register = useCallback(async (userData: any): Promise<string | void> => {
      const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if(exists) return t('toast.emailExists');
      
      const newUser: User = {
          ...userData,
          id: `u${Date.now()}`,
          joinDate: new Date().toISOString(),
          membership: {
              status: MembershipStatus.PENDING,
              startDate: new Date().toISOString(),
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
              tierId: MOCK_TIERS[0].id
          },
          avatarUrl: `https://picsum.photos/seed/${userData.email}/200`
      };
      
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      addToast(t('toast.accountCreated'), 'success');
  }, [users, setUsers, addToast, t, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    addToast(t('toast.loggedOut'), 'info');
  }, [addToast, t, setCurrentUser]);

  // CRUD Actions
  const updateCurrentUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, [setUsers, setCurrentUser]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if(currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  }, [currentUser, setUsers, setCurrentUser]);

  const addUser = useCallback((newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    addToast(t('toast.userAdded'), 'success');
  }, [setUsers, addToast, t]);

  const deleteUser = useCallback((userId: string) => {
    if (currentUser?.id === userId) {
        logout();
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    addToast(t('toast.userDeleted'), 'info');
  }, [currentUser, setUsers, addToast, t, logout]);

  const resetUsers = useCallback(() => {
      setUsers(MOCK_USERS);
      setCurrentUser(null);
      addToast(t('toast.usersReset'), 'success');
  }, [setUsers, addToast, t, setCurrentUser]);

  const toggleBlockUser = useCallback((userId: string) => {
    if (!currentUser) return;
    const blocked = currentUser.blockedUserIds || [];
    const isBlocked = blocked.includes(userId);
    const newBlocked = isBlocked ? blocked.filter(id => id !== userId) : [...blocked, userId];
    updateCurrentUser({ ...currentUser, blockedUserIds: newBlocked });
  }, [currentUser, updateCurrentUser]);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, [setNotifications]);

  const markAllNotificationsAsRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  }, [setNotifications]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => [{ ...n, id: `n${Date.now()}`, timestamp: new Date().toISOString(), isRead: false }, ...prev]);
  }, [setNotifications]);

  // Gym Operations
  const addGymClass = useCallback((c: Omit<GymClass, 'id'>) => setGymClasses(prev => [...prev, { ...c, id: `c${Date.now()}` }]), [setGymClasses]);
  const updateGymClass = useCallback((c: GymClass) => setGymClasses(prev => prev.map(item => item.id === c.id ? c : item)), [setGymClasses]);
  const deleteGymClass = useCallback((id: string) => setGymClasses(prev => prev.filter(c => c.id !== id)), [setGymClasses]);
  
  const bookClass = useCallback((classId: string, userId: string) => {
    setGymClasses(prev => prev.map(c => {
        if (c.id === classId && !c.bookedClientIds.includes(userId) && c.bookedClientIds.length < c.capacity) {
            addToast(t('toast.bookedSuccess', { name: c.name }), 'success');
            return { ...c, bookedClientIds: [...c.bookedClientIds, userId] };
        }
        return c;
    }));
  }, [setGymClasses, addToast, t]);

  const logWorkout = useCallback((userId: string, session: WorkoutSession) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, workoutHistory: [...(u.workoutHistory || []), session] } : u));
    addToast(t('toast.workoutLogged'), 'success');
  }, [setUsers, addToast, t]);

  const sendMessage = useCallback((m: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    setMessages(prev => [...prev, { ...m, id: `m${Date.now()}`, timestamp: new Date().toISOString(), isRead: false }]);
  }, [setMessages]);

  const markMessagesAsRead = useCallback((convId: string, userId: string) => {
    setMessages(prev => prev.map(m => m.conversationId === convId && m.receiverId === userId ? { ...m, isRead: true } : m));
  }, [setMessages]);

  const addAnnouncement = useCallback((a: Omit<Announcement, 'id' | 'timestamp'>) => {
    setAnnouncements(prev => [{ ...a, id: `a${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]);
  }, [setAnnouncements]);

  const updateAnnouncement = useCallback((a: Announcement) => setAnnouncements(prev => prev.map(item => item.id === a.id ? a : item)), [setAnnouncements]);
  const deleteAnnouncement = useCallback((id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id)), [setAnnouncements]);

  // AI & Nutrition
  const sendAICoachMessage = useCallback(async (userId: string, msg: AICoachMessage) => {
    if (!aiChatSessions.has(userId)) {
        aiChatSessions.set(userId, ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: t('client.aiCoach.systemInstruction') } }));
    }
    const chat = aiChatSessions.get(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, aiCoachHistory: [...(u.aiCoachHistory || []), msg] } : u));

    try {
        const result = await chat.sendMessage({ message: msg.text });
        const modelRes: AICoachMessage = { role: 'model', text: result.text, timestamp: new Date().toISOString() };
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, aiCoachHistory: [...(u.aiCoachHistory || []), modelRes] } : u));
        return modelRes;
    } catch (e) {
        addToast(t('toast.aiCoachUnavailable'), 'error');
        return null;
    }
  }, [ai, aiChatSessions, setUsers, t, addToast]);

  const addNutritionLog = useCallback(async (userId: string, log: Omit<NutritionLog, 'id'>) => {
    const newLog: NutritionLog = { ...log, id: `nut-${Date.now()}` };
    try {
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analiza esta comida: ${log.mealDescription}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedCalories: { type: Type.STRING },
                        estimatedMacros: {
                            type: Type.OBJECT,
                            properties: { protein: { type: Type.STRING }, carbs: { type: Type.STRING }, fat: { type: Type.STRING } }
                        },
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });
        newLog.aiAnalysis = JSON.parse(res.text);
        addToast(t('toast.mealAnalyzed'), 'success');
    } catch (e) {
        addToast(t('toast.mealAnalysisFailed'), 'warning');
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, nutritionLogs: [newLog, ...(u.nutritionLogs || [])] } : u));
  }, [ai, setUsers, t, addToast]);

  // Finances
  const addPayment = useCallback((p: Omit<Payment, 'id'>) => setPayments(prev => [...prev, { ...p, id: `p${Date.now()}` }]), [setPayments]);
  const addExpense = useCallback((e: Omit<Expense, 'id'>) => setExpenses(prev => [...prev, { ...e, id: `e${Date.now()}` }]), [setExpenses]);
  const deleteExpense = useCallback((id: string) => setExpenses(prev => prev.filter(e => e.id !== id)), [setExpenses]);
  const addBudget = useCallback((b: Omit<Budget, 'id'>) => setBudgets(prev => [...prev, { ...b, id: `b${Date.now()}` }]), [setBudgets]);
  const updateBudget = useCallback((b: Budget) => setBudgets(prev => prev.map(item => item.id === b.id ? b : item)), [setBudgets]);
  const deleteBudget = useCallback((id: string) => setBudgets(prev => prev.filter(b => b.id !== id)), [setBudgets]);

  // Equipment
  const addEquipment = useCallback((e: Omit<EquipmentItem, 'id'>) => setEquipment(prev => [...prev, { ...e, id: `eq-${Date.now()}` }]), [setEquipment]);
  const updateEquipment = useCallback((e: EquipmentItem) => setEquipment(prev => prev.map(item => item.id === e.id ? e : item)), [setEquipment]);
  const deleteEquipment = useCallback((id: string) => setEquipment(prev => prev.filter(e => e.id !== id)), [setEquipment]);
  const reportIncident = useCallback((i: Omit<IncidentReport, 'id' | 'timestamp' | 'isResolved'>) => {
    setIncidents(prev => [{ ...i, id: `inc-${Date.now()}`, timestamp: new Date().toISOString(), isResolved: false }, ...prev]);
    setIsReportModalOpen(false);
  }, [setIncidents]);
  const resolveIncident = useCallback((id: string) => setIncidents(prev => prev.map(i => i.id === id ? { ...i, isResolved: true } : i)), [setIncidents]);
  const toggleReportModal = useCallback(() => setIsReportModalOpen(prev => !prev), []);

  const myTrainers = useMemo(() => currentUser?.role === Role.CLIENT ? users.filter(u => u.role === Role.TRAINER && currentUser.trainerIds?.includes(u.id)) : [], [currentUser, users]);
  const myClients = useMemo(() => currentUser?.role === Role.TRAINER ? users.filter(u => u.role === Role.CLIENT && u.trainerIds?.includes(currentUser.id)) : [], [currentUser, users]);

  const contextValue = useMemo(() => ({
    currentUser, users, myClients, myTrainers, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts, expenses, budgets,
    login, register, logout, updateCurrentUser, updateUser, addUser, deleteUser, resetUsers, toggleBlockUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, addNotification,
    addGymClass, updateGymClass, deleteGymClass, bookClass, logWorkout, sendMessage, markMessagesAsRead, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    sendAICoachMessage, addNutritionLog, addPayment, addExpense, deleteExpense, addBudget, updateBudget, deleteBudget, addEquipment, updateEquipment, deleteEquipment, reportIncident, resolveIncident, toggleReportModal,
    addToast, removeToast
  }), [currentUser, users, myClients, myTrainers, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts, expenses, budgets, login, register, logout, updateCurrentUser, updateUser, addUser, deleteUser, resetUsers, toggleBlockUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, addNotification, addGymClass, updateGymClass, deleteGymClass, bookClass, logWorkout, sendMessage, markMessagesAsRead, addAnnouncement, updateAnnouncement, deleteAnnouncement, sendAICoachMessage, addNutritionLog, addPayment, addExpense, deleteExpense, addBudget, updateBudget, deleteBudget, addEquipment, updateEquipment, deleteEquipment, reportIncident, resolveIncident, toggleReportModal, addToast, removeToast]);

  const renderDashboard = () => {
    if (!currentUser) return <><LoginScreen /><Footer /></>;
    const dashboards = {
        [Role.ADMIN]: <AdminDashboard />,
        [Role.CLIENT]: <ClientDashboard />,
        [Role.TRAINER]: <TrainerDashboard />,
        [Role.RECEPTIONIST]: <ReceptionistDashboard />,
        [Role.GENERAL_MANAGER]: <GeneralManagerDashboard />,
        [Role.GROUP_INSTRUCTOR]: <GroupInstructorDashboard />,
        [Role.NUTRITIONIST]: <NutritionistDashboard />,
        [Role.PHYSIOTHERAPIST]: <PhysiotherapistDashboard />,
    };
    return (
        <div className="flex flex-col min-h-screen">
            {dashboards[currentUser.role] || <div className="p-20 text-center">Dashboard not found</div>}
            {isReportModalOpen && currentUser && <ReportIncidentModal reportedById={currentUser.id} onClose={() => setIsReportModalOpen(false)} />}
        </div>
    );
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider value={contextValue as any}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <CommandPalette />
          {isLoading ? <SplashScreen /> : renderDashboard()}
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;
