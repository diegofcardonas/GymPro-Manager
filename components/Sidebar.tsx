
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CogIcon } from './icons/CogIcon';
import { DocumentChartBarIcon } from './icons/DocumentChartBarIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { LogoIcon } from './icons/LogoIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { BellIcon } from './icons/BellIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { AuthContext } from '../context/AuthContext';

type View = 'dashboard' | 'users' | 'reports' | 'membership-tiers' | 'routine-templates' | 'app-settings' | 'notifications' | 'settings' | 'payments' | 'class-schedule' | 'announcements' | 'challenges' | 'equipment' | 'tasks';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose, isCollapsed, toggleCollapse }) => {
    const { t } = useTranslation();
    const { toggleReportModal } = useContext(AuthContext);
    
    const navGroups = useMemo(() => [
        {
            title: t('sidebar.overview'),
            items: [
                { id: 'dashboard', label: t('nav.dashboard'), icon: ChartBarIcon },
                { id: 'reports', label: t('nav.reports'), icon: DocumentChartBarIcon },
            ]
        },
        {
            title: t('sidebar.management'),
            items: [
                { id: 'users', label: t('sidebar.users'), icon: UserGroupIcon },
                { id: 'payments', label: t('nav.payments'), icon: CurrencyDollarIcon },
                { id: 'tasks', label: t('nav.tasks'), icon: ClipboardDocumentCheckIcon },
                { id: 'membership-tiers', label: t('nav.tiers'), icon: CreditCardIcon },
            ]
        },
        {
            title: t('sidebar.gymOperations'),
            items: [
                { id: 'class-schedule', label: t('nav.classes'), icon: CalendarDaysIcon },
                { id: 'routine-templates', label: t('nav.templates'), icon: ClipboardDocumentListIcon },
                { id: 'equipment', label: t('nav.equipment'), icon: WrenchIcon },
            ]
        },
        {
            title: t('sidebar.community'),
            items: [
                { id: 'announcements', label: t('nav.announcements'), icon: MegaphoneIcon },
                { id: 'challenges', label: t('nav.challenges'), icon: TrophyIcon },
            ]
        },
        {
            title: t('sidebar.system'),
            items: [
                { id: 'notifications', label: t('nav.notifications'), icon: BellIcon },
                { id: 'app-settings', label: t('nav.appSettings'), icon: WrenchScrewdriverIcon },
                { id: 'settings', label: t('nav.mySettings'), icon: CogIcon },
            ]
        }
    ], [t]);

    return (
        <div className={`fixed h-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-black/10 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className={`flex items-center h-16 px-4 border-b border-transparent ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                 {!isCollapsed ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <LogoIcon className="w-8 h-8 flex-shrink-0" />
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 whitespace-nowrap">
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
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
                                            ${isCollapsed ? 'justify-center' : 'space-x-3'}
                                        `}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        <item.icon className={`w-6 h-6 flex-shrink-0 ${activeView === item.id ? 'text-primary' : ''}`} />
                                        {!isCollapsed && <span className="truncate font-medium text-sm">{item.label}</span>}
                                        
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
            
            <div className="p-4 border-t border-black/5 dark:border-white/5">
                 <button 
                    onClick={toggleReportModal}
                    className={`w-full flex items-center p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors group relative
                        ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    `}
                    title={isCollapsed ? t('app.reportProblem') : ''}
                >
                    <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate font-medium text-sm">{t('app.reportProblem')}</span>}
                </button>
            </div>
            
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
}

export default Sidebar;
