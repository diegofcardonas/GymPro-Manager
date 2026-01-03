
import React, { useState, useContext, useMemo, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Role, FitnessLevel } from '../../types';
import { useTranslation } from 'react-i18next';
import { PencilIcon } from '../icons/PencilIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { NumberInputWithButtons } from './NumberInputWithButtons';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { CogIcon } from '../icons/CogIcon';
import { FireIcon } from '../icons/FireIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { IdentificationIcon } from '../icons/IdentificationIcon';

type TabId = 'personal' | 'fitness' | 'professional' | 'emergency' | 'social';

const ProfileEditor: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
    const { t } = useTranslation();
    const { currentUser, updateUser, addToast } = useContext(AuthContext);
    
    const [formData, setFormData] = useState<User>(() => {
        const base = JSON.parse(JSON.stringify(currentUser || {}));
        if (!base.personalBests) base.personalBests = {};
        if (!base.emergencyContact) base.emergencyContact = {};
        if (!base.socialLinks) base.socialLinks = {};
        return base;
    });
    
    const [activeTab, setActiveTab] = useState<TabId>('personal');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentUser) return null;

    const tabs = useMemo(() => {
        const baseTabs: { id: TabId; label: string; icon: any }[] = [
            { id: 'personal', label: t('profile.personal'), icon: UserCircleIcon },
            { id: 'emergency', label: t('profile.emergency'), icon: IdentificationIcon }
        ];
        if (currentUser.role === Role.CLIENT) {
            baseTabs.splice(1, 0, { id: 'fitness', label: t('profile.fitness'), icon: FireIcon });
        }
        if ([Role.TRAINER, Role.NUTRITIONIST, Role.PHYSIOTHERAPIST].includes(currentUser.role)) {
            baseTabs.splice(1, 0, { id: 'professional', label: t('profile.career'), icon: TrophyIcon });
        }
        return baseTabs;
    }, [currentUser.role, t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                const newData = { ...prev };
                let target: any = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                    target = target[keys[i]];
                }
                target[keys[keys.length - 1]] = value;
                return newData;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setTimeout(() => {
            updateUser(formData);
            addToast(t('profile.success'), 'success');
            setIsSaving(false);
            if (onCancel) onCancel();
        }, 1200);
    };

    const imc = useMemo(() => {
        if (!formData.height || !formData.weight) return null;
        const h = formData.height / 100;
        return (formData.weight / (h * h)).toFixed(1);
    }, [formData.height, formData.weight]);

    return (
        <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-4xl shadow-2xl border border-black/5 overflow-hidden animate-fade-in">
            <div className="relative bg-gradient-to-br from-indigo-700 via-blue-600 to-primary p-6 md:p-10 text-white">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 bg-white text-primary rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:rotate-12">
                            <CameraIcon className="w-4 h-4" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                             if (e.target.files?.[0]) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setFormData(prev => ({ ...prev, avatarUrl: ev.target?.result as string }));
                                reader.readAsDataURL(e.target.files[0]);
                            }
                        }} className="hidden" accept="image/*" />
                    </div>
                    
                    <div className="text-center md:text-left space-y-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">{formData.name}</h2>
                            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                                {t(`enums.Role.${formData.role}`)}
                            </span>
                        </div>
                        <p className="text-blue-100 font-medium opacity-80 text-sm">{formData.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row h-auto md:h-[550px]">
                <div className="w-full md:w-56 bg-gray-50 dark:bg-gray-900/50 border-r border-black/5 p-3 flex flex-row md:flex-col gap-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white dark:bg-gray-900">
                    {activeTab === 'personal' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.fullName')}</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.mobile')}</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.birthDate')}</label>
                                    <input type="date" name="birthDate" value={formData.birthDate?.split('T')[0]} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-sm" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fitness' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 text-center block">{t('profile.height')} ({t('general.cm')})</label>
                                    <NumberInputWithButtons value={formData.height || 0} onChange={(v) => setFormData({...formData, height: v as number})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 text-center block">{t('profile.weight')} ({t('general.kg')})</label>
                                    <NumberInputWithButtons value={formData.weight || 0} onChange={(v) => setFormData({...formData, weight: v as number})} step={0.5} />
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl flex flex-col items-center justify-center border border-emerald-100">
                                    <span className="text-[9px] font-black uppercase text-emerald-600">IMC ESTIMADO</span>
                                    <span className="text-2xl font-black text-emerald-700">{imc || '--'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-900 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" /> {t('general.success')}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 sm:px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
                        <span className="text-xs uppercase tracking-widest">{isSaving ? t('profile.saving') : t('general.saveChanges')}</span>
                    </button>
                    {onCancel && (
                        <button onClick={onCancel} className="px-6 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-2xl font-black border border-black/5 text-xs uppercase tracking-widest">
                            {t('general.cancel')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
