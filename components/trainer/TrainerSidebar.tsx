
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { CogIcon } from '../icons/CogIcon';
import { LogoIcon } from '../icons/LogoIcon';
import { BellIcon } from '../icons/BellIcon';
import { ClipboardDocumentListIcon } from '../icons/ClipboardDocumentListIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { ClipboardDocumentCheckIcon } from '../icons/ClipboardDocumentCheckIcon';

type View = 'dashboard' | 'clients' | 'schedule' | 'messages' | 'profile' | 'routine-templates' | 'notifications' | 'settings' | 'tasks';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const TrainerSidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose, isCollapsed, toggleCollapse }) => {
    const { t } = useTranslation();

    const navGroups = useMemo(() => [
        {
            title: t('sidebar.summary'),
            items: [
                { id: 'dashboard', label: t('trainer.sidebar.dashboard'), icon: ChartBarIcon },
                { id: 'tasks', label: t('trainer.sidebar.tasks'), icon: ClipboardDocumentCheckIcon },
            ]
        },
        {
            title: t('sidebar.management'),
            items: [
                { id: 'clients', label: t('trainer.sidebar.clients'), icon: UserGroupIcon },
                { id: 'schedule', label: t('trainer.sidebar.schedule'), icon: CalendarDaysIcon },
                { id: 'routine-templates', label: t('trainer.sidebar.templates'), icon: ClipboardDocumentListIcon },
            ]
        },
        {
            title: t('sidebar.communication'),
            items: [
                { id: 'messages', label: t('trainer.sidebar.messages'), icon: ChatBubbleLeftRightIcon },
            ]
        },
        {
            title: t('sidebar.account'),
            items: [
                { id: 'profile', label: t('trainer.sidebar.profile'), icon: UserCircleIcon },
                { id: 'notifications', label: t('trainer.sidebar.notifications'), icon: BellIcon },
                { id: 'settings', label: t('trainer.sidebar.settings'), icon: CogIcon },
            ]
        }
    ], [t]);

    return (
        <div className={`fixed h-full z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-black/10 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className={`flex items-center h-16 px-4 border-b border-transparent ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                 {!isCollapsed ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <LogoIcon className="w-8 h-8 flex-shrink-0" />
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 whitespace-nowrap">
                            GymPro
                        </span>
                    </div>
                 ) : (
                     <LogoIcon className="w-10 h-10" />
                 )}
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
                {navGroups.map((group, index) => (
                    <div key={index} className="mb-2">
                        {!isCollapsed && (
                            <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {group.title}
                            </h3>
                        )}
                        {isCollapsed && index !== 0 && (
                            <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-800"></div>
                        )}
                        <ul className="space-y-1 px-2">
                            {group.items.map(item => (
                                <li key={item.id}>
                                    <button 
                                        onClick={() => {
                                            setActiveView(item.id as View);
                                            if (window.innerWidth < 768) onClose();
                                        }}
                                        className={`w-full flex items-center p-2 rounded-lg transition-colors group relative
                                            ${activeView === item.id 
                                                ? 'bg-primary/10 text-primary' 
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}
                                            ${isCollapsed ? 'justify-center' : 'space-x-3'}
                                        `}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        <item.icon className={`w-6 h-6 flex-shrink-0 ${activeView === item.id ? 'text-primary' : ''}`} />
                                        {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                                        
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
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

             <div className="hidden md:flex p-4 border-t border-black/5 dark:border-white/5 justify-end">
                <button 
                    onClick={toggleCollapse}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full flex items-center justify-center"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

export default TrainerSidebar;
