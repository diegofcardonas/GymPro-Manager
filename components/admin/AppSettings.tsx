
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AppSettings: React.FC = () => {
    const { t } = useTranslation();
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const handleSave = (section: string) => {
        alert(t('admin.appSettings.successMessage', { section }));
    };

    return (
        <div className="w-full max-w-4xl space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.appSettings.title')}</h2>
            
            <SettingSection title={t('admin.appSettings.notifications')}>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(t('admin.appSettings.notifications')); }}>
                    <div>
                        <label className="block text-sm font-medium">{t('admin.appSettings.emailTemplate')}</label>
                        <textarea rows={4} className="mt-1 block w-full input-style" defaultValue={t('admin.appSettings.emailTemplateDefault')}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('admin.appSettings.expiryReminder')}</label>
                         <textarea rows={4} className="mt-1 block w-full input-style" defaultValue={t('admin.appSettings.expiryReminderDefault')}></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">{t('admin.appSettings.saveTemplates')}</button>
                    </div>
                </form>
            </SettingSection>

            <SettingSection title={t('admin.appSettings.system')}>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{t('admin.appSettings.maintenanceMode')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appSettings.maintenanceModeDesc')}</p>
                    </div>
                    <button
                        onClick={() => {
                            setMaintenanceMode(prev => !prev);
                            handleSave(t('admin.appSettings.maintenanceMode'));
                        }}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary ${maintenanceMode ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </SettingSection>

             {/* FIX: Removed non-standard "jsx" prop from style tag. */}
             <style>{`
                .input-style {
                    background-color: #f3f4f6; /* bg-gray-100 */
                    border: 1px solid #d1d5db; /* border-gray-300 */
                    border-radius: 0.375rem; /* rounded-md */
                    color: #111827; /* text-gray-900 */
                    padding: 0.5rem;
                }
                .dark .input-style {
                    background-color: #4b5563; /* dark:bg-gray-700 */
                    border-color: #6b7280; /* dark:border-gray-500 */
                    color: #f9fafb; /* dark:text-white */
                }
                .input-style:focus {
                    --tw-ring-color: hsl(var(--primary));
                    border-color: hsl(var(--primary));
                }
                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .btn-primary {
                    background-color: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }
                .btn-primary:hover {
                    background-color: hsl(var(--primary) / 0.9);
                }
            `}</style>
        </div>
    );
};

const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 p-6 border-b border-gray-200 dark:border-gray-700">{title}</h3>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default AppSettings;
