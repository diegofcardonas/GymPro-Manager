
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
    
    // Deep copy to avoid mutating original state before save
    const [formData, setFormData] = useState<User>(() => {
        const base = JSON.parse(JSON.stringify(currentUser || {}));
        // Ensure objects exist
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
            { id: 'personal', label: 'Personal', icon: UserCircleIcon },
            { id: 'emergency', label: 'Emergencia', icon: IdentificationIcon }
        ];
        if (currentUser.role === Role.CLIENT) {
            baseTabs.splice(1, 0, { id: 'fitness', label: 'Salud & Metas', icon: FireIcon });
        }
        if ([Role.TRAINER, Role.NUTRITIONIST, Role.PHYSIOTHERAPIST].includes(currentUser.role)) {
            baseTabs.splice(1, 0, { id: 'professional', label: 'Carrera', icon: TrophyIcon });
        }
        return baseTabs;
    }, [currentUser.role]);

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

    const calculateAge = (date: string) => {
        if (!date) return 0;
        const birth = new Date(date);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
        return age;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setFormData(prev => ({ ...prev, avatarUrl: ev.target?.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Realistic saving simulation
        setTimeout(() => {
            const finalData = { 
                ...formData, 
                age: calculateAge(formData.birthDate || ''),
                // Ensure numeric fields are correctly typed
                height: Number(formData.height),
                weight: Number(formData.weight)
            };
            updateUser(finalData);
            addToast('Perfil actualizado con éxito', 'success');
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
            {/* Elegant Header */}
            <div className="relative bg-gradient-to-br from-indigo-700 via-blue-600 to-primary p-8 text-white">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-3 bg-white text-primary rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:rotate-12"
                        >
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    </div>
                    
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h2 className="text-4xl font-black tracking-tighter">{formData.name}</h2>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {t(`roles.${formData.role}`)}
                            </span>
                        </div>
                        <p className="text-blue-100 font-medium opacity-80">{formData.email}</p>
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                            <div className="text-center bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold uppercase opacity-60">Desde</p>
                                <p className="font-bold text-sm">{new Date(formData.joinDate).getFullYear()}</p>
                            </div>
                            {formData.role === Role.CLIENT && (
                                <div className="text-center bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-bold uppercase opacity-60">Status</p>
                                    <p className="font-bold text-sm">{formData.membership.status}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row h-[700px]">
                {/* Side Tab Menu */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-black/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
                    {activeTab === 'personal' && (
                        <div className="space-y-10 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Completo</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Teléfono Móvil</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Fecha de Nacimiento</label>
                                    <input type="date" name="birthDate" value={formData.birthDate?.split('T')[0]} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Género</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white">
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                        <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Dirección de Residencia</label>
                                <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Ej: Calle 123 #45-67, Ciudad" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sobre mí / Bio</label>
                                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} placeholder="Escribe algo breve sobre ti..." className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium text-gray-700 dark:text-gray-300" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'fitness' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 text-center block">Altura (cm)</label>
                                    <NumberInputWithButtons value={formData.height || 0} onChange={(v) => setFormData({...formData, height: v as number})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 text-center block">Peso (kg)</label>
                                    <NumberInputWithButtons value={formData.weight || 0} onChange={(v) => setFormData({...formData, weight: v as number})} step={0.5} />
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-3xl flex flex-col items-center justify-center border border-emerald-100 dark:border-emerald-800/30 shadow-inner">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">IMC Estimado</span>
                                    <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{imc || '--'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Récords Personales (PRs)</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 block">Bench Press (kg)</label>
                                        <NumberInputWithButtons value={formData.personalBests?.benchPress || 0} onChange={(v) => setFormData({...formData, personalBests: {...formData.personalBests, benchPress: v as number}})} step={2.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 block">Squat (kg)</label>
                                        <NumberInputWithButtons value={formData.personalBests?.squat || 0} onChange={(v) => setFormData({...formData, personalBests: {...formData.personalBests, squat: v as number}})} step={2.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 block">Deadlift (kg)</label>
                                        <NumberInputWithButtons value={formData.personalBests?.deadlift || 0} onChange={(v) => setFormData({...formData, personalBests: {...formData.personalBests, deadlift: v as number}})} step={2.5} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nivel de Condición</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {Object.values(FitnessLevel).map(level => (
                                            <button 
                                                key={level}
                                                onClick={() => setFormData({...formData, fitnessLevel: level})}
                                                className={`p-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all
                                                    ${formData.fitnessLevel === level ? 'border-primary bg-primary/5 text-primary' : 'border-black/5 hover:border-black/10 text-gray-400 dark:border-white/5'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Objetivos Principales</label>
                                    <textarea name="fitnessGoals" value={formData.fitnessGoals} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Condiciones Médicas / Lesiones</label>
                                    <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="Ninguna" rows={3} className="w-full p-4 bg-red-50/30 dark:bg-red-900/10 border-none rounded-2xl focus:ring-2 focus:ring-red-500 text-sm font-medium text-red-700 dark:text-red-300" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Años de Experiencia</label>
                                    <NumberInputWithButtons value={formData.experienceYears || 0} onChange={(v) => setFormData({...formData, experienceYears: v as number})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Especialidades / Habilidades</label>
                                <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="Ej: CrossFit L-1, Nutrición Deportiva, Rehabilitación..." rows={4} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium" />
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Enlaces Sociales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Instagram (@usuario)</label>
                                        <input name="socialLinks.instagram" value={formData.socialLinks?.instagram || ''} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">LinkedIn URL</label>
                                        <input name="socialLinks.linkedin" value={formData.socialLinks?.linkedin || ''} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'emergency' && (
                        <div className="space-y-8 animate-fade-in">
                             <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-4">
                                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg">
                                    <IdentificationIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-blue-800 dark:text-blue-200">Información Crítica</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">Estos datos son esenciales para tu seguridad. Solo serán consultados por el personal administrativo en caso de una urgencia médica dentro de las instalaciones.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre de Contacto</label>
                                    <input name="emergencyContact.name" value={formData.emergencyContact?.name || ''} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Parentesco / Relación</label>
                                    <input name="emergencyContact.relation" value={formData.emergencyContact?.relation || ''} onChange={handleChange} placeholder="Ej: Esposo, Madre, Amigo" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Teléfono de Contacto</label>
                                    <input name="emergencyContact.phone" value={formData.emergencyContact?.phone || ''} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Robust Footer */}
            <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    Tus datos se almacenan localmente y de forma segura
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex-1 sm:px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircleIcon className="w-6 h-6" />
                        )}
                        {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                    {onCancel && (
                        <button 
                            onClick={onCancel}
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-2xl font-black transition-all border border-black/5 shadow-sm"
                        >
                            CANCELAR
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
