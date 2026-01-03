
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
import { MOCK_TIERS } from './data/membershipTiers';
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
import Footer from './components/Footer';
import { ToastContainer } from './components/shared/Toast';
import { CommandPalette } from './components/shared/CommandPalette';
import { GoogleGenAI, Type } from "@google/genai";
import SplashScreen from './components/SplashScreen';

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
  const { t } = useTranslation();
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
  
  useEffect(() => { setTimeout(() => setIsLoading(false), 2000); }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => { setToasts(prev => prev.filter(t => t.id !== id)); }, []);

  const addPost = useCallback((post: Omit<SocialPost, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
    const newPost: SocialPost = {
        ...post,
        id: `p-${Date.now()}`,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString()
    };
    setPosts(prev => [newPost, ...prev]);
  }, [setPosts]);

  const likePost = useCallback((postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
        if(p.id !== postId) return p;
        const alreadyLiked = p.likes.includes(userId);
        return { ...p, likes: alreadyLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
    }));
  }, [setPosts]);

  const login = useCallback(async (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) { setCurrentUser(user); addToast(t('toast.welcome', { name: user.name }), 'success'); }
    else return t('toast.passwordError');
  }, [users, t, addToast, setCurrentUser]);

  const logout = useCallback(() => { setCurrentUser(null); addToast(t('toast.loggedOut'), 'info'); }, [addToast, t, setCurrentUser]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if(currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  }, [currentUser, setUsers, setCurrentUser]);

  const unlockAchievement = useCallback((userId: string, achId: string) => {
    const user = users.find(u => u.id === userId);
    const ach = achievements.find(a => a.id === achId);
    if(user && ach && !user.achievements?.includes(achId)) {
        const updatedUser = { ...user, achievements: [...(user.achievements || []), achId] };
        updateUser(updatedUser);
        addToast(t('toast.achievementUnlocked', { name: ach.name }), 'success');
        addPost({ userId, userName: user.name, userAvatar: user.avatarUrl, content: `¡Ha ganado el trofeo "${ach.name}"! 🏆`, type: 'achievement' });
    }
  }, [users, achievements, updateUser, addToast, t, addPost]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => [{ ...n, id: `n${Date.now()}`, timestamp: new Date().toISOString(), isRead: false }, ...prev]);
  }, [setNotifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, [setNotifications]);

  const markAllNotificationsAsRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  }, [setNotifications]);

  const addPayment = useCallback((p: Omit<Payment, 'id'>) => setPayments(prev => [{ ...p, id: `p${Date.now()}` }, ...prev]), [setPayments]);

  const logWorkout = useCallback((userId: string, session: WorkoutSession) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, workoutHistory: [session, ...(user.workoutHistory || [])] };
      updateUser(updatedUser);
      addToast(t('toast.workoutLogged'), 'success');
    }
  }, [users, updateUser, addToast, t]);

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
        config: {
          systemInstruction: t('client.aiCoach.systemInstruction'),
        }
      });
      
      const modelMessage: AICoachMessage = {
        role: 'model',
        text: response.text || '',
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...updatedUserWithUserMsg.aiCoachHistory, modelMessage];
      updateUser({ ...updatedUserWithUserMsg, aiCoachHistory: finalHistory });
      return modelMessage;
    } catch (error) {
      console.error("AI Coach Error:", error);
      addToast(t('app.aiCoachError'), 'error');
      return null;
    }
  }, [users, updateUser, addToast, t]);

  const bookClass = useCallback((classId: string, userId: string) => {
    setGymClasses(prev => prev.map(c => {
      if (c.id !== classId) return c;
      if (c.bookedClientIds.includes(userId)) {
        addToast(t('toast.alreadyBooked'), 'warning');
        return c;
      }
      if (c.bookedClientIds.length >= c.capacity) {
        addToast(t('toast.classFull'), 'error');
        return c;
      }
      addToast(t('toast.bookedSuccess', { name: c.name }), 'success');
      return { ...c, bookedClientIds: [...c.bookedClientIds, userId] };
    }));
  }, [setGymClasses, addToast, t]);

  const sendMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const newMsg: Message = {
      ...msg,
      id: `m-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);
  }, [setMessages]);

  const markMessagesAsRead = useCallback((conversationId: string, userId: string) => {
    setMessages(prev => prev.map(m => m.conversationId === conversationId && m.receiverId === userId ? { ...m, isRead: true } : m));
  }, [setMessages]);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: `task-${Date.now()}` };
    setTasks(prev => [newTask, ...prev]);
    addToast(t('toast.taskAdded'), 'success');
  }, [setTasks, addToast, t]);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addToast(t('toast.taskDeleted'), 'info');
  }, [setTasks, addToast, t]);

  const contextValue = useMemo(() => ({
    currentUser, users, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts, expenses, budgets, posts, tasks,
    login, logout, updateUser, addNotification, markNotificationAsRead, markAllNotificationsAsRead, unlockAchievement, addPayment, addPost, likePost, toggleReportModal: () => setIsReportModalOpen(prev => !prev),
    addToast, removeToast, logWorkout, sendAICoachMessage, bookClass, sendMessage, markMessagesAsRead, addTask, updateTask, deleteTask
  }), [currentUser, users, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts, expenses, budgets, posts, tasks, login, logout, updateUser, addNotification, markNotificationAsRead, markAllNotificationsAsRead, unlockAchievement, addPayment, addPost, likePost, addToast, removeToast, logWorkout, sendAICoachMessage, bookClass, sendMessage, markMessagesAsRead, addTask, updateTask, deleteTask]);

  return (
    <ThemeProvider>
      <AuthContext.Provider value={contextValue as any}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <CommandPalette />
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
