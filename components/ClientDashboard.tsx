
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
import ChallengesView from './client/ChallengesView';
import AchievementsView from './client/AchievementsView';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { BottomNavigation } from './shared/BottomNavigation';
import { LogoIcon } from './icons/LogoIcon';

type View = 'dashboard' | 'social' | 'routine' | 'workout-log' | 'progress' | 'classes' | 'messages' | 'membership-card' | 'profile' | 'notifications' | 'settings' | 'ai-coach' | 'nutrition-log' | 'challenges' | 'achievements';

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
          case 'challenges': return <ChallengesView />;
          case 'achievements': return <AchievementsView />;
          case 'membership-card': return <MembershipCard user={currentUser} />;
          case 'notifications': return <NotificationsView />;
          case 'settings': return <SettingsView />;
          case 'profile': return (
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-xl text-center">
                  <img src={currentUser.avatarUrl} className="w-32 h-32 rounded-full mx-auto border-4 border-primary/20 mb-4" />
                  <h2 className="text-3xl font-black">{currentUser.name}</h2>
                  <p className="text-gray-500 mb-6">{currentUser.email}</p>
                  <button onClick={() => setActiveView('settings')} className="btn btn-primary">Editar Perfil</button>
              </div>
          );
          case 'routine': return (
              <div className="w-full max-w-4xl space-y-6">
                  <h2 className="text-3xl font-black">{t('client.routine.title')}</h2>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-black/5 text-center">
                      <p className="text-gray-500">Aquí verás tu rutina asignada por día.</p>
                  </div>
              </div>
          );
          default: return null;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <div className="hidden md:block h-full">
            <ClientSidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </div>
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pb-16 md:pb-0`}>
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-30 p-4 flex justify-between items-center border-b border-black/[0.03] dark:border-white/[0.03] shadow-sm">
                {/* Mobile App Branding */}
                <div className="flex items-center gap-2 md:hidden">
                    <div className="p-1.5 bg-primary/10 rounded-xl">
                        <LogoIcon className="w-7 h-7" />
                    </div>
                    <span className="font-black text-primary tracking-tighter text-lg">GymPro</span>
                </div>

                {/* Desktop Navigation Links */}
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

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Command Hint - Hidden on mobile */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-black/[0.05] dark:border-white/[0.05] rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-tight">
                        <span>Search</span>
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-black/10 dark:border-white/10 rounded text-[9px]">⌘K</kbd>
                    </div>

                    <div className="h-8 w-px bg-black/[0.05] dark:bg-white/[0.05] hidden sm:block"></div>

                    <div className="flex items-center gap-1">
                        <NotificationBell onViewAll={() => setActiveView('notifications')} onNotificationClick={v => setActiveView(v as any)} />
                        <UserProfileMenu user={currentUser} onSettings={() => setActiveView('settings')} onLogout={logout} />
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
