
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

    // State for the exercises being logged
    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
    const [isFreestyle, setIsFreestyle] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize exercises based on routine or existing state
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
            } else if (todaysRoutine?.exercises && todaysRoutine.exercises.length === 0) {
                 // It's a rest day or empty routine day
                 setIsInitialized(true);
            } else if (!todaysRoutine) {
                // No routine found at all for today
                setIsInitialized(true);
            }
        }
    }, [todaysRoutine, isInitialized, currentUser]);

    // Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [initialTime, setInitialTime] = useState(60);

    useEffect(() => {
        let interval: number | undefined;
        if (timerActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            // Could play a sound here
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startTimer = (seconds: number) => {
        setInitialTime(seconds);
        setTimeLeft(seconds);
        setTimerActive(true);
    };
    
    const stopTimer = () => {
        setTimerActive(false);
        setTimeLeft(0);
    }
    
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        setLoggedExercises(prev => {
            const newLoggedExercises = [...prev];
            newLoggedExercises[exIndex].completedSets = [...newLoggedExercises[exIndex].completedSets];
            newLoggedExercises[exIndex].completedSets[setIndex] = {
                ...newLoggedExercises[exIndex].completedSets[setIndex],
                [field]: value
            };
            return newLoggedExercises;
        });
    };
    
    const handleAddSet = (exIndex: number) => {
        setLoggedExercises(prev => {
            const newLoggedExercises = [...prev];
            newLoggedExercises[exIndex].completedSets = [...newLoggedExercises[exIndex].completedSets, { weight: 0, reps: 0}];
            return newLoggedExercises;
        });
    };

    const handleRemoveSet = (exIndex: number, setIndex: number) => {
        setLoggedExercises(prev => {
            const newLoggedExercises = [...prev];
            newLoggedExercises[exIndex].completedSets = newLoggedExercises[exIndex].completedSets.filter((_, i) => i !== setIndex);
            return newLoggedExercises;
        });
    };

    const handleLogWorkout = () => {
        if (!currentUser) return;
        // Filter out exercises with no sets or incomplete data if strict validation is needed
        // For now, we log everything that's visible
        const session = {
            id: `ws-${Date.now()}`,
            date: new Date().toISOString(),
            day: today,
            loggedExercises,
        };
        logWorkout(currentUser.id, session);
        
        // Redirect to progress view or dashboard
        if (onNavigate) {
            onNavigate('progress');
        }
    };

    const handleAddExercise = () => {
        setLoggedExercises(prev => [...prev, {
            name: '',
            plannedSets: 3,
            plannedReps: '10',
            completedSets: [{ weight: 0, reps: 0 }, { weight: 0, reps: 0 }, { weight: 0, reps: 0 }]
        }]);
        setIsFreestyle(true); // Switch to "active" mode UI if we were on rest day screen
    };

    const handleRemoveExercise = (index: number) => {
        setLoggedExercises(prev => prev.filter((_, i) => i !== index));
    };

    const handleExerciseNameChange = (index: number, name: string) => {
        setLoggedExercises(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], name: name };
            return updated;
        });
    };

    const startFreestyle = () => {
        setIsFreestyle(true);
        handleAddExercise();
    };

    const isRestDay = (!todaysRoutine || todaysRoutine.exercises.length === 0) && !isFreestyle && loggedExercises.length === 0;

    if (isRestDay) {
        return (
            <div className="w-full max-w-2xl text-center bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('workout.restDayTitle')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{t('workout.restDayDesc')}</p>
                
                <button 
                    onClick={startFreestyle}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t('workout.freeWorkout')}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isFreestyle ? t('workout.freeTitle') : <>{t('workout.logTitle')}: <span className="text-primary capitalize">{t(`days.${today}`)}</span></>}
                </h2>
                 <button onClick={handleAddExercise} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
                    <PlusIcon className="w-4 h-4" /> {t('workout.addExercise')}
                </button>
            </div>
            
            <div className="space-y-6">
                {loggedExercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 p-5 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-4 gap-4">
                            <div className="flex-grow">
                                {exercise.name ? (
                                    <div className="group/title relative">
                                        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">{exercise.name}</h3>
                                        <button 
                                            onClick={() => handleExerciseNameChange(exIndex, '')}
                                            className="absolute -right-6 top-1 opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-primary"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                     <select 
                                        value={exercise.name} 
                                        onChange={(e) => handleExerciseNameChange(exIndex, e.target.value)} 
                                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-900 dark:text-white"
                                        autoFocus
                                    >
                                        <option value="" disabled>{t('admin.userManagement.selectPlaceholder')}</option>
                                        {MOCK_EXERCISES.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                )}
                                {exercise.name && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('workout.target')}: {exercise.plannedSets} x {exercise.plannedReps}</p>
                                )}
                            </div>
                            <button 
                                onClick={() => handleRemoveExercise(exIndex)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {exercise.completedSets.map((set, setIndex) => (
                                <div key={setIndex} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="font-bold text-gray-400 dark:text-gray-500 w-8 flex-shrink-0">#{setIndex + 1}</span>
                                    <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                                        <NumberInputWithButtons 
                                            value={set.weight} 
                                            onChange={(v) => handleSetChange(exIndex, setIndex, 'weight', v as number)} 
                                            step={2.5} 
                                            className="w-full" />
                                         <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">kg</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                                        <NumberInputWithButtons 
                                            value={set.reps} 
                                            onChange={(v) => handleSetChange(exIndex, setIndex, 'reps', v as number)} 
                                            className="w-full" />
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">reps</span>
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                        {/* Quick Rest Timer Trigger */}
                                        <button onClick={() => startTimer(60)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors" title="Start 60s Rest">
                                            <ClockIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleRemoveSet(exIndex, setIndex)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button onClick={() => handleAddSet(exIndex)} className="mt-4 text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                             <PlusIcon className="w-4 h-4" /> {t('admin.userManagement.addUser').replace('User', 'Set')}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-6">
                 <button onClick={handleLogWorkout} className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-xl hover:bg-primary/90 transition-transform transform hover:scale-105 w-full sm:w-auto">
                    {t('workout.finish')}
                </button>
            </div>

            {/* Floating Timer */}
            <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 transform ${timerActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="bg-gray-900 dark:bg-gray-800 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
                    <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-primary transition-all duration-1000 ease-linear" strokeDasharray={175} strokeDashoffset={175 - (175 * timeLeft) / initialTime} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('workout.rest')}</p>
                        <div className="flex gap-2 mt-2">
                             <button onClick={() => startTimer(initialTime + 10)} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">+10s</button>
                             <button onClick={stopTimer} className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white">Stop</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Icon since PencilIcon wasn't imported in the original WorkoutLog.tsx but used in the updated version
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export default WorkoutLog;
