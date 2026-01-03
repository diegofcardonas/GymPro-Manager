
import React, { useState, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import DashboardOverview from './admin/DashboardOverview';
import UserManagement from './admin/UserManagement';
import { MembershipStatus, Role, User } from '../types';
import Sidebar from './Sidebar';
import { MenuIcon } from './icons/MenuIcon';
import SettingsView from './SettingsView';
import { Reports } from './admin/Reports';
import AppSettings from './admin/AppSettings';
import MembershipTiers from './admin/MembershipTiers';
import NotificationBell from './NotificationBell';
import NotificationsView from './NotificationsView';
import RoutineTemplates from './admin/RoutineTemplates';
import Payments from './admin/Payments';
import ClassSchedule from './admin/ClassSchedule';
import Announcements from './admin/Announcements';
import ChallengesManagement from './admin/ChallengesManagement';
import EquipmentManagement from './admin/EquipmentManagement';
import TaskManagement from './admin/TaskManagement';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { PointOfSale } from './admin/PointOfSale';
import ProfileEditor from './shared/ProfileEditor';

type View = 'dashboard' | 'users' | 'reports' | 'membership-tiers' | 'routine-templates' | 'app-settings' | 'settings' | 'notifications' | 'payments' | 'class-schedule' | 'announcements' | 'challenges' | 'equipment' | 'pos' | 'tasks' | 'profile-edit';
export type DashboardFilter = { type: 'status', value: MembershipStatus } | { type: 'role', value: Role.CLIENT | Role.TRAINER } | { type: 'unassigned' } | null;

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, logout } = useContext(AuthContext);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [filter, setFilter] = useState<DashboardFilter>(null);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [selectedUserForManagement, setSelectedUserForManagement] = useState<User | null>(null);

    const handleNavigation = (view: any, newFilter: DashboardFilter = null) => {
        setFilter(newFilter);
        setActiveView(view);
    };

    const handleUserClick = (user: User) => {
        setSelectedUserForManagement(user);
        setActiveView('users');
    };

    const renderContent = () => {
        switch(activeView) {
            case 'dashboard': return <DashboardOverview onNavigate={handleNavigation} onUserClick={handleUserClick} />;
            // FIX: Removed duplicate 'onFilterClear' prop to resolve the JSX element multiple attributes with the same name error.
            case 'users': return <UserManagement initialFilter={filter} onFilterClear={() => setFilter(null)} initialUser={selectedUserForManagement} />;
            case 'reports': return <Reports />;
            case 'payments': return <Payments />;
            case 'pos': return <PointOfSale />;
            case 'tasks': return <TaskManagement />;
            case 'class-schedule': return <ClassSchedule />;
            case 'announcements': return <Announcements />;
            case 'challenges': return <ChallengesManagement />;
            case 'equipment': return <EquipmentManagement />;
            case 'membership-tiers': return <MembershipTiers />;
            case 'routine-templates': return <RoutineTemplates />;
            case 'app-settings': return <AppSettings />;
            case 'notifications': return <NotificationsView />;
            case 'settings': return <SettingsView />;
            case 'profile-edit': return <ProfileEditor onCancel={() => setActiveView('dashboard')} />;
            default: return <DashboardOverview onNavigate={handleNavigation} onUserClick={handleUserClick} />;
        }
    }
    
    const viewTitles: Record<View, string> = {
        dashboard: t('admin.dashboard.title'),
        users: t('admin.dashboard.userManagement'),
        reports: t('admin.dashboard.reports'),
        payments: t('admin.dashboard.finances'),
        pos: t('receptionist.nav.pos'),
        tasks: 'Gestión de Tareas',
        'class-schedule': t('admin.dashboard.classSchedule'),
        announcements: t('admin.dashboard.announcements'),
        challenges: t('admin.dashboard.challenges'),
        equipment: t('admin.dashboard.equipment'),
        'membership-tiers': t('admin.dashboard.membershipTiers'),
        'routine-templates': t('admin.dashboard.routineTemplates'),
        'app-settings': t('admin.dashboard.appSettings'),
        notifications: t('admin.dashboard.notifications'),
        settings: t('admin.dashboard.settings'),
        'profile-edit': 'Editar Perfil'
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex text-gray-800 dark:text-gray-200">
            <Sidebar 
                activeView={activeView as any} 
                setActiveView={setActiveView as any}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden" />}
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm sticky top-0 z-20 p-4 border-b border-black/10 dark:border-white/10">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden">
                                <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                            <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">{viewTitles[activeView]}</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <LanguageSwitcher />
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
                <Footer />
            </div>
        </div>
    );
};

export default AdminDashboard;
