
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DailyRoutine, LoggedExercise, LoggedSet } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { NumberInputWithButtons } from '../shared/NumberInputWithButtons';
import { useTranslation } from 'react-i18next';
import { MOCK_EXERCISES } from '../../data/mockExercises';
import WorkoutPlayer from './WorkoutPlayer';

interface WorkoutLogProps {
    onNavigate?: (view: string) => void;
}

const WorkoutLog: React.FC<WorkoutLogProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const { currentUser, logWorkout } = useContext(AuthContext);
    const [isPlaying, setIsPlaying] = useState(false);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DailyRoutine['day'];
    const todaysRoutine = useMemo(() => {
        const firstRoutine = currentUser?.assignedRoutines?.[0]?.routine;
        return firstRoutine?.find(r => r.day === today);
    }, [currentUser, today]);

    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
    const [isFreestyle, setIsFreestyle] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized && currentUser) {
            if (todaysRoutine?.exercises && todaysRoutine.exercises.length > 0) {
                setLoggedExercises(todaysRoutine.exercises.map(ex => ({
                    name: ex.name,
                    plannedSets: ex.sets,
                    plannedReps: ex.reps,
                    completedSets: Array(ex.sets).fill({ weight: 0, reps: 0 })
                })));
                setIsInitialized(true);
            } else {
                 setIsInitialized(true);
            }
        }
    }, [todaysRoutine, isInitialized, currentUser]);

    const handleLogWorkout = (results: LoggedExercise[]) => {
        if (!currentUser) return;
        logWorkout(currentUser.id, { id: `ws-${Date.now()}`, date: new Date().toISOString(), day: today, loggedExercises: results });
        if (onNavigate) onNavigate('progress');
    };

    if (isPlaying) {
        return <WorkoutPlayer exercises={loggedExercises} onFinish={handleLogWorkout} onCancel={() => setIsPlaying(false)} />;
    }

    if (loggedExercises.length === 0 && !isFreestyle) {
        return (
            <div className="w-full max-w-2xl text-center bg-white dark:bg-gray-800 p-12 rounded-4xl shadow-xl border border-black/5 flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="p-6 bg-primary/10 rounded-full mb-6"><ClockIcon className="w-12 h-12 text-primary" /></div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{t('client.workout.restDay')}</h2>
                <p className="text-gray-500 mb-8 max-w-xs">{t('client.workout.noRoutine')}</p>
                <button onClick={() => { setIsFreestyle(true); setLoggedExercises([{ name: '', plannedSets: 3, plannedReps: '10', completedSets: [{ weight: 0, reps: 0 }] }]); }} className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3">
                    <PlusIcon className="w-6 h-6" /> {t('client.workout.freestyle')}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl space-y-6 pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                        {t('nav.workoutLog')} <span className="text-primary italic">#{t(`days.${today}`)}</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t('client.workout.exercisesConfigured', { count: loggedExercises.length })}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setIsPlaying(true)} className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                         {t('client.workout.preparePlayer')}
                    </button>
                    <button onClick={() => setLoggedExercises([...loggedExercises, { name: '', plannedSets: 3, plannedReps: '10', completedSets: [{weight:0, reps:0}] }])} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-primary transition-all"><PlusIcon className="w-6 h-6" /></button>
                </div>
            </div>
            
            <div className="space-y-6">
                {loggedExercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-black/5 animate-fade-in group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1 mr-4">
                                <select 
                                    value={exercise.name} 
                                    onChange={(e) => { const updated = [...loggedExercises]; updated[exIndex].name = e.target.value; setLoggedExercises(updated); }} 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">{t('client.workout.selectExercise')}</option>
                                    {MOCK_EXERCISES.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <button onClick={() => setLoggedExercises(loggedExercises.filter((_, i) => i !== exIndex))} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><TrashIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {exercise.completedSets.map((set, setIndex) => (
                                <div key={setIndex} className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-black/[0.02]">
                                    <span className="w-6 text-center font-black text-gray-300 text-xs">#{setIndex + 1}</span>
                                    <div className="flex-1 flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">{t('general.kg')}</label>
                                            <NumberInputWithButtons value={set.weight} onChange={(v) => {
                                                const updated = [...loggedExercises];
                                                updated[exIndex].completedSets[setIndex].weight = v as number;
                                                setLoggedExercises(updated);
                                            }} step={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">REPS</label>
                                            <NumberInputWithButtons value={set.reps} onChange={(v) => {
                                                const updated = [...loggedExercises];
                                                updated[exIndex].completedSets[setIndex].reps = v as number;
                                                setLoggedExercises(updated);
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => { const updated = [...loggedExercises]; updated[exIndex].completedSets.push({weight:0, reps:0}); setLoggedExercises(updated); }} className="flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] font-black text-gray-400 hover:text-primary hover:border-primary/30 transition-all p-4">
                                + {t('client.workout.addSet')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-20 left-0 w-full px-6 md:px-0 md:static md:flex md:justify-center z-10">
                 <button onClick={() => handleLogWorkout(loggedExercises)} className="w-full md:w-auto px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xl rounded-3xl shadow-2xl hover:scale-105 transition-all">
                    {t('client.workout.saveManual')}
                </button>
            </div>
        </div>
    );
};

export default WorkoutLog;
