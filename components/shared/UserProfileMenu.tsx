
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../../types';
import { CogIcon } from '../icons/CogIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { PencilIcon } from '../icons/PencilIcon';

interface UserProfileMenuProps {
    user: User;
    onEditProfile?: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onEditProfile, onSettings, onLogout }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300">{t('general.welcome', { name: user.name })}</span>
                <img 
                    src={user.avatarUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700" 
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 py-2 z-50 animate-scale-in origin-top-right border border-black/5 dark:border-white/5">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{t(`enums.Role.${user.role}`)}</p>
                    </div>
                    
                    {onEditProfile && (
                        <button
                            onClick={() => { onEditProfile(); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 font-medium"
                        >
                            <PencilIcon className="w-5 h-5 text-gray-400" />
                            {t('nav.profile')}
                        </button>
                    )}

                    <button
                        onClick={() => { onSettings(); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 font-medium"
                    >
                        <CogIcon className="w-5 h-5 text-gray-400" />
                        {t('nav.settings')}
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                    <button
                        onClick={() => { onLogout(); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 font-bold"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        {t('nav.logout')}
                    </button>
                </div>
            )}
        </div>
    );
};
