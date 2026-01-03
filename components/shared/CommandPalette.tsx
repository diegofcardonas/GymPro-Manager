
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { CogIcon } from '../icons/CogIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { LogoIcon } from '../icons/LogoIcon';

const SearchIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

export const CommandPalette: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { logout, users } = useContext(AuthContext);
    const { toggleDarkMode } = useContext(ThemeContext)!;
    
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const actions = [
        { 
            id: 'theme', 
            name: t('nav.appSettings'), 
            icon: <div className="w-4 h-4 rounded-full bg-gray-800 dark:bg-gray-200"/>, 
            action: () => { toggleDarkMode(); setIsOpen(false); } 
        },
        { 
            id: 'lang_en', 
            name: 'English Language', 
            icon: <span className="text-xs">🇺🇸</span>, 
            action: () => { i18n.changeLanguage('en'); setIsOpen(false); } 
        },
        { 
            id: 'lang_es', 
            name: 'Idioma Español', 
            icon: <span className="text-xs">🇪🇸</span>, 
            action: () => { i18n.changeLanguage('es'); setIsOpen(false); } 
        },
        { 
            id: 'logout', 
            name: t('nav.logout'), 
            icon: <LogoutIcon className="w-4 h-4"/>, 
            action: () => { logout(); setIsOpen(false); } 
        },
    ];

    const filteredItems = query === '' ? actions : [
        ...actions.filter(action => action.name.toLowerCase().includes(query.toLowerCase())),
        ...users.filter(user => user.name.toLowerCase().includes(query.toLowerCase())).map(user => ({
            id: user.id,
            name: user.name,
            icon: <img src={user.avatarUrl} className="w-4 h-4 rounded-full" alt="" />,
            action: () => { 
                alert(`User selected: ${user.name}`); 
                setIsOpen(false); 
            }
        }))
    ].slice(0, 8);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
            
            <div className="relative w-full max-w-2xl transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 transition-all overflow-hidden animate-scale-in">
                <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700">
                    <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-0 sm:text-sm"
                        placeholder={t('general.search')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="max-h-96 overflow-y-auto py-2">
                    {filteredItems.length > 0 ? (
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={item.action}
                                    className="group flex w-full items-center gap-3 px-4 py-3 hover:bg-primary hover:text-white transition-colors"
                                >
                                    <div className="flex h-5 w-5 flex-none items-center justify-center rounded-md text-gray-500 dark:text-gray-400 group-hover:text-white">
                                        {item.icon}
                                    </div>
                                    <span className="flex-auto truncate text-left font-medium">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-sm text-gray-500 text-center">{t('general.noData')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
