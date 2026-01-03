
import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Role } from '../types';
import TrainerSidebar from './trainer/TrainerSidebar';
import { MenuIcon } from './icons/MenuIcon';
import SettingsView from './SettingsView';
import NotificationBell from './NotificationBell';
import NotificationsView from './NotificationsView';
import TrainerRoutineTemplates from './trainer/TrainerRoutineTemplates';
import TrainerOverview from './trainer/TrainerOverview';
import TrainerSchedule from './trainer/TrainerSchedule';
import MessagingView from './MessagingView';
import LegalView from './shared/LegalView';
import { XCircleIcon } from './icons/XCircleIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import Footer from './Footer';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { useTranslation } from 'react-i18next';
import TaskBoard from './shared/TaskBoard';
import ProfileEditor from './shared/ProfileEditor';

type View = 'dashboard' | 'clients' | 'schedule' | 'messages' | 'profile' | 'routine-templates' | 'notifications' | 'settings' | 'tasks' | 'profile-edit' | 'privacy' | 'terms';

const TrainerDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, myClients: clientsFromContext, updateUser, logout } = useContext(AuthContext);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const myClients = useMemo(() => clientsFromContext || [], [clientsFromContext]);

    const handleOpenModal = (client: User) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const renderContent = () => {
        if (!currentUser) return null;
        switch (activeView) {
            case 'dashboard': return <TrainerOverview onNavigate={(view) => setActiveView(view as any)} onClientClick={handleOpenModal} />;
            case 'schedule': return <TrainerSchedule />;
            case 'tasks': return <TaskBoard />;
            case 'messages': return <MessagingView />;
            case 'routine-templates': return <TrainerRoutineTemplates />;
            case 'notifications': return <NotificationsView />;
            case 'settings': return <SettingsView />;
            case 'profile-edit': return <ProfileEditor onCancel={() => setActiveView('dashboard')} />;
            case 'privacy': return <LegalView type="privacy" onBack={() => setActiveView('dashboard')} />;
            case 'terms': return <LegalView type="terms" onBack={() => setActiveView('dashboard')} />;
            default: return <TrainerOverview onNavigate={(view) => setActiveView(view as any)} onClientClick={handleOpenModal} />;
        }
    };
    
    const viewTitles: Record<View, string> = {
        dashboard: t('trainer.sidebar.dashboard'),
        clients: t('trainer.sidebar.clients'),
        schedule: t('trainer.sidebar.schedule'),
        tasks: t('trainer.sidebar.tasks'),
        messages: t('trainer.sidebar.messages'),
        profile: t('trainer.sidebar.profile'),
        'routine-templates': t('trainer.sidebar.templates'),
        notifications: t('trainer.sidebar.notifications'),
        settings: t('trainer.sidebar.settings'),
        'profile-edit': t('profile.editTitle'),
        privacy: t('footer.privacy'),
        terms: t('footer.terms')
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            <TrainerSidebar 
                activeView={activeView as any}
                setActiveView={setActiveView as any}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden" />}

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-black/10 dark:border-white/10">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden">
                                <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{viewTitles[activeView]}</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setActiveView('messages')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                            <NotificationBell onViewAll={() => setActiveView('notifications')} onNotificationClick={(view) => setActiveView(view as any)} />
                            {currentUser && (
                                <UserProfileMenu 
                                    user={currentUser}
                                    onEditProfile={() => setActiveView('profile-edit')}
                                    onSettings={() => setActiveView('settings')}
                                    onLogout={logout}
                                />
                            )}
                        </div>
                    </div>
                </header>
                <main className="container mx-auto p-4 md:p-8 flex-1">
                    <div key={activeView} className="w-full animate-fade-in">
                        {renderContent()}
                    </div>
                </main>
                <Footer onNavigate={setActiveView} />
            </div>
        </div>
    );
};

export default TrainerDashboard;
