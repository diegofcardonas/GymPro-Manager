
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeIcon } from '../icons/HomeIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { CogIcon } from '../icons/CogIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { LogoIcon } from '../icons/LogoIcon';
import { IdentificationIcon } from '../icons/IdentificationIcon';
import { BellIcon } from '../icons/BellIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { AppleIcon } from '../icons/AppleIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

type View = 'dashboard' | 'routine' | 'workout-log' | 'progress' | 'classes' | 'messages' | 'membership-card' | 'profile' | 'notifications' | 'settings' | 'ai-coach' | 'challenges' | 'achievements' | 'nutrition-log' | 'social';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const ClientSidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose, isCollapsed, toggleCollapse }) => {
    const { t } = useTranslation();

    const navGroups = useMemo(() => [
        {
            title: t('sidebar.home'),
            items: [
                { id: 'dashboard', label: t('client.sidebar.dashboard'), icon: HomeIcon },
                { id: 'social', label: t('client.sidebar.social'), icon: TrophyIcon },
                { id: 'ai-coach', label: t('client.sidebar.ai-coach'), icon: SparklesAiIcon },
            ]
        },
        {
            title: t('sidebar.training'),
            items: [
                { id: 'routine', label: t('client.sidebar.routine'), icon: ClipboardListIcon },
                { id: 'workout-log', label: t('client.sidebar.workout-log'), icon: PencilIcon },
                { id: 'nutrition-log', label: t('client.sidebar.nutrition-log'), icon: AppleIcon },
                { id: 'progress', label: t('client.sidebar.progress'), icon: ChartBarIcon },
            ]
        },
        {
            title: t('sidebar.community'),
            items: [
                { id: 'classes', label: t('client.sidebar.classes'), icon: CalendarDaysIcon },
                { id: 'challenges', label: t('client.sidebar.challenges'), icon: TrophyIcon },
                { id: 'messages', label: t('client.sidebar.messages'), icon: ChatBubbleLeftRightIcon },
            ]
        },
        {
            title: t('sidebar.account'),
            items: [
                { id: 'membership-card', label: t('client.sidebar.membership-card'), icon: IdentificationIcon },
                { id: 'profile', label: t('client.sidebar.profile'), icon: UserCircleIcon },
                { id: 'settings', label: t('client.sidebar.settings'), icon: CogIcon },
            ]
        }
    ], [t]);

    return (
        <div className={`fixed h-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-black/[0.03] dark:border-white/[0.03] flex flex-col transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className={`flex items-center h-16 px-6 border-b border-transparent ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                 {!isCollapsed ? (
                     <div className="flex items-center gap-3 overflow-hidden">
                        <LogoIcon className="w-8 h-8 flex-shrink-0 text-primary" />
                        <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white whitespace-nowrap">
                            GymPro
                        </span>
                    </div>
                 ) : (
                     <LogoIcon className="w-10 h-10 text-primary" />
                 )}
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar">
                {navGroups.map((group, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                {group.title}
                            </h3>
                        )}
                        <ul className="space-y-1">
                            {group.items.map(item => (
                                <li key={item.id}>
                                    <button 
                                        onClick={() => {
                                            setActiveView(item.id as View);
                                            if (window.innerWidth < 768) onClose();
                                        }}
                                        className={`w-full flex items-center p-3 rounded-2xl transition-all group relative
                                            ${activeView === item.id 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        {!isCollapsed && <span className="ml-3 font-bold text-sm truncate">{item.label}</span>}
                                        
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                                                {item.label}
                                            </div>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-black/[0.03] dark:border-white/[0.03]">
                <button 
                    onClick={toggleCollapse}
                    className="w-full flex items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-primary transition-all hover:bg-white dark:hover:bg-gray-800"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

export default ClientSidebar;
