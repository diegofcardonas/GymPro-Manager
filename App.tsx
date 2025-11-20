
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Role, Notification, PreEstablishedRoutine, NotificationType, Payment, WorkoutSession, GymClass, Message, Announcement, Challenge, Achievement, EquipmentItem, IncidentReport, AICoachMessage, NutritionLog, MembershipStatus, ToastMessage } from './types';
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

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);
  
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
  const aiChatSessions = useMemo(() => new Map<string, any>(), []);
  
  // Toast Helpers
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  }, []);


  const login = useCallback(async (email: string, password: string): Promise<string | void> => {
    const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (userToLogin) {
      setCurrentUser(userToLogin);
      addToast(t('toast.welcome', { name: userToLogin.name }), 'success');
    } else {
      return t('toast.passwordError');
    }
  }, [users, t, addToast]);
  
  const register = useCallback(async (user: any): Promise<string | void> => {
      const existingUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      if(existingUser) {
          return t('toast.emailExists');
      }
      
      const newUser: User = {
          ...user,
          id: `u${Date.now()}`,
          joinDate: new Date().toISOString(),
          membership: {
              status: MembershipStatus.PENDING,
              startDate: new Date().toISOString(),
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
              tierId: MOCK_TIERS[0].id
          },
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
      };
      
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      addToast(t('toast.accountCreated'), 'success');
  }, [users, setUsers, addToast, t]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    addToast(t('toast.loggedOut'), 'info');
  }, [addToast, t]);

  const updateCurrentUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    addToast(t('toast.profileUpdated'), 'success');
  }, [setUsers, addToast, t]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    // IMPORTANT: If we are updating the currently logged-in user, update that state too
    if(currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    addToast(t('toast.userUpdated'), 'success');
  }, [currentUser, setUsers, addToast, t]);

  const addUser = useCallback((newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    addToast(t('toast.userAdded'), 'success');
  }, [setUsers, addToast, t]);

  const deleteUser = useCallback((userId: string) => {
    // 1. Clean up Users array (remove user, and remove references to user in other users)
    setUsers(prevUsers => {
      return prevUsers
        .filter(u => u.id !== userId) // Remove the user
        .map(user => {
           // If deleting a trainer, remove them from clients' trainerIds
           // Safe check: ensure trainerIds exists before filtering
           if (user.role === Role.CLIENT && user.trainerIds && user.trainerIds.includes(userId)) {
               return { ...user, trainerIds: user.trainerIds.filter(id => id !== userId) };
           }
           return user;
        });
    });

    // 2. Clean up Classes: Remove classes owned by user OR remove booking if user is client
    setGymClasses(prevClasses => {
        return prevClasses
            .filter(c => c.trainerId !== userId) // Remove classes owned by this user (if trainer)
            .map(c => ({
                ...c,
                // Safe check: ensure bookedClientIds exists
                bookedClientIds: (c.bookedClientIds || []).filter(id => id !== userId) 
            }));
    });

    // 3. Clean up Challenges: Remove user from participation
    setChallenges(prevChallenges => prevChallenges.map(c => ({
        ...c,
        // Safe check: ensure participants exists
        participants: (c.participants || []).filter(p => p.userId !== userId)
    })));

    // 4. Clean up Messages: Remove messages where user is sender or receiver
    setMessages(prev => prev.filter(m => m.senderId !== userId && m.receiverId !== userId));
    
    // 5. Clean up Payments: Remove user payments
    setPayments(prev => prev.filter(p => p.userId !== userId));

    // Only show toast if it's an admin deleting another user, not self-deletion
    if (currentUser && currentUser.id !== userId) {
        addToast(t('toast.userDeleted'), 'info');
    }
  }, [currentUser, setUsers, setGymClasses, setChallenges, setMessages, setPayments, addToast, t]);

  const resetUsers = useCallback(() => {
      setUsers(MOCK_USERS);
      
      // If current user was a custom one, they might not exist in MOCK_USERS anymore.
      if (currentUser) {
          const foundUser = MOCK_USERS.find(u => u.id === currentUser.id);
          if (foundUser) {
              setCurrentUser(foundUser);
          } else {
              setCurrentUser(null); // Logout if current user no longer exists
          }
      }
      addToast(t('toast.usersReset'), 'success');
  }, [currentUser, setUsers, addToast, t]);

  const toggleBlockUser = useCallback((userIdToBlock: string) => {
    if (!currentUser) return;
    const currentBlockedIds = currentUser.blockedUserIds || [];
    const isBlocked = currentBlockedIds.includes(userIdToBlock);
    const newBlockedIds = isBlocked
        ? currentBlockedIds.filter(id => id !== userIdToBlock)
        : [...currentBlockedIds, userIdToBlock];
    
    const updatedUser = { ...currentUser, blockedUserIds: newBlockedIds };
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    addToast(isBlocked ? t('toast.userUnblocked') : t('toast.userBlocked'), 'info');
  }, [currentUser, setUsers, addToast, t]);

  const markNotificationAsRead = useCallback((notificationId: string) => { setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)); }, [setNotifications]);
  const markAllNotificationsAsRead = useCallback((userId: string) => { setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n)); }, [setNotifications]);
  const deleteNotification = useCallback((notificationId: string) => { setNotifications(prev => prev.filter(n => n.id !== notificationId)); }, [setNotifications]);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const newNotification: Notification = { ...notification, id: `n${Date.now()}`, timestamp: new Date().toISOString(), isRead: false, };
      setNotifications(prev => [newNotification, ...prev]);
  }, [setNotifications]);

  const addRoutineTemplate = useCallback((newRoutine: PreEstablishedRoutine) => { 
      setPreEstablishedRoutines(prev => [...prev, newRoutine]); 
      addToast(t('toast.routineTemplateCreated'), 'success');
  }, [setPreEstablishedRoutines, addToast, t]);
  
  const updateRoutineTemplate = useCallback((updatedRoutine: PreEstablishedRoutine) => { 
      setPreEstablishedRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r)); 
      addToast(t('toast.routineTemplateUpdated'), 'success');
  }, [setPreEstablishedRoutines, addToast, t]);
  
  const deleteRoutineTemplate = useCallback((routineId: string) => { 
      setPreEstablishedRoutines(prev => prev.filter(r => r.id !== routineId)); 
      addToast(t('toast.routineTemplateDeleted'), 'info');
  }, [setPreEstablishedRoutines, addToast, t]);

  const logWorkout = useCallback((userId: string, session: WorkoutSession) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const history = u.workoutHistory || [];
        return { ...u, workoutHistory: [...history, session] };
      }
      return u;
    }));
    const client = users.find(u => u.id === userId);
    if(client && client.trainerIds) {
      client.trainerIds.forEach(trainerId => {
        addNotification({ 
            userId: trainerId, 
            title: t('notifications.workoutLoggedTitle'), 
            message: t('notifications.workoutLoggedMsg', { name: client.name }), 
            type: NotificationType.SUCCESS, 
        });
      });
    }
    addToast(t('toast.workoutLogged'), 'success');
  }, [users, addNotification, setUsers, addToast, t]);

  const addGymClass = useCallback((gymClass: Omit<GymClass, 'id'>) => { 
      setGymClasses(prev => [...prev, { ...gymClass, id: `c${Date.now()}`}]); 
      addToast(t('toast.classAdded'), 'success');
  }, [setGymClasses, addToast, t]);
  
  const updateGymClass = useCallback((updatedClass: GymClass) => { 
      setGymClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c)); 
      addToast(t('toast.classUpdated'), 'success');
  }, [setGymClasses, addToast, t]);
  
  const deleteGymClass = useCallback((classId: string) => { 
      setGymClasses(prev => prev.filter(c => c.id !== classId)); 
      addToast(t('toast.classCancelled'), 'info');
  }, [setGymClasses, addToast, t]);
  
  const bookClass = useCallback((classId: string, userId: string) => {
    setGymClasses(prev => prev.map(c => {
      if (c.id === classId) {
        if (c.bookedClientIds.includes(userId)) { 
            addToast(t('toast.alreadyBooked'), 'warning');
            return c; 
        }
        if (c.bookedClientIds.length >= c.capacity) { 
            addToast(t('toast.classFull'), 'error');
            return c; 
        }
        const updatedClass = { ...c, bookedClientIds: [...c.bookedClientIds, userId] };
        addNotification({ 
            userId: c.trainerId, 
            title: t('notifications.newBookingTitle'), 
            message: t('notifications.newBookingMsg', { name: users.find(u=>u.id===userId)?.name || 'A client', class: c.name }), 
            type: NotificationType.INFO, 
        });
        addToast(t('toast.bookedSuccess', { name: c.name }), 'success');
        return updatedClass;
      }
      return c;
    }));
  }, [addNotification, users, setGymClasses, addToast, t]);

  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const newMessage: Message = { ...message, id: `m${Date.now()}`, timestamp: new Date().toISOString(), isRead: false, };
    setMessages(prev => [...prev, newMessage]);
    addNotification({ 
        userId: message.receiverId, 
        title: t('notifications.newMessageTitle'), 
        message: t('notifications.newMessageMsg', { name: users.find(u=>u.id===message.senderId)?.name || 'Someone' }), 
        type: NotificationType.INFO 
    });
  }, [addNotification, users, setMessages, t]);
  
  const markMessagesAsRead = useCallback((conversationId: string, userId: string) => {
    setMessages(prev => prev.map(msg =>
        (msg.conversationId === conversationId && msg.receiverId === userId && !msg.isRead)
            ? { ...msg, isRead: true }
            : msg
    ));
  }, [setMessages]);

  const addAnnouncement = useCallback((announcement: Omit<Announcement, 'id' | 'timestamp'>) => { 
      setAnnouncements(prev => [{ ...announcement, id: `a${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]); 
      addToast(t('toast.announcementPublished'), 'success');
  }, [setAnnouncements, addToast, t]);
  
  const updateAnnouncement = useCallback((updatedAnnouncement: Announcement) => { 
      setAnnouncements(prev => prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a)); 
      addToast(t('toast.announcementUpdated'), 'success');
  }, [setAnnouncements, addToast, t]);
  
  const deleteAnnouncement = useCallback((announcementId: string) => { 
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId)); 
      addToast(t('toast.announcementRemoved'), 'info');
  }, [setAnnouncements, addToast, t]);
  
  // AI Coach Logic
  const sendAICoachMessage = useCallback(async (userId: string, message: AICoachMessage): Promise<AICoachMessage | null> => {
    if (!aiChatSessions.has(userId)) {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: t('client.aiCoach.systemInstruction'),
            },
        });
        aiChatSessions.set(userId, chat);
    }
    const chat = aiChatSessions.get(userId);
    
    setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === userId) {
            const updatedUser = { ...u, aiCoachHistory: [...(u.aiCoachHistory || []), message] };
            if (currentUser?.id === userId) {
                setCurrentUser(updatedUser);
            }
            return updatedUser;
        }
        return u;
    }));

    try {
        const result = await chat.sendMessage({ message: message.text });
        const modelResponse: AICoachMessage = {
            role: 'model',
            text: result.text,
            timestamp: new Date().toISOString()
        };
        
        setUsers(prevUsers => {
            return prevUsers.map(u => {
                if (u.id === userId) {
                    const historyWithoutOptimistic = u.aiCoachHistory?.slice(0, -1) || [];
                    const finalHistory = [...historyWithoutOptimistic, message, modelResponse];
                    const updatedUser = { ...u, aiCoachHistory: finalHistory };
                    if (currentUser?.id === userId) {
                        setCurrentUser(updatedUser);
                    }
                    return updatedUser;
                }
                return u;
            });
        });
        
        return modelResponse;
    } catch (error) {
        console.error("AI Coach Error:", error);
        const errorResponse: AICoachMessage = { role: 'model', text: t('app.aiCoachError'), timestamp: new Date().toISOString() };
        
        setUsers(prevUsers => {
            return prevUsers.map(u => {
                if (u.id === userId) {
                    const historyWithoutOptimistic = u.aiCoachHistory?.slice(0, -1) || [];
                    const finalHistory = [...historyWithoutOptimistic, message, errorResponse];
                    const updatedUser = { ...u, aiCoachHistory: finalHistory };
                    if (currentUser?.id === userId) {
                        setCurrentUser(updatedUser);
                    }
                    return updatedUser;
                }
                return u;
            });
        });
        addToast(t('toast.aiCoachUnavailable'), 'error');

        return errorResponse;
    }
  }, [ai, aiChatSessions, currentUser?.id, setUsers, t, addToast]);
  
  // Gamification Logic
  const addChallenge = useCallback((challenge: Omit<Challenge, 'id' | 'participants'>) => {
    setChallenges(prev => [...prev, { ...challenge, id: `chal-${Date.now()}`, participants: [] }]);
    addToast(t('toast.challengeCreated'), 'success');
  }, [setChallenges, addToast, t]);
  
  const updateChallenge = useCallback((challenge: Challenge) => { 
      setChallenges(prev => prev.map(c => c.id === challenge.id ? challenge : c)); 
      addToast(t('toast.challengeUpdated'), 'success');
  }, [setChallenges, addToast, t]);
  
  const deleteChallenge = useCallback((id: string) => { 
      setChallenges(prev => prev.filter(c => c.id !== id)); 
      addToast(t('toast.challengeDeleted'), 'info');
  }, [setChallenges, addToast, t]);
  
  const joinChallenge = useCallback((challengeId: string, userId: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId && !c.participants.some(p => p.userId === userId)) {
        addToast(t('toast.challengeJoined'), 'success');
        return { ...c, participants: [...c.participants, { userId, progress: 0 }] };
      }
      return c;
    }));
  }, [setChallenges, addToast, t]);
  
  const unlockAchievement = useCallback((userId: string, achievementId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId && !(u.achievements || []).includes(achievementId)) {
        const achievementName = achievements.find(a=>a.id === achievementId)?.name;
        addNotification({ 
            userId, 
            title: t('notifications.achievementTitle'), 
            message: t('notifications.achievementMsg', { name: achievementName }), 
            type: NotificationType.SUCCESS 
        });
        addToast(t('toast.achievementUnlocked', { name: achievementName }), 'success');
        return { ...u, achievements: [...(u.achievements || []), achievementId] };
      }
      return u;
    }));
  }, [addNotification, achievements, setUsers, addToast, t]);

  // Equipment & Incidents Logic
  const addEquipment = useCallback((item: Omit<EquipmentItem, 'id'>) => { 
      setEquipment(prev => [...prev, { ...item, id: `eq-${Date.now()}` }]); 
      addToast(t('toast.equipmentAdded'), 'success');
  }, [setEquipment, addToast, t]);
  
  const updateEquipment = useCallback((item: EquipmentItem) => { 
      setEquipment(prev => prev.map(e => e.id === item.id ? item : e)); 
      addToast(t('toast.equipmentUpdated'), 'success');
  }, [setEquipment, addToast, t]);
  
  const deleteEquipment = useCallback((id: string) => { 
      setEquipment(prev => prev.filter(e => e.id !== id)); 
      addToast(t('toast.equipmentRemoved'), 'info');
  }, [setEquipment, addToast, t]);
  
  const reportIncident = useCallback((incident: Omit<IncidentReport, 'id' | 'timestamp' | 'isResolved'>) => {
    const newIncident = { ...incident, id: `inc-${Date.now()}`, timestamp: new Date().toISOString(), isResolved: false };
    setIncidents(prev => [newIncident, ...prev]);
    addNotification({ 
        userId: '1', 
        title: t('notifications.incidentTitle'), 
        message: t('notifications.incidentMsg', { id: incident.equipmentId }), 
        type: NotificationType.ALERT 
    });
    setIsReportModalOpen(false);
    addToast(t('toast.incidentReported'), 'warning');
  }, [addNotification, setIncidents, addToast, t]);
  
  const resolveIncident = useCallback((id: string) => { 
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, isResolved: true } : i)); 
      addToast(t('toast.incidentResolved'), 'success');
  }, [setIncidents, addToast, t]);
  
  const toggleReportModal = useCallback(() => {
    setIsReportModalOpen(prev => !prev);
  }, []);

  // Nutrition Log Logic
  const addNutritionLog = useCallback(async (userId: string, log: Omit<NutritionLog, 'id'>) => {
    let newLog: NutritionLog = { ...log, id: `nut-${Date.now()}` };

    try {
        const prompt = i18n.language.startsWith('es') 
            ? `Eres un asistente de nutrición servicial. Analiza la siguiente descripción de comida y proporciona un análisis breve y alentador. Comida: "${log.mealDescription}"`
            : `You are a helpful nutrition assistant. Analyze the following food description and provide a brief, encouraging analysis. Food: "${log.mealDescription}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedCalories: { type: Type.STRING, description: i18n.language.startsWith('es') ? "p. ej., 400-500" : "e.g., 400-500" },
                        estimatedMacros: {
                            type: Type.OBJECT,
                            properties: {
                                protein: { type: Type.STRING, description: i18n.language.startsWith('es') ? "p. ej., ~30g" : "e.g., ~30g" },
                                carbs: { type: Type.STRING, description: i18n.language.startsWith('es') ? "p. ej., ~50g" : "e.g., ~50g" },
                                fat: { type: Type.STRING, description: i18n.language.startsWith('es') ? "p. ej., ~15g" : "e.g., ~15g" },
                            },
                            required: ['protein', 'carbs', 'fat']
                        },
                        suggestion: { type: Type.STRING, description: i18n.language.startsWith('es') ? "Una sugerencia útil para una futura comida." : "A helpful suggestion for a future meal." },
                    },
                    required: ['estimatedCalories', 'estimatedMacros', 'suggestion']
                }
            }
        });
        
        const jsonText = response.text.trim();
        const analysis = JSON.parse(jsonText);
        newLog.aiAnalysis = analysis;
        addToast(t('toast.mealAnalyzed'), 'success');
    } catch (error) {
        console.error("Nutrition AI Error:", error);
        newLog.aiAnalysis = { estimatedCalories: "N/A", estimatedMacros: { protein: "N/A", carbs: "N/A", fat: "N/A" }, suggestion: t('app.nutritionLogError') };
        addToast(t('toast.mealAnalysisFailed'), 'warning');
    }

    setUsers(prevUsers => {
        return prevUsers.map(u => {
            if (u.id === userId) {
                const updatedLogs = [newLog, ...(u.nutritionLogs || [])];
                const updatedUser = { ...u, nutritionLogs: updatedLogs };
                if (currentUser?.id === userId) {
                    setCurrentUser(updatedUser);
                }
                return updatedUser;
            }
            return u;
        });
    });
  }, [ai, currentUser?.id, setUsers, i18n.language, t, addToast]);

  // POS Logic
  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
      setPayments(prev => [...prev, { ...payment, id: `p${Date.now()}` }]);
      addToast(t('toast.paymentSuccess') || 'Payment recorded successfully', 'success');
  }, [setPayments, addToast, t]);

  const myTrainers = useMemo(() => { if (currentUser?.role !== Role.CLIENT) return []; return users.filter(u => u.role === Role.TRAINER && currentUser.trainerIds?.includes(u.id)); }, [currentUser, users]);
  const myClients = useMemo(() => { if (currentUser?.role !== Role.TRAINER) return []; return users.filter(u => u.role === Role.CLIENT && u.trainerIds?.includes(currentUser.id)); }, [currentUser, users]);

  const authContextValue = useMemo(() => ({
    currentUser, users, myClients, myTrainers, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts,
    logout, updateCurrentUser, updateUser, addUser, deleteUser, resetUsers, toggleBlockUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, addNotification, addRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate, logWorkout, addGymClass, updateGymClass, deleteGymClass, bookClass, sendMessage, markMessagesAsRead, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    sendAICoachMessage, addChallenge, updateChallenge, deleteChallenge, joinChallenge, unlockAchievement, addEquipment, updateEquipment, deleteEquipment, reportIncident, resolveIncident, toggleReportModal, addNutritionLog, addPayment, login, register, addToast, removeToast
  }), [
      currentUser, users, myClients, myTrainers, notifications, preEstablishedRoutines, payments, gymClasses, messages, announcements, challenges, achievements, equipment, incidents, toasts,
      logout, updateCurrentUser, updateUser, addUser, deleteUser, resetUsers, toggleBlockUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, addNotification, addRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate, logWorkout, addGymClass, updateGymClass, deleteGymClass, bookClass, sendMessage, markMessagesAsRead, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      sendAICoachMessage, addChallenge, updateChallenge, deleteChallenge, joinChallenge, unlockAchievement, addEquipment, updateEquipment, deleteEquipment, reportIncident, resolveIncident, toggleReportModal, addNutritionLog, addPayment, login, register, addToast, removeToast
  ]);
  
  const renderContent = () => {
    if (!currentUser) {
      return (
        <>
            <LoginScreen />
            <Footer />
        </>
      );
    }

    const dashboards: { [key in Role]?: React.ReactElement } = {
        [Role.ADMIN]: <AdminDashboard />,
        [Role.CLIENT]: <ClientDashboard />,
        [Role.TRAINER]: <TrainerDashboard />,
        [Role.RECEPTIONIST]: <ReceptionistDashboard />,
        [Role.GENERAL_MANAGER]: <GeneralManagerDashboard />,
        [Role.GROUP_INSTRUCTOR]: <GroupInstructorDashboard />,
        [Role.NUTRITIONIST]: <NutritionistDashboard />,
        [Role.PHYSIOTHERAPIST]: <PhysiotherapistDashboard />,
    };

    const dashboard = dashboards[currentUser.role];
    
    if (!dashboard) {
        return (
            <div className="flex flex-col min-h-screen">
                <header className="p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex justify-between items-center border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center space-x-3">
                        <LogoIcon className="w-8 h-8"/>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 capitalize">{t(`roles.${currentUser.role}`)} Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                         <LanguageSwitcher />
                         <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">{t('general.welcome', { name: currentUser.name })}</span>
                         <img src={currentUser.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"/>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label={t('placeholders.logout')}>
                            <LogoutIcon className="w-6 h-6 text-gray-600 dark:text-gray-400"/>
                        </button>
                    </div>
                </header>
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('placeholders.dashboardComingSoon')}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('placeholders.dashboardInConstruction', { role: t(`roles.${currentUser.role}`).toLowerCase() })}</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }
    
    return (
      <div className="flex flex-col min-h-screen">
        {dashboard}
        {isReportModalOpen && currentUser && <ReportIncidentModal reportedById={currentUser.id} onClose={() => setIsReportModalOpen(false)} />}
      </div>
    );
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider value={authContextValue}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col overflow-x-hidden">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <CommandPalette />
          {isLoading ? <SplashScreen /> : renderContent()}
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;
