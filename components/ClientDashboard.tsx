
import React, { useContext, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MembershipStatus, User, MembershipTier, Announcement } from '../types';
import { MenuIcon } from './icons/MenuIcon';
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
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { BottomNavigation } from './shared/BottomNavigation';
import { LogoIcon } from './icons/LogoIcon';

type View = 'dashboard' | 'social' | 'routine' | 'workout-log' | 'progress' | 'classes' | 'messages' | 'membership-card' | 'profile' | 'notifications' | 'settings' | 'ai-coach' | 'nutrition-log';

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, logout, updateCurrentUser, addNotification } = useContext(AuthContext);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!currentUser) return null;

  const renderContent = () => {
      switch (activeView) {
          case 'dashboard': return (
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800/50 rounded-3xl shadow-xl p-8 animate-fade-in border border-black/5">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">¡Hola, {currentUser.name.split(' ')[0]}!</h2>
                <p className="text-gray-500 mb-8 font-medium">Tienes {Math.ceil((new Date(currentUser.membership.endDate).getTime() - new Date().getTime())/(1000*60*60*24))} días de membresía restantes.</p>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveView('workout-log')} className="p-6 bg-primary text-white rounded-3xl font-black text-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Empezar a Entrenar</button>
                    <button onClick={() => setActiveView('classes')} className="p-6 bg-gray-100 dark:bg-gray-700 rounded-3xl font-black text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Ver Clases</button>
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
          case 'membership-card': return <MembershipCard user={currentUser} />;
          case 'notifications': return <NotificationsView />;
          case 'settings': return <SettingsView />;
          default: return null;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <div className="hidden md:block h-full">
            <ClientSidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </div>
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pb-16 md:pb-0`}>
            <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm sticky top-0 z-30 p-4 flex justify-between items-center border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 md:hidden"><LogoIcon className="w-8 h-8" /><span className="font-bold text-primary">GymPro</span></div>
                <nav className="hidden md:flex gap-6 mx-auto">
                    {['dashboard', 'social', 'ai-coach', 'nutrition-log'].map(v => (
                        <button key={v} onClick={() => setActiveView(v as any)} className={`text-sm font-black uppercase tracking-widest transition-all ${activeView === v ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t(`client.sidebar.${v}`)}</button>
                    ))}
                </nav>
                <div className="flex items-center space-x-4">
                    <NotificationBell onViewAll={() => setActiveView('notifications')} onNotificationClick={v => setActiveView(v as any)} />
                    <UserProfileMenu user={currentUser} onSettings={() => setActiveView('settings')} onLogout={logout} />
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div key={activeView} className="animate-fade-in w-full max-w-4xl">{renderContent()}</div>
            </main>
        </div>
        <BottomNavigation activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
};

export default ClientDashboard;
