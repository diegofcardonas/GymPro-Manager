
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Role, Notification, PreEstablishedRoutine, NotificationType, Payment, WorkoutSession, GymClass, Message, Announcement, Challenge, Achievement, EquipmentItem, IncidentReport, AICoachMessage, NutritionLog, MembershipStatus, ToastMessage, Expense, Budget, SocialPost, Task } from './types';
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
import { MOCK_EXPENSES } from './data/mockExpenses';
import { MOCK_BUDGETS } from './data/mockBudgets';
import { MOCK_TASKS } from './data/mockTasks';
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
import { ToastContainer } from './components/shared/Toast';
import { CommandPalette } from './components/shared/CommandPalette';
import { GoogleGenAI } from "@google/genai";
import SplashScreen from './components/SplashScreen';
import SupportModal from './components/shared/SupportModal';

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
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = usePersistentState<User | null>('gympro_current_user', null);
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
  const [posts, setPosts] = usePersistentState<SocialPost[]>('gympro_posts', []);
  const [tasks, setTasks] = usePersistentState<Task[]>('gympro_tasks', MOCK_TASKS);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => { setToasts(prev => prev.filter(t => t.id !== id)); }, []);

  // Auth
  const login = useCallback(async (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) { setCurrentUser(user); addToast(t('toast.welcome', { name: user.name }), 'success'); }
    else return t('toast.passwordError');
  }, [users, t, addToast, setCurrentUser]);
  
  const logout = useCallback(() => { 
    setCurrentUser(null); 
    addToast(t('toast.loggedOut'), 'info'); 
  }, [addToast, t, setCurrentUser]);

  const register = useCallback(async (userData: any) => {
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return t('toast.emailExists');
    const newUser = { ...userData, id: `u-${Date.now()}`, joinDate: new Date().toISOString(), membership: { status: MembershipStatus.PENDING, startDate: new Date().toISOString(), endDate: new Date().toISOString() } };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast(t('toast.accountCreated'), 'success');
  }, [users, setUsers, setCurrentUser, addToast, t]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if(currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  }, [currentUser, setUsers, setCurrentUser]);

  const addUser = useCallback((user: User) => setUsers(prev => [...prev, user]), [setUsers]);
  const deleteUser = useCallback((userId: string) => setUsers(prev => prev.filter(u => u.id !== userId)), [setUsers]);
  const resetUsers = useCallback(() => setUsers(MOCK_USERS), [setUsers]);
  const toggleBlockUser = useCallback((userIdToBlock: string) => {
    if (!currentUser) return;
    const blocked = currentUser.blockedUserIds || [];
    const newBlocked = blocked.includes(userIdToBlock) ? blocked.filter(id => id !== userIdToBlock) : [...blocked, userIdToBlock];
    updateUser({ ...currentUser, blockedUserIds: newBlocked });
  }, [currentUser, updateUser]);

  // Notifications
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => [{ ...n, id: `n${Date.now()}`, timestamp: new Date().toISOString(), isRead: false }, ...prev]);
  }, [setNotifications]);
  const markNotificationAsRead = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)), [setNotifications]);
  const markAllNotificationsAsRead = useCallback((userId: string) => setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n)), [setNotifications]);
  const deleteNotification = useCallback((id: string) => setNotifications(prev => prev.filter(n => n.id !== id)), [setNotifications]);

  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  const sendTestPush = useCallback(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      addToast('Push permissions not granted', 'warning');
      return;
    }
    new Notification('GymPro Manager', {
      body: 'Real-time push system online!',
      icon: 'https://ui-avatars.com/api/?name=Gym+Pro&background=0D8ABC&color=fff'
    });
  }, [addToast]);

  // Routines & Classes
  const addRoutineTemplate = useCallback((r: PreEstablishedRoutine) => setPreEstablishedRoutines(prev => [...prev, r]), [setPreEstablishedRoutines]);
  const updateRoutineTemplate = useCallback((r: PreEstablishedRoutine) => setPreEstablishedRoutines(prev => prev.map(item => item.id === r.id ? r : item)), [setPreEstablishedRoutines]);
  const deleteRoutineTemplate = useCallback((id: string) => setPreEstablishedRoutines(prev => prev.filter(item => item.id !== id)), [setPreEstablishedRoutines]);

  const addGymClass = useCallback((c: Omit<GymClass, 'id'>) => setGymClasses(prev => [{ ...c, id: `c-${Date.now()}` }, ...prev]), [setGymClasses]);
  const updateGymClass = useCallback((c: GymClass) => setGymClasses(prev => prev.map(item => item.id === c.id ? c : item)), [setGymClasses]);
  const deleteGymClass = useCallback((id: string) => setGymClasses(prev => prev.filter(item => item.id !== id)), [setGymClasses]);
  const bookClass = useCallback((classId: string, userId: string) => {
    setGymClasses(prev => prev.map(c => {
      if (c.id !== classId) return c;
      if (c.bookedClientIds.includes(userId)) { addToast(t('toast.alreadyBooked'), 'warning'); return c; }
      if (c.bookedClientIds.length >= c.capacity) { addToast(t('toast.classFull'), 'error'); return c; }
      addToast(t('toast.bookedSuccess', { name: c.name }), 'success');
      return { ...c, bookedClientIds: [...c.bookedClientIds, userId] };
    }));
  }, [setGymClasses, addToast, t]);

  // Social & Messages
  const addPost = useCallback((post: Omit<SocialPost, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
    setPosts(prev => [{ ...post, id: `p-${Date.now()}`, likes: [], comments: [], timestamp: new Date().toISOString() }, ...prev]);
  }, [setPosts]);
  const likePost = useCallback((postId: string, userId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes.includes(userId) ? p.likes.filter(id => id !== userId) : [...p.likes, userId] } : p));
  }, [setPosts]);

  const sendMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    setMessages(prev => [...prev, { ...msg, id: `m-${Date.now()}`, timestamp: new Date().toISOString(), isRead: false }]);
  }, [setMessages]);
  const markMessagesAsRead = useCallback((convId: string, userId: string) => {
    setMessages(prev => prev.map(m => m.conversationId === convId && m.receiverId === userId ? { ...m, isRead: true } : m));
  }, [setMessages]);

  // Announcements & Challenges
  const addAnnouncement = useCallback((a: Omit<Announcement, 'id' | 'timestamp'>) => setAnnouncements(prev => [{ ...a, id: `a-${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]), [setAnnouncements]);
  const updateAnnouncement = useCallback((a: Announcement) => setAnnouncements(prev => prev.map(item => item.id === a.id ? a : item)), [setAnnouncements]);
  const deleteAnnouncement = useCallback((id: string) => setAnnouncements(prev => prev.filter(item => item.id !== id)), [setAnnouncements]);

  const addChallenge = useCallback((c: Omit<Challenge, 'id' | 'participants'>) => setChallenges(prev => [{ ...c, id: `ch-${Date.now()}`, participants: [] }, ...prev]), [setChallenges]);
  const updateChallenge = useCallback((c: Challenge) => setChallenges(prev => prev.map(item => item.id === c.id ? c : item)), [setChallenges]);
  const deleteChallenge = useCallback((id: string) => setChallenges(prev => prev.filter(item => item.id !== id)), [setChallenges]);
  const joinChallenge = useCallback((id: string, userId: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, participants: [...c.participants, { userId, progress: 0 }] } : c));
    addToast(t('toast.challengeJoined'), 'success');
  }, [setChallenges, addToast, t]);
  const unlockAchievement = useCallback((userId: string, achId: string) => {
    const user = users.find(u => u.id === userId);
    if(user && !user.achievements?.includes(achId)) {
      updateUser({ ...user, achievements: [...(user.achievements || []), achId] });
      addToast(t('toast.achievementUnlocked', { name: achId }), 'success');
    }
  }, [users, updateUser, addToast, t]);

  // Equipment & Finance
  const addEquipment = useCallback((e: Omit<EquipmentItem, 'id'>) => setEquipment(prev => [{ ...e, id: `eq-${Date.now()}` }, ...prev]), [setEquipment]);
  const updateEquipment = useCallback((e: EquipmentItem) => setEquipment(prev => prev.map(item => item.id === e.id ? e : item)), [setEquipment]);
  const deleteEquipment = useCallback((id: string) => setEquipment(prev => prev.filter(item => item.id !== id)), [setEquipment]);
  const reportIncident = useCallback((i: Omit<IncidentReport, 'id' | 'timestamp' | 'isResolved'>) => {
    setIncidents(prev => [{ ...i, id: `i-${Date.now()}`, timestamp: new Date().toISOString(), isResolved: false }, ...prev]);
    addToast(t('toast.incidentReported'), 'success');
    setIsReportModalOpen(false);
  }, [setIncidents, addToast, t]);
  const resolveIncident = useCallback((id: string) => setIncidents(prev => prev.map(i => i.id === id ? { ...i, isResolved: true } : i)), [setIncidents]);

  const addPayment = useCallback((p: Omit<Payment, 'id'>) => setPayments(prev => [{ ...p, id: `pay-${Date.now()}` }, ...prev]), [setPayments]);
  const addExpense = useCallback((e: Omit<Expense, 'id'>) => setExpenses(prev => [{ ...e, id: `exp-${Date.now()}` }, ...prev]), [setExpenses]);
  const deleteExpense = useCallback((id: string) => setExpenses(prev => prev.filter(e => e.id !== id)), [setExpenses]);
  const addBudget = useCallback((b: Omit<Budget, 'id'>) => setBudgets(prev => [{ ...b, id: `bud-${Date.now()}` }, ...prev]), [setBudgets]);
  const updateBudget = useCallback((b: Budget) => setBudgets(prev => prev.map(item => item.id === b.id ? b : item)), [setBudgets]);
  const deleteBudget = useCallback((id: string) => setBudgets(prev => prev.filter(b => b.id !== id)), [setBudgets]);

  // Tasks
  const addTask = useCallback((task: Omit<Task, 'id'>) => setTasks(prev => [{ ...task, id: `task-${Date.now()}` }, ...prev]), [setTasks]);
  const updateTask = useCallback((task: Task) => setTasks(prev => prev.map(t => t.id === task.id ? task : t)), [setTasks]);
  const deleteTask = useCallback((id: string) => setTasks(prev => prev.filter(t => t.id !== id)), [setTasks]);

  const sendAICoachMessage = useCallback(async (userId: string, message: AICoachMessage) => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const history = user.aiCoachHistory || [];
    const updatedUserWithUserMsg = { ...user, aiCoachHistory: [...history, message] };
    updateUser(updatedUserWithUserMsg);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message.text,
        config: { systemInstruction: "You are a friendly gym coach. Reply in the same language as the user: " + (i18n.language.startsWith('es') ? 'Spanish' : 'English') }
      });
      const modelMessage: AICoachMessage = { role: 'model', text: response.text || '', timestamp: new Date().toISOString() };
      updateUser({ ...updatedUserWithUserMsg, aiCoachHistory: [...updatedUserWithUserMsg.aiCoachHistory, modelMessage] });
      return modelMessage;
    } catch (error) { addToast(t('toast.aiCoachError'), 'error'); return null; }
  }, [users, updateUser, addToast, t, i18n.language]);

  const logWorkout = useCallback((userId: string, session: WorkoutSession) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUser({ ...user, workoutHistory: [session, ...(user.workoutHistory || [])] });
      addToast(t('toast.workoutLogged'), 'success');
    }
  }, [users, updateUser, addToast, t]);

  const addNutritionLog = useCallback(async (userId: string, log: Omit<NutritionLog, 'id'>) => {
    const user = users.find(u => u.id === userId);
    if (user) updateUser({ ...user, nutritionLogs: [{ ...log, id: `nut-${Date.now()}` }, ...(user.nutritionLogs || [])] });
  }, [users, updateUser]);

  const myClients = useMemo(() => currentUser?.role === Role.TRAINER ? users.filter(u => u.trainerIds?.includes(currentUser.id)) : [], [currentUser, users]);
  const myTrainers = useMemo(() => currentUser?.role === Role.CLIENT ? users.filter(u => currentUser.trainerIds?.includes(u.id)) : [], [currentUser, users]);

  const contextValue = useMemo(() => ({
    currentUser, users, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts, expenses, budgets, posts, tasks, myClients, myTrainers,
    login, logout, register, updateUser, updateCurrentUser: updateUser, addUser, deleteUser, resetUsers, toggleBlockUser,
    addNotification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,
    addRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate,
    logWorkout, addGymClass, updateGymClass, deleteGymClass, bookClass,
    sendMessage, markMessagesAsRead, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    sendAICoachMessage, addChallenge, updateChallenge, deleteChallenge, joinChallenge, unlockAchievement,
    addEquipment, updateEquipment, deleteEquipment, reportIncident, resolveIncident, toggleReportModal: () => setIsReportModalOpen(prev => !prev),
    addNutritionLog, addPayment, addExpense, deleteExpense, addBudget, updateBudget, deleteBudget, addTask, updateTask, deleteTask, addPost, likePost, addToast, removeToast,
    requestPushPermission, sendTestPush
  }), [currentUser, users, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts, expenses, budgets, posts, tasks, myClients, myTrainers, login, logout, register, updateUser, addUser, deleteUser, resetUsers, toggleBlockUser, addNotification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, addRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate, logWorkout, addGymClass, updateGymClass, deleteGymClass, bookClass, sendMessage, markMessagesAsRead, addAnnouncement, updateAnnouncement, deleteAnnouncement, sendAICoachMessage, addChallenge, updateChallenge, deleteChallenge, joinChallenge, unlockAchievement, addEquipment, updateEquipment, deleteEquipment, reportIncident, resolveIncident, addNutritionLog, addPayment, addExpense, deleteExpense, addBudget, updateBudget, deleteBudget, addTask, updateTask, deleteTask, addPost, likePost, addToast, removeToast, requestPushPermission, sendTestPush, isReportModalOpen]);

  return (
    <ThemeProvider>
      <AuthContext.Provider value={contextValue as any}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <CommandPalette />
          {isReportModalOpen && <SupportModal />}
          {isLoading ? <SplashScreen /> : (currentUser ? 
            <div className="flex flex-col min-h-screen">
                { {
                    [Role.ADMIN]: <AdminDashboard />, [Role.CLIENT]: <ClientDashboard />, [Role.TRAINER]: <TrainerDashboard />,
                    [Role.RECEPTIONIST]: <ReceptionistDashboard />, [Role.GENERAL_MANAGER]: <GeneralManagerDashboard />,
                    [Role.GROUP_INSTRUCTOR]: <GroupInstructorDashboard />, [Role.NUTRITIONIST]: <NutritionistDashboard />,
                    [Role.PHYSIOTHERAPIST]: <PhysiotherapistDashboard />,
                }[currentUser.role] || <div className="p-20 text-center">Dashboard not found</div> }
            </div> : <LoginScreen />
          )}
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;
