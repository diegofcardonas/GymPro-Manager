
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LoggedExercise, LoggedSet } from '../../types';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { NumberInputWithButtons } from '../shared/NumberInputWithButtons';

interface WorkoutPlayerProps {
    exercises: LoggedExercise[];
    onFinish: (results: LoggedExercise[]) => void;
    onCancel: () => void;
}

const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ exercises, onFinish, onCancel }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [localExercises, setLocalExercises] = useState<LoggedExercise[]>(JSON.parse(JSON.stringify(exercises)));
    const [restTime, setRestTime] = useState(0);
    const [isResting, setIsResting] = useState(false);

    const currentExercise = localExercises[currentIndex];

    useEffect(() => {
        let timer: number;
        if (isResting && restTime > 0) {
            timer = window.setInterval(() => setRestTime(prev => prev - 1), 1000);
        } else if (restTime === 0) {
            setIsResting(false);
        }
        return () => clearInterval(timer);
    }, [isResting, restTime]);

    const handleSetChange = (setIndex: number, field: keyof LoggedSet, value: number) => {
        const updated = [...localExercises];
        updated[currentIndex].completedSets[setIndex] = {
            ...updated[currentIndex].completedSets[setIndex],
            [field]: value
        };
        setLocalExercises(updated);
    };

    const startRest = () => {
        setRestTime(60);
        setIsResting(true);
    };

    const nextExercise = () => {
        if (currentIndex < localExercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsResting(false);
        } else {
            onFinish(localExercises);
        }
    };

    const progress = ((currentIndex + 1) / localExercises.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <button onClick={onCancel} className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('general.cancel')}</button>
                <div className="flex-1 px-8">
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <span className="font-black text-primary">{currentIndex + 1}/{localExercises.length}</span>
            </div>

            {/* Main Player */}
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <div className="w-full max-w-xl space-y-8 py-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{currentExercise.name}</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Objetivo: {currentExercise.plannedSets} series x {currentExercise.plannedReps} reps</p>
                    </div>

                    <div className="space-y-4">
                        {currentExercise.completedSets.map((set, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 flex items-center gap-4 border border-black/[0.03] dark:border-white/[0.03]">
                                <span className="text-2xl font-black text-gray-300 w-12 text-center">#{idx + 1}</span>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">{t('general.kg')}</label>
                                        <NumberInputWithButtons value={set.weight} onChange={(v) => handleSetChange(idx, 'weight', v as number)} step={2.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">REPS</label>
                                        <NumberInputWithButtons value={set.reps} onChange={(v) => handleSetChange(idx, 'reps', v as number)} />
                                    </div>
                                </div>
                                <button onClick={startRest} className="p-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all">
                                    <ClockIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer Actions */}
            <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white dark:bg-gray-950 flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 rounded-3xl font-black uppercase tracking-widest text-xs disabled:opacity-30"
                >
                    {t('general.view')} Anterior
                </button>
                <button 
                    onClick={nextExercise}
                    className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {currentIndex === localExercises.length - 1 ? t('player.finish') : t('player.next')}
                </button>
            </div>

            {/* Rest Overlay */}
            {isResting && (
                <div className="fixed inset-0 z-[110] bg-primary flex flex-col items-center justify-center text-white animate-fade-in">
                    <span className="text-sm font-black uppercase tracking-[0.3em] mb-4 opacity-70">{t('player.rest')}</span>
                    <h2 className="text-9xl font-black font-mono tracking-tighter mb-12">
                        {Math.floor(restTime / 60)}:{String(restTime % 60).padStart(2, '0')}
                    </h2>
                    <button onClick={() => setIsResting(false)} className="px-12 py-5 bg-white text-primary rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-110 transition-all">
                        {t('player.skip')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlayer;
