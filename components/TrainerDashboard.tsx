
import React, { useContext, useMemo, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Role, DailyRoutine, Exercise, FitnessLevel, PreEstablishedRoutine, WorkoutSession } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';
import { PencilIcon } from './icons/PencilIcon';
import TrainerSidebar from './trainer/TrainerSidebar';
import { MenuIcon } from './icons/MenuIcon';
import SettingsView from './SettingsView';
import NotificationBell from './NotificationBell';
import NotificationsView from './NotificationsView';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MOCK_EXERCISES } from '../data/mockExercises';
import TrainerRoutineTemplates from './trainer/TrainerRoutineTemplates';
import TrainerOverview from './trainer/TrainerOverview';
import TrainerSchedule from './trainer/TrainerSchedule';
import MessagingView from './MessagingView';
import { XCircleIcon } from './icons/XCircleIcon';
import { NumberInputWithButtons } from './shared/NumberInputWithButtons';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import Footer from './Footer';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { useTranslation } from 'react-i18next';
import TaskBoard from './shared/TaskBoard';

type View = 'dashboard' | 'clients' | 'schedule' | 'messages' | 'profile' | 'routine-templates' | 'notifications' | 'settings' | 'tasks';

const TrainerProfileView: React.FC<{user: User, onEdit: () => void}> = ({ user, onEdit }) => {
    const { t } = useTranslation();
    const calculateAge = (birthDate?: string): number | undefined => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const displayAge = user.birthDate ? calculateAge(user.birthDate) : user.age;

    return (
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('trainer.profile.title')}</h2>
                <button onClick={onEdit} className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center">
                    <PencilIcon className="w-5 h-5"/>
                    <span>{t('trainer.profile.edit')}</span>
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0 text-center">
                    <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700 mx-auto" 
                    />
                    <h3 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                
                <div className="w-full border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 mt-6 md:mt-0 pt-6 md:pt-0 md:pl-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t('general.phone')}</h4>
                            <p className="text-gray-800 dark:text-gray-200">{user.phone || t('admin.userDetailsModal.notApplicable')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t('admin.userDetailsModal.memberSince')}</h4>
                            <p className="text-gray-800 dark:text-gray-200">{new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t('general.gender')}</h4>
                            <p className="text-gray-800 dark:text-gray-200">{user.gender || t('admin.userDetailsModal.notApplicable')}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t('general.age')}</h4>
                            <p className="text-gray-800 dark:text-gray-200">{displayAge ? t('admin.userDetailsModal.ageYears', {age: displayAge}) : t('admin.userDetailsModal.notApplicable')}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                         <div>
                            <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">{t('trainer.profile.skills')}</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{user.skills || t('admin.userDetailsModal.notApplicable')}</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


