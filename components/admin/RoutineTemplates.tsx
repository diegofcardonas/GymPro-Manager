
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
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard.routineTemplates')}</h2>
                <button onClick={handleAddNew} className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-primary-foreground">
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('general.add')}</span>
                </button>
            </div>

            {preEstablishedRoutines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {preEstablishedRoutines.map(template => (
                        <TemplateCard key={template.id} template={template} onEdit={handleEdit} onDelete={handleDelete} onShare={setSharingTemplate} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Routine Templates Found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Get started by creating a new template.</p>
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
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg flex flex-col">
            <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 h-16 overflow-hidden">{template.description}</p>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">{workoutDays} workout day{workoutDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                <button onClick={() => onShare(template)} className="p-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"><ShareIcon className="h-5 w-5" /></button>
                <button onClick={() => onEdit(template)} className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => onDelete(template.id)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
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
            } else {
                // This case should not happen with initialization, but as a fallback:
                const newDayRoutine = { day: activeDay, exercises: [{ name: '', sets: 3, reps: '10' }] };
                const dayIndex = weekDays.indexOf(activeDay);
                newData.routines.splice(dayIndex, 0, newDayRoutine);
            }
            return { ...newData, routines: [...newData.routines] }; // Ensure re-render
        });
    };
    
    const handleRemoveExercise = (exIndex: number) => {
        setFormData(currentData => {
            const dayRoutine = currentData.routines.find(r => r.day === activeDay);
            if (dayRoutine) {
                dayRoutine.exercises.splice(exIndex, 1);
            }
            return { ...currentData, routines: [...currentData.routines] }; // Ensure re-render
        });
    };

    const handleExerciseChange = (exIndex: number, field: keyof Exercise, value: string | number) => {
        setFormData(currentData => {
            const dayRoutine = currentData.routines.find(r => r.day === activeDay);
            if (dayRoutine) {
                dayRoutine.exercises[exIndex] = { ...dayRoutine.exercises[exIndex], [field]: value };
            }
            return { ...currentData, routines: [...currentData.routines]}; // Ensure re-render
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const activeDayRoutine = useMemo(() => formData.routines.find(r => r.day === activeDay), [formData.routines, activeDay]);
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">Plantilla de Rutina {template ? 'Editar' : 'Crear'}</h2>
                <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto max-h-48">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.name')}</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInfoChange} className="mt-1 block w-full input-style" required />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.description')}</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleInfoChange} rows={2} className="mt-1 block w-full input-style" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-x-auto md:overflow-y-auto flex-shrink-0">
                         <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1">
                            {weekDays.map(day => (
                                <button type="button" key={day} onClick={() => setActiveDay(day)} className={`w-full text-left p-2 px-3 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeDay === day ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{day}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                         <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Rutina del {activeDay}</h3>
                         <div className="space-y-3">
                            {activeDayRoutine && activeDayRoutine.exercises.length > 0 && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="flex-grow text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ejercicio</div>
                                    <div className="w-28 flex-shrink-0 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Series</div>
                                    <div className="w-32 flex-shrink-0 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Repeticiones</div>
                                    <div className="w-9 flex-shrink-0"></div> {/* Spacer for delete button */}
                                </div>
                            )}
                            {activeDayRoutine?.exercises.map((ex, exIndex) => (
                                <div key={exIndex} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg sm:p-0 sm:bg-transparent sm:dark:bg-transparent">
                                    <div className="flex-grow w-full sm:w-auto">
                                        <label className="text-xs font-semibold text-gray-500 sm:hidden mb-1 block">Ejercicio</label>
                                        <select value={ex.name} onChange={(e) => handleExerciseChange(exIndex, 'name', e.target.value)} className="w-full input-style">
                                            <option value="" disabled>Selecciona un ejercicio...</option>
                                            {MOCK_EXERCISES.map(exerciseName => (
                                                <option key={exerciseName} value={exerciseName}>{exerciseName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
                                        <div className="flex flex-col sm:block w-24 sm:w-28">
                                            <label className="text-xs font-semibold text-gray-500 sm:hidden mb-1 block">Series</label>
                                            <NumberInputWithButtons value={ex.sets} onChange={(v) => handleExerciseChange(exIndex, 'sets', v as number)} className="w-full" />
                                        </div>
                                        <div className="flex flex-col sm:block w-28 sm:w-32">
                                            <label className="text-xs font-semibold text-gray-500 sm:hidden mb-1 block">Reps</label>
                                            <NumberInputWithButtons value={ex.reps} onChange={(v) => handleExerciseChange(exIndex, 'reps', v as string)} className="w-full" />
                                        </div>
                                        <div className="sm:w-9 flex justify-end sm:justify-center mt-4 sm:mt-0">
                                            <button type="button" onClick={() => handleRemoveExercise(exIndex)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                         {(!activeDayRoutine || activeDayRoutine.exercises.length === 0) && <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"><p className="font-semibold text-gray-500 dark:text-gray-400">Día de Descanso</p></div>}
                        <div className="mt-4">
                            <button type="button" onClick={handleAddExercise} className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-semibold transition-colors text-gray-500 dark:text-gray-400">
                                <PlusIcon className="h-5 w-5" />
                                <span>Añadir Nuevo Ejercicio</span>
                            </button>
                        </div>
                    </div>
               </div>

                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold transition-colors text-gray-800 dark:text-gray-200">{t('general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors text-primary-foreground">{t('general.save')}</button>
                </div>
                 {/* FIX: Removed non-standard "jsx" prop from style tag. */}
                 <style>{`
                    .input-style {
                        background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; color: #111827; padding: 0.5rem 0.75rem;
                    }
                    .dark .input-style {
                        background-color: #374151; border-color: #4b5563; color: #f9fafb;
                    }
                    .input-style:focus { --tw-ring-color: hsl(var(--primary)); border-color: hsl(var(--primary)); }
                `}</style>
            </form>
        </div>
    );
};


export default RoutineTemplates;
