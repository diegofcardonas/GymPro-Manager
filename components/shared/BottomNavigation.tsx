
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HomeIcon } from '../icons/HomeIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';

interface BottomNavigationProps {
    activeView: string;
    onNavigate: (view: any) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeView, onNavigate }) => {
    const { t } = useTranslation();

    const navItems = [
        { id: 'dashboard', label: t('sidebar.home'), icon: HomeIcon },
        { id: 'routine', label: t('client.sidebar.routine'), icon: ClipboardListIcon },
        { id: 'classes', label: t('client.sidebar.classes'), icon: CalendarDaysIcon },
        { id: 'profile', label: t('client.sidebar.profile'), icon: UserCircleIcon },
    ];

    return (
        <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-black/[0.03] dark:border-white/[0.03] md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
                {navItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onNavigate(item.id)}
                            className={`inline-flex flex-col items-center justify-center px-5 transition-all duration-300 relative group
                                ${isActive ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
