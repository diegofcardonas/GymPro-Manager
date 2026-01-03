
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
            <div className="relative bg-gradient-to-br from-indigo-700 via-blue-600 to-primary p-8 text-white">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 p-3 bg-white text-primary rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:rotate-12">
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                             if (e.target.files?.[0]) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setFormData(prev => ({ ...prev, avatarUrl: ev.target?.result as string }));
                                reader.readAsDataURL(e.target.files[0]);
                            }
                        }} className="hidden" accept="image/*" />
                    </div>
                    
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h2 className="text-4xl font-black tracking-tighter">{formData.name}</h2>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {t(`enums.Role.${formData.role}`)}
                            </span>
                        </div>
                        <p className="text-blue-100 font-medium opacity-80">{formData.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row h-[600px]">
                <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-black/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            <tab.icon className="w-5 h-5" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-gray-900">
                    {activeTab === 'personal' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.fullName')}</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.mobile')}</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.birthDate')}</label>
                                    <input type="date" name="birthDate" value={formData.birthDate?.split('T')[0]} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('profile.gender')}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold">
                                        <option value="Masculino">{t('enums.Gender.Masculino')}</option>
                                        <option value="Femenino">{t('enums.Gender.Femenino')}</option>
                                        <option value="Otro">{t('enums.Gender.Otro')}</option>
                                        <option value="Prefiero no decirlo">{t('enums.Gender.Prefiero no decirlo')}</option>
                                    </select>
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
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-3xl flex flex-col items-center justify-center border border-emerald-100">
                                    <span className="text-[10px] font-black uppercase text-emerald-600">{t('profile.imc')}</span>
                                    <span className="text-3xl font-black text-emerald-700">{imc || '--'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('enums.FitnessLevel.title')}</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.values(FitnessLevel).map(level => (
                                        <button key={level} onClick={() => setFormData({...formData, fitnessLevel: level})} className={`p-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${formData.fitnessLevel === level ? 'border-primary bg-primary/5 text-primary' : 'border-black/5 text-gray-400'}`}>
                                            {t(`enums.FitnessLevel.${level}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" /> {t('general.success')}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 sm:px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="w-6 h-6" />}
                        {isSaving ? t('profile.saving') : t('general.saveChanges')}
                    </button>
                    {onCancel && (
                        <button onClick={onCancel} className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-2xl font-black border border-black/5">
                            {t('general.cancel').toUpperCase()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
