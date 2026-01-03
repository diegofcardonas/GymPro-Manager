
// FIX: Imported `useMemo` to resolve 'Cannot find name' errors.
import React, { useState, useContext, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { LogoutIcon } from './icons/LogoutIcon';
import DashboardOverview from './admin/DashboardOverview';
import UserManagement from './admin/UserManagement';
import { MembershipStatus, Role, User } from '../types';
import Sidebar from './Sidebar';
import { MenuIcon } from './icons/MenuIcon';
import SettingsView from './SettingsView';
// FIX: Changed to a named import as 'Reports' does not have a default export.
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
import { MOCK_TIERS } from '../data/membershipTiers';
import { XCircleIcon } from './icons/XCircleIcon';
import { PencilIcon } from './icons/PencilIcon';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { PointOfSale } from './admin/PointOfSale';
import { UserDetailsModal } from './admin/UserDetailsModal'; // Import the new component if needed for direct usage, though UserManagement handles it now.


type View = 'dashboard' | 'users' | 'reports' | 'membership-tiers' | 'routine-templates' | 'app-settings' | 'settings' | 'notifications' | 'payments' | 'class-schedule' | 'announcements' | 'challenges' | 'equipment' | 'pos' | 'tasks';
export type DashboardFilter = { type: 'status', value: MembershipStatus } | { type: 'role', value: Role.CLIENT | Role.TRAINER } | { type: 'unassigned' } | null;

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, users, logout, updateCurrentUser } = useContext(AuthContext);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [filter, setFilter] = useState<DashboardFilter>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Sidebar states
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse

    const [selectedUserForManagement, setSelectedUserForManagement] = useState<User | null>(null);

    const handleNavigation = (view: any, newFilter: DashboardFilter = null) => {
        setFilter(newFilter);
        setActiveView(view);
    };

    const handleUserClick = (user: User) => {
        setSelectedUserForManagement(user);
        setActiveView('users');
    };

    const handleProfileSave = (updatedUser: User) => {
        updateCurrentUser(updatedUser);
        setIsEditModalOpen(false);
    }
    
    const renderContent = () => {
        switch(activeView) {
            case 'dashboard':
                return <DashboardOverview onNavigate={handleNavigation} onUserClick={handleUserClick} />;
            case 'users':
                return <UserManagement initialFilter={filter} onFilterClear={() => setFilter(null)} initialUser={selectedUserForManagement} onViewUserDetails={() => {}} />; // onViewUserDetails is internal now, passed dummy
            case 'reports':
                return <Reports />;
            case 'payments':
                return <Payments />;
            case 'pos':
                return <PointOfSale />;
            case 'tasks':
                return <TaskManagement />;
            case 'class-schedule':
                return <ClassSchedule />;
            case 'announcements':
                return <Announcements />;
            case 'challenges':
                return <ChallengesManagement />;
            case 'equipment':
                return <EquipmentManagement />;
            case 'membership-tiers':
                return <MembershipTiers />;
            case 'routine-templates':
                return <RoutineTemplates />;
            case 'app-settings':
                return <AppSettings />;
            case 'notifications':
                return <NotificationsView />;
            case 'settings':
                return <SettingsView />;
            default:
                return <DashboardOverview onNavigate={handleNavigation} onUserClick={handleUserClick} />;
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
        settings: t('admin.dashboard.settings')
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex text-gray-800 dark:text-gray-200">
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
             {/* Mobile Overlay */}
             {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden" aria-hidden="true" />}
            
            {/* Main Content - Adjusts margin based on sidebar state */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm sticky top-0 z-20 p-4 border-b border-black/10 dark:border-white/10">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {/* Hamburger Menu - Mobile Only */}
                             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden" aria-label="Toggle sidebar">
                                <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                            <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">{viewTitles[activeView]}</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <LanguageSwitcher />
                            <NotificationBell 
                                onViewAll={() => setActiveView('notifications')}
                                onNotificationClick={(view) => setActiveView(view as View)}
                            />
                            {currentUser && (
                                <UserProfileMenu 
                                    user={currentUser}
                                    onEditProfile={() => setIsEditModalOpen(true)}
                                    onSettings={() => setActiveView('settings')}
                                    onLogout={logout}
                                />
                            )}
                        </div>
                    </div>
                </header>
                <main className="container mx-auto p-4 md:p-8 flex-1 flex items-start justify-center">
                    <div key={activeView} className="w-full animate-fade-in">
                        {renderContent()}
                    </div>
                </main>
                <Footer />
                {isEditModalOpen && currentUser && <AdminEditProfileModal user={currentUser} onSave={handleProfileSave} onClose={() => setIsEditModalOpen(false)} />}
            </div>
        </div>
    );
};

const AdminEditProfileModal: React.FC<{user: User, onSave: (user: User) => void, onClose: () => void}> = ({ user, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(user);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const currentAge = formData.birthDate ? calculateAge(formData.birthDate) : formData.age;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'emergencyContactName') {
            setFormData(prev => ({...prev, emergencyContact: { ...prev.emergencyContact, name: value, phone: prev.emergencyContact?.phone || '' }}));
        } else if (name === 'emergencyContactPhone') {
             setFormData(prev => ({...prev, emergencyContact: { ...prev.emergencyContact, phone: value, name: prev.emergencyContact?.name || '' }}));
        } else if (name === 'birthDate') {
             const newAge = calculateAge(value);
             setFormData(prev => ({...prev, birthDate: value, age: newAge }));
        } else {
             setFormData(prev => ({...prev, [name]: value}));
        }
    };
    
    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRandomAvatar = () => {
        setFormData(prev => ({...prev, avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
                <h2 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{t('admin.editProfileModal.title')}</h2>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex items-center space-x-4">
                        <img src={formData.avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover"/>
                        <div className="flex flex-col gap-2">
                             <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm rounded-lg text-gray-800 dark:text-gray-200"
                            >
                                {t('admin.editProfileModal.uploadPhoto')}
                            </button>
                            <button type="button" onClick={handleRandomAvatar} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm rounded-lg text-gray-800 dark:text-gray-200">{t('admin.editProfileModal.randomAvatar')}</button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">{t('admin.editProfileModal.personalInfo')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.name')}</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" required/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.email')}</label>
                            <input type="email" name="email" id="email" value={formData.email} className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400" disabled/>
                            <p className="text-xs text-gray-500 mt-1">{t('admin.userManagement.emailCannotBeChanged')}</p>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.phone')}</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.userDetailsModal.gender')}</label>
                            <select name="gender" id="gender" value={formData.gender || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white">
                                <option value="">{t('admin.editProfileModal.selectGender')}</option>
                                <option value="Masculino">{t('genders.Masculino')}</option>
                                <option value="Femenino">{t('genders.Femenino')}</option>
                                <option value="Otro">{t('genders.Otro')}</option>
                                <option value="Prefiero no decirlo">{t('genders.Prefiero no decirlo')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.birthDate')}</label>
                            <input type="date" name="birthDate" id="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" />
                        </div>
                         <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.editProfileModal.age')}</label>
                            <input type="text" name="age" id="age" value={currentAge !== undefined ? currentAge : ''} readOnly className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 pt-4 text-gray-800 dark:text-gray-200">{t('admin.editProfileModal.emergencyContact')}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.editProfileModal.contactName')}</label>
                            <input type="text" name="emergencyContactName" id="emergencyContactName" value={formData.emergencyContact?.name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.editProfileModal.contactPhone')}</label>
                            <input type="tel" name="emergencyContactPhone" id="emergencyContactPhone" value={formData.emergencyContact?.phone || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold transition-colors text-gray-800 dark:text-gray-200">{t('general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors text-primary-foreground">{t('general.saveChanges')}</button>
                </div>
            </form>
        </div>
    )
};

export default AdminDashboard;