const MyClientsView: React.FC<{
    myClients: User[];
    handleOpenModal: (client: User) => void;
}> = ({ myClients, handleOpenModal }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('trainer.clients.title')} ({myClients.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {myClients.map(client => (
                    <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center text-center ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition-all duration-300">
                        <img src={client.avatarUrl} alt={client.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-gray-300 dark:ring-gray-600"/>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{client.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{client.email}</p>
                        <button onClick={() => handleOpenModal(client)} className="w-full mt-auto px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-primary-foreground">
                            <PencilIcon className="h-5 w-5" />
                            <span>{t('trainer.clients.manage')}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TrainerDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, myClients: clientsFromContext, updateUser, logout, updateCurrentUser } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<View>('dashboard');

    // Sidebar states
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse

    const myClients = useMemo(() => clientsFromContext || [], [clientsFromContext]);

    const handleOpenModal = (client: User) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const handleSaveChanges = (updatedClient: User) => {
        updateUser(updatedClient);
        setSelectedClient(updatedClient);
    }
    
    const handleProfileSave = (updatedUser: User) => {
        updateCurrentUser(updatedUser);
        setIsEditModalOpen(false);
    }

    const renderContent = () => {
        if (!currentUser) return null;

        switch (activeView) {
            case 'dashboard':
                return <TrainerOverview onNavigate={(view) => setActiveView(view)} onClientClick={handleOpenModal} />;
            case 'clients':
                return <MyClientsView myClients={myClients} handleOpenModal={handleOpenModal} />;
            case 'schedule':
                return <TrainerSchedule />;
            case 'tasks':
                return <TaskBoard />;
            case 'messages':
                return <MessagingView />;
            case 'profile':
                return <TrainerProfileView user={currentUser} onEdit={() => setIsEditModalOpen(true)} />;
            case 'routine-templates':
                return <TrainerRoutineTemplates />;
            case 'notifications':
                return <NotificationsView />;
            case 'settings':
                return <SettingsView />;
            default:
                 return <TrainerOverview onNavigate={(view) => setActiveView(view)} onClientClick={handleOpenModal} />;
        }
    };
    
    const viewTitles: Record<View, string> = {
        dashboard: t('trainer.sidebar.dashboard'),
        clients: t('trainer.sidebar.clients'),
        schedule: t('trainer.sidebar.schedule'),
        tasks: 'Mis Tareas',
        messages: t('trainer.sidebar.messages'),
        profile: t('trainer.sidebar.profile'),
        'routine-templates': t('trainer.sidebar.templates'),
        notifications: t('trainer.sidebar.notifications'),
        settings: t('trainer.sidebar.settings')
    }

    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
                <TrainerSidebar 
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
                    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-black/10 dark:border-white/10">
                        <div className="container mx-auto flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden" aria-label="Toggle sidebar">
                                    <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>
                                <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">{viewTitles[activeView]}</h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => setActiveView('messages')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Mensajes">
                                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>
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
                    <main className="container mx-auto p-4 md:p-8 flex-1 flex justify-center items-start">
                        <div key={activeView} className="w-full animate-fade-in">
                            {renderContent()}
                        </div>
                    </main>
                    <Footer />
                    {isModalOpen && selectedClient && currentUser && <ManageClientModal client={selectedClient} trainer={currentUser} onSave={handleSaveChanges} onClose={handleCloseModal} />}
                    {isEditModalOpen && currentUser && <TrainerEditProfileModal user={currentUser} onSave={handleProfileSave} onClose={() => setIsEditModalOpen(false)} />}
                </div>
            </div>
        </>
    );
};

const TrainerEditProfileModal: React.FC<{user: User, onSave: (user: User) => void, onClose: () => void}> = ({ user, onSave, onClose }) => {
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
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.gender')}</label>
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
                            <label htmlFor="age" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.age')}</label>
                            <input type="text" name="age" id="age" value={currentAge !== undefined ? currentAge : ''} readOnly className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                        </div>
                    </div>

                     <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 pt-4 text-gray-800 dark:text-gray-200">{t('admin.editProfileModal.skills')}</h3>
                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.userDetailsModal.skills')}</label>
                        <textarea name="skills" id="skills" value={formData.skills || ''} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="p. ej., Yoga, CrossFit, Nutrición"></textarea>
                        <p className="text-xs text-gray-500 mt-1">{t('admin.editProfileModal.commaSeparated')}</p>
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

const ManageClientModal: React.FC<{client: User; trainer: User; onSave: (client: User) => void; onClose: () => void}> = ({ client, trainer, onSave, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('routine');
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('trainer.clients.manageTitle', {name: client.name})}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.userDetailsModal.fitnessLevel')}: <span className="font-semibold text-primary">{client.fitnessLevel ? t(`fitnessLevels.${client.fitnessLevel}`) : t('admin.userDetailsModal.notApplicable')}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <XCircleIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 overflow-x-auto">
                    <nav className="-mb-px flex space-x-6">
                        <button type="button" onClick={() => setActiveTab('routine')} className={`capitalize py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'routine' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>{t('trainer.modal.routine')}</button>
                        <button type="button" onClick={() => setActiveTab('history')} className={`capitalize py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>{t('trainer.history.title')}</button>
                    </nav>
                </div>
                
                {activeTab === 'routine' && <RoutineEditor client={client} trainer={trainer} onSave={onSave} onClose={onClose} />}
                {activeTab === 'history' && <WorkoutHistoryView client={client} onSave={onSave} />}
            </div>
        </div>
    )
}

const WorkoutHistoryView: React.FC<{client: User; onSave: (client: User) => void;}> = ({ client, onSave }) => {
    const { t } = useTranslation();
    const sortedHistory = useMemo(() => {
        return [...(client.workoutHistory || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [client.workoutHistory]);

    const handleNoteChange = (sessionId: string, newNote: string) => {
        const updatedHistory = (client.workoutHistory || []).map(session => 
            session.id === sessionId ? { ...session, trainerNotes: newNote } : session
        );
        onSave({ ...client, workoutHistory: updatedHistory });
    };

    return (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {sortedHistory.length > 0 ? sortedHistory.map(session => (
                <div key={session.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{t(`days.${session.day}`)} - {new Date(session.date).toLocaleDateString()}</h4>
                    <div className="mt-2 space-y-2">
                        {session.loggedExercises.map((ex, i) => (
                            <div key={i} className="text-sm">
                                <p className="font-semibold text-gray-700 dark:text-gray-300">{ex.name}</p>
                                <div className="pl-4 text-xs text-gray-600 dark:text-gray-400">
                                    {ex.completedSets.map((set, j) => (
                                        <span key={j} className="mr-2">{set.weight}kg x {set.reps} reps</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('trainer.history.notes')}</label>
                        <textarea 
                            value={session.trainerNotes || ''}
                            onChange={(e) => handleNoteChange(session.id, e.target.value)}
                            rows={2}
                            placeholder={t('trainer.history.addNote')}
                            className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white p-2 text-sm"
                        />
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400">{t('trainer.history.noHistory')}</p>}
        </div>
    );
};


const RoutineEditor: React.FC<{client: User; trainer: User; onSave: (client: User) => void; onClose: () => void}> = ({ client, trainer, onSave, onClose }) => {
    const { t, i18n } = useTranslation();
    const { preEstablishedRoutines } = useContext(AuthContext);
    const [routine, setRoutine] = useState<DailyRoutine[]>(
        JSON.parse(JSON.stringify(client.assignedRoutines?.find(ar => ar.trainerId === trainer.id)?.routine || []))
    );
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [activeDay, setActiveDay] = useState<DailyRoutine['day']>('Monday');
    
    const weekDays: DailyRoutine['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const { globalTemplates, personalTemplates } = useMemo(() => {
        const global = preEstablishedRoutines.filter(r => !r.trainerId);
        const personal = preEstablishedRoutines.filter(r => r.trainerId === trainer.id);
        return { globalTemplates: global, personalTemplates: personal };
    }, [preEstablishedRoutines, trainer.id]);

    const handleApplyTemplate = (templateId: string) => {
        if (!templateId) return;
        const template = preEstablishedRoutines.find(t => t.id === templateId);
        if (template) {
            if (window.confirm(t('trainer.routine.confirmApply', {name: template.name}))) {
                setRoutine(JSON.parse(JSON.stringify(template.routines))); // Deep copy to prevent mutation
            }
        }
    };

    const handleSuggestRoutine = async () => {
        setIsSuggesting(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = i18n.language.startsWith('es') 
                ? `Eres un experto entrenador personal. Crea una rutina de entrenamiento semanal personalizada de 7 días para el siguiente cliente.

                Detalles del Cliente:
                - Nombre: ${client.name}
                - Edad: ${client.age || 'No proporcionada'}
                - Género: ${client.gender || 'No proporcionado'}
                - Nivel Físico: ${client.fitnessLevel || 'No especificado'}
                - Altura: ${client.height ? `${client.height} cm` : 'No proporcionada'}
                - Peso: ${client.weight ? `${client.weight} kg` : 'No proporcionado'}
                - Metas de Fitness: ${client.fitnessGoals || 'Sin metas específicas listadas.'}
                - Condiciones Médicas/Lesiones: ${client.medicalConditions || 'Ninguna reportada.'}

                Instrucciones:
                - La rutina debe cubrir los 7 días de la semana (Lunes a Domingo).
                - Incluye días de descanso cuando sea apropiado para el nivel físico del cliente. Para los días de descanso, proporciona un array de ejercicios vacío.
                - Para cada ejercicio, especifica el nombre, número de series y un rango de repeticiones (p. ej., "8-12") o duración (p. ej., "30 mins").
                - Adapta los ejercicios a las metas, nivel físico y condiciones médicas del cliente.
                - Devuelve la respuesta como un array JSON válido que siga estrictamente el esquema proporcionado. Asegúrate de que los días estén en orden en Inglés: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`
                
                : `You are an expert personal trainer. Create a personalized 7-day weekly workout routine for the following client.

                Client Details:
                - Name: ${client.name}
                - Age: ${client.age || 'Not provided'}
                - Gender: ${client.gender || 'Not provided'}
                - Fitness Level: ${client.fitnessLevel || 'Not specified'}
                - Height: ${client.height ? `${client.height} cm` : 'Not provided'}
                - Weight: ${client.weight ? `${client.weight} kg` : 'Not provided'}
                - Fitness Goals: ${client.fitnessGoals || 'No specific goals listed.'}
                - Medical Conditions/Injuries: ${client.medicalConditions || 'None reported.'}

                Instructions:
                - The routine must cover all 7 days of the week (Monday to Sunday).
                - Include rest days where appropriate for the client's fitness level. For rest days, provide an empty exercise array.
                - For each exercise, specify the name, number of sets, and a rep range (e.g., "8-12") or duration (e.g., "30 mins").
                - Tailor the exercises to the client's goals, fitness level, and medical conditions.
                - Return the response as a valid JSON array strictly following the provided schema. Ensure days are in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`;

            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.STRING },
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    sets: { type: Type.NUMBER },
                                    reps: { type: Type.STRING },
                                },
                                required: ['name', 'sets', 'reps'],
                            },
                        },
                    },
                    required: ['day', 'exercises'],
                },
            };
            
            // FIX: Using gemini-3-flash-preview as it's better for routine generation and supports responseSchema natively
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const suggestedRoutine = JSON.parse(response.text);
            
            const fullRoutine = weekDays.map(day => {
                const foundDay = suggestedRoutine.find((r: DailyRoutine) => r.day === day);
                return foundDay || { day, exercises: [] };
            });

            setRoutine(fullRoutine);

        } catch (error) {
            console.error("Error generating routine suggestion:", error);
            alert(t('app.aiCoachError'));
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleAddExercise = () => {
        setRoutine(currentRoutine => {
            const newRoutine = [...currentRoutine];
            let dayRoutine = newRoutine.find(r => r.day === activeDay);

            if (dayRoutine) {
                const updatedExercises = [...dayRoutine.exercises, { name: '', sets: 3, reps: '10' }];
                return newRoutine.map(r => r.day === activeDay ? { ...r, exercises: updatedExercises } : r);
            } else {
                return [...newRoutine, { day: activeDay, exercises: [{ name: '', sets: 3, reps: '10' }] }];
            }
        });
    };
    
    const handleRemoveExercise = (exIndex: number) => {
        setRoutine(currentRoutine => {
            const newRoutine = [...currentRoutine];
            let dayRoutine = newRoutine.find(r => r.day === activeDay);
            if (!dayRoutine) return newRoutine;
            const updatedExercises = dayRoutine.exercises.filter((_, index) => index !== exIndex);
            return newRoutine.map(r => r.day === activeDay ? { ...r, exercises: updatedExercises } : r);
        });
    };

    const handleExerciseChange = (exIndex: number, field: keyof Exercise, value: string | number) => {
        setRoutine(currentRoutine => {
            const newRoutine = [...currentRoutine];
            let dayRoutine = newRoutine.find(r => r.day === activeDay);
            if (!dayRoutine) return newRoutine;
            const updatedExercises = [...dayRoutine.exercises];
            updatedExercises[exIndex] = { ...updatedExercises[exIndex], [field]: value };
            return newRoutine.map(r => r.day === activeDay ? { ...r, exercises: updatedExercises } : r);
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedClient = { ...client };
        
        // These properties are deprecated, ensure they are removed
        delete (updatedClient as any).routine;
        delete (updatedClient as any).routineAssignedBy;

        const existingRoutines = updatedClient.assignedRoutines || [];
        const otherRoutines = existingRoutines.filter(ar => ar.trainerId !== trainer.id);
        
        const newAssignedRoutines = [...otherRoutines];
        if (routine.some(day => day.exercises.length > 0)) {
            newAssignedRoutines.push({ trainerId: trainer.id, routine });
        }

        updatedClient.assignedRoutines = newAssignedRoutines;
        onSave(updatedClient);
    };

    const activeDayRoutine = useMemo(() => routine.find(r => r.day === activeDay), [routine, activeDay]);

    return (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
                <label htmlFor="routine-template" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{t('trainer.routine.applyTemplate')}:</label>
                <select
                    id="routine-template"
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    className="w-full sm:w-auto flex-grow bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm p-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                >
                    <option value="">{t('trainer.routine.select')}</option>
                    {personalTemplates.length > 0 && (
                        <optgroup label={t('trainer.routine.myTemplates')}>
                            {personalTemplates.map(template => (
                                <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                        </optgroup>
                    )}
                    {globalTemplates.length > 0 && (
                         <optgroup label={t('trainer.routine.globalTemplates')}>
                            {globalTemplates.map(template => (
                                <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                        </optgroup>
                    )}
                </select>
                 <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{t('trainer.routine.or')}</span>
                <button 
                    type="button" 
                    onClick={handleSuggestRoutine}
                    disabled={isSuggesting}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-white disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                    {isSuggesting ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <SparklesIcon className="h-5 w-5" />
                    )}
                    <span>{isSuggesting ? t('trainer.routine.generating') : t('trainer.routine.suggestAi')}</span>
                </button>
            </div>
           <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-x-auto md:overflow-y-auto flex-shrink-0">
                     <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1">
                        {weekDays.map(day => (
                            <button
                                type="button"
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`w-full text-left p-2 px-3 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeDay === day ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            >
                                {t(`days.${day}`)}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('client.routine.title').replace('Weekly Routine', '')} {t(`days.${activeDay}`)}</h3>
                     <div className="space-y-3">
                        {activeDayRoutine && activeDayRoutine.exercises.length > 0 && (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="flex-grow text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('client.routine.exercise')}</div>
                                <div className="w-28 flex-shrink-0 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('client.routine.sets')}</div>
                                <div className="w-32 flex-shrink-0 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('client.routine.reps')}</div>
                                <div className="w-9 flex-shrink-0"></div> {/* Spacer for delete button */}
                            </div>
                        )}
                        {activeDayRoutine?.exercises.map((ex, exIndex) => (
                            <div key={exIndex} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg sm:p-0 sm:bg-transparent sm:dark:bg-transparent">
                                <div className="flex-grow w-full sm:w-auto">
                                    <label className="text-xs font-semibold text-gray-500 sm:hidden mb-1 block">{t('client.routine.exercise')}</label>
                                    <select 
                                        value={ex.name}
                                        onChange={(e) => handleExerciseChange(exIndex, 'name', e.target.value)}
                                        className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm p-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    >
                                        <option value="" disabled>{t('admin.userManagement.selectPlaceholder')}</option>
                                        {MOCK_EXERCISES.map(exerciseName => (
                                            <option key={exerciseName} value={exerciseName}>{exerciseName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
                                    <div className="flex flex-col sm:block w-24 sm:w-28">
                                        <label className="text-xs font-semibold text-gray-500 sm:hidden mb-1 block">{t('client.routine.sets')}</label>
                                        <NumberInputWithButtons value={ex.sets} onChange={(v) => handleExerciseChange(exIndex, 'sets', v as number)} className="w-full" />
                                    </div>
                                    <div className="flex flex-col sm:block w-28 sm:w-32">
                                        <label className="text-xs font-semibold text-gray-500 sm:hidden mb-1 block">{t('client.routine.reps')}</label>
                                        <NumberInputWithButtons value={ex.reps} onChange={(v) => handleExerciseChange(exIndex, 'reps', v as string)} className="w-full" />
                                    </div>
                                    <div className="sm:w-9 flex justify-end sm:justify-center mt-4 sm:mt-0">
                                        <button type="button" onClick={() => handleRemoveExercise(exIndex)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>

                     {(!activeDayRoutine || activeDayRoutine.exercises.length === 0) && (
                        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <p className="font-semibold text-gray-500 dark:text-gray-400">{t('client.routine.restDay')}</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">{t('trainer.routine.restDayText')}</p>
                        </div>
                     )}

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={handleAddExercise}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-semibold transition-colors text-gray-500 dark:text-gray-400"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>{t('trainer.routine.addExercise')}</span>
                        </button>
                    </div>
                </div>
           </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 sticky bottom-0">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold transition-colors text-gray-800 dark:text-gray-200">{t('general.cancel')}</button>
                <button type="submit" disabled={isSuggesting} className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">{t('general.saveChanges')}</button>
            </div>
        </form>
    );
};

export default TrainerDashboard;
