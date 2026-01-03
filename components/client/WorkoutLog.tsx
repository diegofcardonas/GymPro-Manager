
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DailyRoutine, LoggedExercise, LoggedSet } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { NumberInputWithButtons } from '../shared/NumberInputWithButtons';
import { useTranslation } from 'react-i18next';
import { MOCK_EXERCISES } from '../../data/mockExercises';

interface WorkoutLogProps {
    onNavigate?: (view: string) => void;
}

const WorkoutLog: React.FC<WorkoutLogProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const { currentUser, logWorkout } = useContext(AuthContext);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DailyRoutine['day'];
    const todaysRoutine = useMemo(() => {
        const firstRoutine = currentUser?.assignedRoutines?.[0]?.routine;
        return firstRoutine?.find(r => r.day === today);
    }, [currentUser, today]);

    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
    const [isFreestyle, setIsFreestyle] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [initialTime, setInitialTime] = useState(60);

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

    useEffect(() => {
        let interval: number | undefined;
        if (timerActive && timeLeft > 0) {
            interval = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        setLoggedExercises(prev => {
            const updated = [...prev];
            updated[exIndex].completedSets = [...updated[exIndex].completedSets];
            updated[exIndex].completedSets[setIndex] = { ...updated[exIndex].completedSets[setIndex], [field]: value };
            return updated;
        });
    };

    const handleLogWorkout = () => {
        if (!currentUser) return;
        logWorkout(currentUser.id, { id: `ws-${Date.now()}`, date: new Date().toISOString(), day: today, loggedExercises });
        if (onNavigate) onNavigate('progress');
    };

    if (loggedExercises.length === 0 && !isFreestyle) {
        return (
            <div className="w-full max-w-2xl text-center bg-white dark:bg-gray-800 p-12 rounded-4xl shadow-xl border border-black/5 flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="p-6 bg-primary/10 rounded-full mb-6"><ClockIcon className="w-12 h-12 text-primary" /></div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">¡Día de Descanso!</h2>
                <p className="text-gray-500 mb-8 max-w-xs">No tienes una rutina para hoy, pero puedes entrenar libre si te sientes con energía.</p>
                <button onClick={() => { setIsFreestyle(true); setLoggedExercises([{ name: '', plannedSets: 3, plannedReps: '10', completedSets: [{ weight: 0, reps: 0 }] }]); }} className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3">
                    <PlusIcon className="w-6 h-6" /> Entrenamiento Libre
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl space-y-6 pb-32">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                    {t('workout.logTitle')} <span className="text-primary italic">#{t(`days.${today}`)}</span>
                </h2>
                <button onClick={() => setLoggedExercises([...loggedExercises, { name: '', plannedSets: 3, plannedReps: '10', completedSets: [{weight:0, reps:0}] }])} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-primary transition-all"><PlusIcon className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-6">
                {loggedExercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-black/5 animate-fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1 mr-4">
                                <select 
                                    value={exercise.name} 
                                    onChange={(e) => { const updated = [...loggedExercises]; updated[exIndex].name = e.target.value; setLoggedExercises(updated); }} 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Selecciona Ejercicio...</option>
                                    {MOCK_EXERCISES.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <button onClick={() => setLoggedExercises(loggedExercises.filter((_, i) => i !== exIndex))} className="p-2 text-gray-300 hover:text-red-500"><TrashIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="space-y-3">
                            {exercise.completedSets.map((set, setIndex) => (
                                <div key={setIndex} className="flex items-center gap-3 p-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl">
                                    <span className="w-8 text-center font-black text-gray-300">#{setIndex + 1}</span>
                                    <div className="flex-1 flex gap-2">
                                        <NumberInputWithButtons value={set.weight} onChange={(v) => handleSetChange(exIndex, setIndex, 'weight', v as number)} step={2.5} className="flex-1" />
                                        <NumberInputWithButtons value={set.reps} onChange={(v) => handleSetChange(exIndex, setIndex, 'reps', v as number)} className="flex-1" />
                                    </div>
                                    <button onClick={() => { setTimeLeft(60); setTimerActive(true); }} className="p-2 text-primary/40 hover:text-primary"><ClockIcon className="w-5 h-5" /></button>
                                </div>
                            ))}
                            <button onClick={() => { const updated = [...loggedExercises]; updated[exIndex].completedSets.push({weight:0, reps:0}); setLoggedExercises(updated); }} className="w-full py-2 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black text-gray-400 hover:text-primary hover:border-primary/30 transition-all">+ AÑADIR SERIE</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-20 left-0 w-full px-6 md:px-0 md:static md:flex md:justify-center">
                 <button onClick={handleLogWorkout} className="w-full md:w-auto px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xl rounded-3xl shadow-2xl hover:scale-105 transition-all">
                    FINALIZAR SESIÓN 🎉
                </button>
            </div>

            {timerActive && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-slide-up border border-white/10">
                    <div className="text-2xl font-black font-mono tracking-tighter">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
                    <div className="h-4 w-px bg-white/20"></div>
                    <button onClick={() => setTimerActive(false)} className="text-[10px] font-black uppercase text-red-400">Parar</button>
                </div>
            )}
        </div>
    );
};

export default WorkoutLog;
