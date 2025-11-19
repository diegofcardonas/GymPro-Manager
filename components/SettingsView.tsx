
import React, { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Visibility } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import { themes } from '../themes';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// Reusable toggle component
const SettingToggle: React.FC<{ id: string, label: string, description: string, enabled: boolean, onToggle: () => void }> = ({ id, label, description, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
        <div className="pr-4">
            <label htmlFor={id} className="font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">{description}</p>
        </div>
        <button
            id={id}
            onClick={onToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className="sr-only">{label}</span>
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

const SettingSection: React.FC<{ title: string; children: React.ReactNode; danger?: boolean }> = ({ title, children, danger }) => (
    <div className={`bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden ${danger ? 'ring-2 ring-red-500/50' : ''}`}>
        <h3 className={`text-xl font-semibold p-6 border-b ${danger ? 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : 'text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}>{title}</h3>
        <div className="p-6">
            {children}
        </div>
    </div>
);


const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, updateCurrentUser, logout, users, toggleBlockUser, deleteUser } = useContext(AuthContext)!;
    const { theme, setThemeByName, isDarkMode, toggleDarkMode } = useContext(ThemeContext)!;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!currentUser) {
            setMessage({ type: 'error', text: 'Debes iniciar sesión.' });
            return;
        }

        if (currentUser.password !== currentPassword) {
            setMessage({ type: 'error', text: 'La contraseña actual es incorrecta.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
            return;
        }

        if (newPassword.length < 8) {
             setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
            return;
        }

        const updatedUser: User = { ...currentUser, password: newPassword };
        updateCurrentUser(updatedUser);

        setMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };
    
    const handleNotificationToggle = useCallback((key: string) => {
        if (!currentUser) return;

        const currentPrefs = currentUser.notificationPreferences || { newMessages: true, routineUpdates: true, classReminders: true };
        const updatedUser: User = {
            ...currentUser,
            notificationPreferences: {
                ...currentPrefs,
                [key]: !currentPrefs[key as keyof typeof currentPrefs],
            },
        };
        updateCurrentUser(updatedUser);
    }, [currentUser, updateCurrentUser]);

    const handlePrivacyChange = useCallback((key: string, value: string | boolean) => {
        if (!currentUser) return;
        const currentSettings = currentUser.privacySettings || { profileVisibility: 'everyone', activityVisibility: 'connections', showInSearch: true };
        const updatedUser = {
            ...currentUser,
            privacySettings: {
                ...currentSettings,
                [key]: value,
            },
        };
        updateCurrentUser(updatedUser);
    }, [currentUser, updateCurrentUser]);


    const handleDeactivate = () => {
        if (!currentUser) return;
        if (window.confirm(t('components.settingsView.confirmDeactivation'))) {
            // Delete the user from the system
            deleteUser(currentUser.id);
            // Logout to clear session and return to login screen
            logout();
        }
    };

    const blockedUsers = React.useMemo(() => {
        if (!currentUser?.blockedUserIds) return [];
        return users.filter(u => currentUser.blockedUserIds!.includes(u.id));
    }, [currentUser, users]);


    return (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-6 md:p-8 space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('components.settingsView.title')}</h2>
            
            <SettingSection title={t('components.settingsView.appearance')}>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="pr-4">
                        <label className="font-medium text-gray-700 dark:text-gray-300">
                            {t('components.languageSwitcher.language')}
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                            {t('components.settingsView.languageDesc')}
                        </p>
                    </div>
                    <LanguageSwitcher />
                </div>

                <div className="flex items-center justify-between my-6">
                    <label htmlFor="darkModeToggle" className="font-medium text-gray-700 dark:text-gray-300">
                        {t('components.settingsView.darkMode')}
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">{t('components.settingsView.darkModeDesc')}</p>
                    </label>
                    <button
                        id="darkModeToggle"
                        onClick={toggleDarkMode}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary ${isDarkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className="sr-only">{t('components.settingsView.darkMode')}</span>
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
                 <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{t('components.settingsView.theme')}</h4>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {themes.map((t) => (
                            <button
                                key={t.name}
                                onClick={() => setThemeByName(t.name)}
                                className={`p-2 rounded-lg border-2 flex flex-col items-center space-y-2 transition-all ${
                                    theme.name === t.name ? 'border-primary' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="w-full h-10 rounded" style={{ backgroundColor: `hsl(${isDarkMode ? t.dark.primary : t.light.primary})` }}></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.displayName}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </SettingSection>

            <SettingSection title={t('components.settingsView.accountSecurity')}>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                            {message.text}
                        </div>
                    )}
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium">{t('components.settingsView.currentPassword')}</label>
                        <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full input-style" required />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium">{t('components.settingsView.newPassword')}</label>
                        <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full input-style" required />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium">{t('components.settingsView.confirmNewPassword')}</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full input-style" required />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">
                            {t('components.settingsView.changePassword')}
                        </button>
                    </div>
                </form>
            </SettingSection>

             <SettingSection title={t('components.settingsView.privacyNotifications')}>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('components.settingsView.privacySettings')}</h4>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">{t('components.settingsView.profileVisibility')}</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">{t('components.settingsView.profileVisibilityDesc')}</p>
                    </div>
                    <select 
                        value={currentUser?.privacySettings?.profileVisibility || 'everyone'}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value as Visibility)}
                        className="input-style"
                    >
                        <option value="everyone">{t('components.settingsView.privacyOptions.everyone')}</option>
                        <option value="connections">{t('components.settingsView.privacyOptions.connections')}</option>
                        <option value="me">{t('components.settingsView.privacyOptions.me')}</option>
                    </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">{t('components.settingsView.activityVisibility')}</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">{t('components.settingsView.activityVisibilityDesc')}</p>
                    </div>
                    <select 
                        value={currentUser?.privacySettings?.activityVisibility || 'connections'}
                        onChange={(e) => handlePrivacyChange('activityVisibility', e.target.value as Visibility)}
                        className="input-style"
                    >
                        <option value="everyone">{t('components.settingsView.privacyOptions.everyone')}</option>
                        <option value="connections">{t('components.settingsView.privacyOptions.connections')}</option>
                        <option value="me">{t('components.settingsView.privacyOptions.me')}</option>
                    </select>
                </div>
                <SettingToggle
                    id="showInSearch"
                    label={t('components.settingsView.showInSearch')}
                    description={t('components.settingsView.showInSearchDesc')}
                    enabled={currentUser?.privacySettings?.showInSearch ?? true}
                    onToggle={() => handlePrivacyChange('showInSearch', !(currentUser?.privacySettings?.showInSearch ?? true))}
                />

                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 border-t border-gray-200 dark:border-gray-600 pt-6">{t('components.settingsView.notificationPreferences')}</h4>
                 <SettingToggle
                    id="newMessages"
                    label={t('components.settingsView.newMessages')}
                    description={t('components.settingsView.newMessagesDesc')}
                    enabled={currentUser?.notificationPreferences?.newMessages ?? true}
                    onToggle={() => handleNotificationToggle('newMessages')}
                />
                <SettingToggle
                    id="routineUpdates"
                    label={t('components.settingsView.routineUpdates')}
                    description={t('components.settingsView.routineUpdatesDesc')}
                    enabled={currentUser?.notificationPreferences?.routineUpdates ?? true}
                    onToggle={() => handleNotificationToggle('routineUpdates')}
                />

                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 border-t border-gray-200 dark:border-gray-600 pt-6">{t('components.settingsView.blockedUsers')}</h4>
                {blockedUsers.length > 0 ? (
                    <div className="space-y-2">
                        {blockedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-md">
                                <div className="flex items-center gap-2">
                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                    <span>{user.name}</span>
                                </div>
                                <button 
                                    onClick={() => toggleBlockUser(user.id)}
                                    className="px-3 py-1 text-xs font-semibold bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-50"
                                >
                                    {t('components.settingsView.unblock')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('components.settingsView.noBlockedUsers')}</p>
                )}
            </SettingSection>

            <SettingSection title={t('components.settingsView.dangerZone')} danger>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">{t('components.settingsView.deactivateAccount')}</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">{t('components.settingsView.deactivateAccountDesc')}</p>
                    </div>
                    <button type="button" onClick={handleDeactivate} className="btn btn-danger">
                        {t('components.settingsView.deactivate')}
                    </button>
                </div>
            </SettingSection>
{/* FIX: Removed non-standard "jsx" prop from style tag. */}
            <style>{`
                .input-style {
                    background-color: #ffffff;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    color: #111827;
                    padding: 0.5rem 0.75rem;
                }
                .dark .input-style {
                    background-color: #4b5563;
                    border-color: #6b7280;
                    color: #f9fafb;
                }
                .input-style:focus {
                    --tw-ring-color: hsl(var(--primary));
                    border-color: hsl(var(--primary));
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.5);
                }
                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                    border: none;
                }
                .btn-primary {
                    background-color: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }
                .btn-primary:hover {
                    background-color: hsl(var(--primary) / 0.9);
                }
                .btn-danger {
                    background-color: #dc2626; /* red-600 */
                    color: white;
                }
                .btn-danger:hover {
                    background-color: #b91c1c; /* red-700 */
                }
            `}</style>
        </div>
    );
};

export default SettingsView;
