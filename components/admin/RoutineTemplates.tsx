
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { PreEstablishedRoutine, DailyRoutine, Exercise } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { MOCK_EXERCISES } from '../../data/mockExercises';
import { NumberInputWithButtons } from '../shared/NumberInputWithButtons';
import { ShareIcon } from '../icons/ShareIcon';
import ShareRoutineModal from '../shared/ShareRoutineModal';
import { useTranslation } from 'react-i18next';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { FireIcon } from '../icons/FireIcon';
// FIX: Added missing import for XCircleIcon
import { XCircleIcon } from '../icons/XCircleIcon';
import { GoogleGenAI } from "@google/genai";

const RoutineTemplates: React.FC = () => {
    const { preEstablishedRoutines, addRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PreEstablishedRoutine | null>(null);
    const [sharingTemplate, setSharingTemplate] = useState<PreEstablishedRoutine | null>(null);
    const { t } = useTranslation();

    const handleAddNew = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const handleEdit = (template: PreEstablishedRoutine) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleDelete = (templateId: string) => {
        if (window.confirm(t('general.confirmDelete'))) {
            deleteRoutineTemplate(templateId);
        }
    };

    const handleSave = (template: PreEstablishedRoutine) => {
        if (template.id) {
            updateRoutineTemplate(template);
        } else {
            addRoutineTemplate({ ...template, id: `rt-${Date.now()}` });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                        {t('admin.dashboard.routineTemplates')}
                    </h2>
                    <p className="text-gray-500 font-medium text-sm">Crea estándares de excelencia para tus entrenamientos.</p>
                </div>
                <button onClick={handleAddNew} className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>NUEVA PLANTILLA MAESTRA</span>
                </button>
            </div>

            {preEstablishedRoutines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {preEstablishedRoutines.map(template => (
                        <TemplateCard key={template.id} template={template} onEdit={handleEdit} onDelete={handleDelete} onShare={setSharingTemplate} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-4xl border-2 border-dashed border-black/5 flex flex-col items-center">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-full mb-4">
                        <PlusIcon className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">No hay plantillas creadas</h3>
                    <p className="mt-2 text-gray-400 text-sm">Empieza a estandarizar los procesos de entreno.</p>
                </div>
            )}


            {isModalOpen && (
                <RoutineTemplateModal
                    template={editingTemplate}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
             {sharingTemplate && (
                <ShareRoutineModal
                    routine={sharingTemplate}
                    onClose={() => setSharingTemplate(null)}
                />
            )}
        </div>
    );
};

const TemplateCard: React.FC<{ template: PreEstablishedRoutine, onEdit: (template: PreEstablishedRoutine) => void, onDelete: (id: string) => void, onShare: (template: PreEstablishedRoutine) => void }> = ({ template, onEdit, onDelete, onShare }) => {
    const workoutDays = useMemo(() => template.routines.filter(r => r.exercises.length > 0).length, [template.routines]);
    const totalExercises = useMemo(() => template.routines.reduce((acc, curr) => acc + curr.exercises.length, 0), [template.routines]);
    
    return (
        <div className="group bg-white dark:bg-gray-800/50 rounded-4xl shadow-sm hover:shadow-2xl border border-black/5 transition-all duration-500 flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <SparklesAiIcon className="w-32 h-32 rotate-12" />
            </div>

            <div className="p-8 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">
                        {workoutDays} DÍAS ACTIVOS
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase italic">MASTER TEMPLATE</span>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{template.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 h-10 font-medium">{template.description}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ejercicios</p>
                        <p className="text-xl font-black text-gray-800 dark:text-white">{totalExercises}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volumen</p>
                        <p className="text-xl font-black text-primary">Alta</p>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-900/20 border-t border-black/5 flex justify-between items-center">
                <button onClick={() => onShare(template)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-500 transition-all">
                    <ShareIcon className="w-4 h-4" /> COMPARTIR
                </button>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(template)} className="p-3 bg-white dark:bg-gray-700 text-gray-500 hover:text-primary rounded-2xl shadow-sm hover:scale-110 transition-all">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(template.id)} className="p-3 bg-white dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-2xl shadow-sm hover:scale-110 transition-all">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoutineTemplateModal: React.FC<{ template: PreEstablishedRoutine | null, onSave: (template: PreEstablishedRoutine) => void, onClose: () => void }> = ({ template, onSave, onClose }) => {
    const { t } = useTranslation();
    const weekDays: DailyRoutine['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const initialRoutine = weekDays.map(day => ({ day, exercises: [] as Exercise[] }));
    
    const [formData, setFormData] = useState(template || { id: '', name: '', description: '', routines: initialRoutine });
    const [activeDay, setActiveDay] = useState<DailyRoutine['day']>('Monday');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (template) {
            setFormData(template);
        } else {
             setFormData({ id: '', name: '', description: '', routines: initialRoutine });
        }
    }, [template]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleAddExercise = () => {
        setFormData(currentData => {
            const newData = { ...currentData };
            let dayRoutine = newData.routines.find(r => r.day === activeDay);
            if (dayRoutine) {
                dayRoutine.exercises.push({ name: '', sets: 3, reps: '10' });
            }
            return { ...newData, routines: [...newData.routines] };
        });
    };
    
    const handleRemoveExercise = (exIndex: number) => {
        setFormData(currentData => {
            const dayRoutine = currentData.routines.find(r => r.day === activeDay);
            if (dayRoutine) {
                dayRoutine.exercises.splice(exIndex, 1);
            }
            return { ...currentData, routines: [...currentData.routines] };
        });
    };

    const handleExerciseChange = (exIndex: number, field: keyof Exercise, value: string | number) => {
        setFormData(currentData => {
            const dayRoutine = currentData.routines.find(r => r.day === activeDay);
            if (dayRoutine) {
                dayRoutine.exercises[exIndex] = { ...dayRoutine.exercises[exIndex], [field]: value };
            }
            return { ...currentData, routines: [...currentData.routines]};
        });
    };
    
    const generateWithAi = async () => {
        if (!process.env.API_KEY || !formData.name) return;
        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Genera una lista de 5 ejercicios efectivos para el día ${activeDay} de la rutina "${formData.name}". 
            Responde SOLO con un array JSON válido: [{"name": "string", "sets": number, "reps": "string"}]. 
            Usa nombres de ejercicios conocidos.`;
            
            const res = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            
            const cleaned = (res.text || '').replace(/```json|```/g, "").trim();
            const exercises = JSON.parse(cleaned);
            
            setFormData(prev => ({
                ...prev,
                routines: prev.routines.map(r => r.day === activeDay ? { ...r, exercises } : r)
            }));
        } catch (e) {
            console.error("AI Generation Error", e);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const activeDayRoutine = useMemo(() => formData.routines.find(r => r.day === activeDay), [formData.routines, activeDay]);
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-4xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-scale-in">
                <div className="p-8 bg-primary text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
                    <SparklesAiIcon className="absolute -right-6 -top-6 w-32 h-32 opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Editor de Plantilla</h2>
                        <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-widest mt-1">Configuración Maestro de Rutinas</p>
                    </div>
                    <button onClick={onClose} type="button" className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-black/5 bg-gray-50/50 dark:bg-gray-900/20 flex-shrink-0">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Estándar</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInfoChange} className="w-full p-4 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-sm" required placeholder="Ej: Hipertrofia Push/Pull/Legs" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Descripción de Objetivo</label>
                        <input type="text" name="description" value={formData.description} onChange={handleInfoChange} className="w-full p-4 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium shadow-sm" placeholder="Define el propósito de esta rutina..." />
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                    <div className="w-full md:w-56 bg-gray-50 dark:bg-gray-900/50 border-r border-black/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
                        {weekDays.map(day => (
                            <button 
                                type="button" 
                                key={day} 
                                onClick={() => setActiveDay(day)} 
                                className={`flex-shrink-0 flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDay === day ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <span>{t(`days.${day}`)}</span>
                                <div className={`w-2 h-2 rounded-full ${formData.routines.find(r => r.day === day)?.exercises.length ? 'bg-emerald-400' : 'bg-transparent'}`} />
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">
                                    {t(`days.${activeDay}`)}
                                </h3>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Configura los ejercicios de este bloque</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={generateWithAi} 
                                disabled={isAiLoading || !formData.name}
                                className="w-full sm:w-auto px-6 py-3 bg-violet-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isAiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SparklesAiIcon className="w-4 h-4" />}
                                GENERAR CON IA
                            </button>
                        </div>

                        <div className="space-y-4 flex-1">
                            {activeDayRoutine?.exercises.map((ex, exIndex) => (
                                <div key={exIndex} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-black/[0.02] flex flex-col lg:flex-row items-center gap-4 group animate-slide-up">
                                    <div className="flex-1 w-full">
                                        <label className="text-[8px] font-black text-gray-400 uppercase ml-2 block mb-1">Ejercicio</label>
                                        <select 
                                            value={ex.name} 
                                            onChange={(e) => handleExerciseChange(exIndex, 'name', e.target.value)} 
                                            className="w-full p-4 bg-white dark:bg-gray-800 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-sm"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {MOCK_EXERCISES.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-full lg:w-32">
                                        <label className="text-[8px] font-black text-gray-400 uppercase ml-2 block mb-1">Series</label>
                                        <NumberInputWithButtons value={ex.sets} onChange={(v) => handleExerciseChange(exIndex, 'sets', v as number)} />
                                    </div>
                                    <div className="w-full lg:w-32">
                                        <label className="text-[8px] font-black text-gray-400 uppercase ml-2 block mb-1">Reps</label>
                                        <NumberInputWithButtons value={ex.reps} onChange={(v) => handleExerciseChange(exIndex, 'reps', v as string)} />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveExercise(exIndex)} className="p-3 text-gray-300 hover:text-red-500 transition-colors self-end lg:self-center">
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            ))}

                            {(!activeDayRoutine || activeDayRoutine.exercises.length === 0) && (
                                <div className="py-16 text-center border-2 border-dashed border-black/5 rounded-4xl flex flex-col items-center">
                                    <ClockIcon className="w-12 h-12 text-gray-200 mb-2" />
                                    <p className="font-bold text-gray-300 uppercase tracking-widest text-[10px]">Bloque de Descanso</p>
                                </div>
                            )}

                            <button type="button" onClick={handleAddExercise} className="w-full py-5 border-2 border-dashed border-black/5 rounded-3xl font-black text-gray-400 text-xs uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">
                                + AÑADIR EJERCICIO
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-black/5 flex flex-col sm:flex-row gap-4 flex-shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                        {t('general.cancel')}
                    </button>
                    <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                        {t('general.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoutineTemplates;
