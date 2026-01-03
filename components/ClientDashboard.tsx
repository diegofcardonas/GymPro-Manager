
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import ClientSidebar from './client/ClientSidebar';
import SettingsView from './SettingsView';
import MembershipCard from './client/MembershipCard';
import NotificationBell from './NotificationBell';
import NotificationsView from './NotificationsView';
import WorkoutLog from './client/WorkoutLog';
import ProgressView from './client/ProgressView';
import ClassBooking from './client/ClassBooking';
import MessagingView from './MessagingView';
import AICoachView from './client/AICoachView';
import SocialFeed from './client/SocialFeed';
import NutritionLog from './client/NutritionLog';
import ChallengesView from './client/ChallengesView';
import AchievementsView from './client/AchievementsView';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { BottomNavigation } from './shared/BottomNavigation';
import { LogoIcon } from './icons/LogoIcon';
import { GoogleGenAI } from '@google/genai';
import { SparklesAiIcon } from './icons/SparklesAiIcon';
import ProfileEditor from './shared/ProfileEditor';

type View = 'dashboard' | 'social' | 'routine' | 'workout-log' | 'progress' | 'classes' | 'messages' | 'membership-card' | 'profile' | 'notifications' | 'settings' | 'ai-coach' | 'nutrition-log' | 'challenges' | 'achievements' | 'profile-edit';

const ClientDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useContext(AuthContext);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
        if (!currentUser || !process.env.API_KEY) return;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Genera una frase de motivación fitness muy corta (máximo 15 palabras) para ${currentUser.name}. Idioma: ${i18n.language}.`;
            const res = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt 
            });
            setDailyQuote(res.text || 'Hoy es un gran día para superar tus límites.');
        } catch (e) {
            setDailyQuote('Forja tu mejor versión hoy mismo.');
        } finally {
            setLoadingQuote(false);
        }
    };
    if (activeView === 'dashboard') fetchQuote();
  }, [currentUser, i18n.language, activeView]);

  if (!currentUser) return null;

  const renderContent = () => {
      switch (activeView) {
          case 'dashboard': return (
              <div className="w-full max-w-4xl space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-800/50 rounded-4xl shadow-xl p-8 border border-black/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">¡Hola, {currentUser.name.split(' ')[0]}!</h2>
                        <p className="text-gray-500 mb-8 font-medium">Tienes {Math.ceil((new Date(currentUser.membership.endDate).getTime() - new Date().getTime())/(1000*60*60*24))} días de membresía restantes.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => setActiveView('workout-log')} className="p-4 bg-primary text-white rounded-3xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Empezar a Entrenar</button>
                            <button onClick={() => setActiveView('classes')} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-3xl font-black text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Ver Clases</button>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-72 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl group">
                        <SparklesAiIcon className="absolute -right-4 -top-4 w-24 h-24 opacity-10 group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-3">Chispa Diaria IA</span>
                            {loadingQuote ? (
                                <div className="space-y-2">
                                    <div className="h-3 bg-white/20 rounded w-full animate-pulse"></div>
                                    <div className="h-3 bg-white/20 rounded w-2/3 animate-pulse"></div>
                                </div>
                            ) : (
                                <p className="text-lg font-bold leading-tight italic">"{dailyQuote}"</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { id: 'nutrition-log', label: 'Comida', color: 'bg-emerald-500' },
                        { id: 'progress', label: 'Metas', color: 'bg-amber-500' },
                        { id: 'ai-coach', label: 'Coach IA', color: 'bg-violet-500' },
                        { id: 'social', label: 'Muro', color: 'bg-blue-500' }
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            onClick={() => setActiveView(btn.id as View)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-black/5 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                        >
                            <div className={`w-10 h-10 rounded-2xl ${btn.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                <LogoIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tighter text-gray-500 dark:text-gray-400">{btn.label}</span>
                        </button>
                    ))}
                </div>
              </div>
          );
          case 'social': return <SocialFeed />;
          case 'workout-log': return <WorkoutLog onNavigate={setActiveView} />;
          case 'progress': return <ProgressView />;
          case 'classes': return <ClassBooking />;
          case 'messages': return <MessagingView />;
          case 'ai-coach': return <AICoachView />;
          case 'nutrition-log': return <NutritionLog />;
          case 'challenges': return <ChallengesView />;
          case 'achievements': return <AchievementsView />;
          case 'membership-card': return <MembershipCard user={currentUser} />;
          case 'notifications': return <NotificationsView />;
          case 'settings': return <SettingsView />;
          case 'profile-edit': return <ProfileEditor onCancel={() => setActiveView('dashboard')} />;
          case 'profile': return (
              <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-xl text-center border border-black/5 animate-fade-in">
                  <img src={currentUser.avatarUrl} className="w-32 h-32 rounded-full mx-auto border-4 border-primary/20 mb-4 shadow-lg" />
                  <h2 className="text-3xl font-black">{currentUser.name}</h2>
                  <p className="text-gray-500 mb-8 font-medium">{currentUser.email}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveView('profile-edit')} className="p-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Editar Perfil</button>
                    <button onClick={() => setActiveView('settings')} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Ajustes</button>
                  </div>
              </div>
          );
          default: return null;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <div className="hidden md:block h-full">
            <ClientSidebar activeView={activeView as any} setActiveView={setActiveView as any} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </div>
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pb-16 md:pb-0`}>
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-30 p-4 flex justify-between items-center border-b border-black/[0.03] dark:border-white/[0.03] shadow-sm">
                <div className="flex items-center gap-2 md:hidden">
                    <div className="p-1.5 bg-primary/10 rounded-xl">
                        <LogoIcon className="w-7 h-7" />
                    </div>
                    <span className="font-black text-primary tracking-tighter text-lg">GymPro</span>
                </div>

                <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-black/[0.02] dark:border-white/[0.02]">
                    {['dashboard', 'social', 'ai-coach', 'nutrition-log'].map(v => (
                        <button 
                            key={v} 
                            onClick={() => setActiveView(v as any)} 
                            className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 relative overflow-hidden group
                                ${activeView === v 
                                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {t(`client.sidebar.${v}`)}
                            {activeView === v && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full"></span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center gap-1">
                        <NotificationBell onViewAll={() => setActiveView('notifications')} onNotificationClick={v => setActiveView(v as any)} />
                        <UserProfileMenu user={currentUser} onEditProfile={() => setActiveView('profile-edit')} onSettings={() => setActiveView('settings')} onLogout={logout} />
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div key={activeView} className="animate-fade-in w-full max-w-4xl">
                    {renderContent()}
                </div>
            </main>
        </div>
        <BottomNavigation activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
};

export default ClientDashboard;
