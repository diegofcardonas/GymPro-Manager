
import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LoggedExercise, WorkoutSession } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { FireIcon } from '../icons/FireIcon';

const ProgressView: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useContext(AuthContext);
    const [selectedExercise, setSelectedExercise] = useState<string>('');

    const workoutHistory = useMemo(() => {
        return [...(currentUser?.workoutHistory || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [currentUser?.workoutHistory]);

    const uniqueExercises = useMemo(() => {
        const exerciseSet = new Set<string>();
        workoutHistory.forEach(session => {
            session.loggedExercises.forEach(ex => {
                if (ex.name) exerciseSet.add(ex.name);
            });
        });
        return Array.from(exerciseSet).sort();
    }, [workoutHistory]);

    // Set default selected exercise if none is selected
    if (!selectedExercise && uniqueExercises.length > 0) {
        setSelectedExercise(uniqueExercises[0]);
    }

    const chartData = useMemo(() => {
        if (!selectedExercise) return [];
        
        return workoutHistory
            .map(session => {
                const exercise = session.loggedExercises.find(ex => ex.name === selectedExercise);
                if (!exercise || !exercise.completedSets || exercise.completedSets.length === 0) return null;

                const validSets = exercise.completedSets.filter(s => s.weight > 0 && s.reps > 0);
                if (validSets.length === 0) return null;

                const maxWeight = Math.max(...validSets.map(s => s.weight));
                const totalVolume = validSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                
                // Brzycki formula for estimated 1RM
                const estimated1RM = validSets.reduce((max, set) => {
                    const e1rm = set.weight / (1.0278 - (0.0278 * set.reps));
                    return Math.max(max, e1rm);
                }, 0);

                return {
                    date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    fullDate: new Date(session.date).toLocaleDateString(),
                    maxWeight,
                    totalVolume,
                    estimated1RM: Math.round(estimated1RM * 10) / 10
                };
            })
            .filter(Boolean) as { date: string, fullDate: string, maxWeight: number, totalVolume: number, estimated1RM: number }[];
    }, [workoutHistory, selectedExercise]);

    const personalBests = useMemo(() => {
        if (chartData.length === 0) return { weight: 0, volume: 0, e1rm: 0 };
        return {
            weight: Math.max(...chartData.map(d => d.maxWeight)),
            volume: Math.max(...chartData.map(d => d.totalVolume)),
            e1rm: Math.max(...chartData.map(d => d.estimated1RM))
        };
    }, [chartData]);

    const sessionsByMonth = useMemo(() => {
        const counts: Record<string, number> = {};
        workoutHistory.forEach(s => {
            const month = new Date(s.date).toLocaleString(undefined, { month: 'short' });
            counts[month] = (counts[month] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [workoutHistory]);

    return (
        <div className="w-full max-w-6xl space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('client.progress.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('client.progress.subtitle')}</p>
                </div>
                
                {uniqueExercises.length > 0 && (
                    <div className="w-full md:w-auto bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-black/5">
                        <select
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="w-full md:w-64 bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer"
                        >
                            {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {workoutHistory.length > 0 ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl"><TrophyIcon className="w-6 h-6"/></div>
                                <span className="text-[10px] font-black uppercase text-gray-400">{t('client.progress.maxWeight')}</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{personalBests.weight} <span className="text-sm text-gray-400">{t('general.kg')}</span></p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><FireIcon className="w-6 h-6"/></div>
                                <span className="text-[10px] font-black uppercase text-gray-400">{t('client.progress.maxVolume')}</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{personalBests.volume.toLocaleString()} <span className="text-sm text-gray-400">{t('general.kg')}</span></p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><ChartBarIcon className="w-6 h-6"/></div>
                                <span className="text-[10px] font-black uppercase text-gray-400">{t('client.progress.est1rm')}</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{personalBests.e1rm} <span className="text-sm text-gray-400">{t('general.kg')}</span></p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl"><CalendarDaysIcon className="w-6 h-6"/></div>
                                <span className="text-[10px] font-black uppercase text-gray-400">{t('client.progress.totalSessions')}</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{workoutHistory.length}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Progress Chart */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-black/5">
                                <h3 className="text-xl font-black mb-8 text-gray-900 dark:text-white flex items-center gap-2">
                                    <ChartBarIcon className="w-6 h-6 text-primary" /> {t('client.progress.strengthTrend')}
                                </h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                            <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="maxWeight" name={t('client.progress.maxWeight')} stroke="hsl(var(--primary))" fill="url(#colorMax)" strokeWidth={4} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} />
                                            <Area type="monotone" dataKey="estimated1RM" name={t('client.progress.est1rm')} stroke="#a855f7" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-black/5">
                                <h3 className="text-xl font-black mb-8 text-gray-900 dark:text-white flex items-center gap-2">
                                    <FireIcon className="w-6 h-6 text-emerald-500" /> {t('client.progress.trainingVolume')}
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                            <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="step" dataKey="totalVolume" name={t('client.progress.maxVolume')} stroke="#10b981" strokeWidth={3} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Consistency & History */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">{t('client.progress.monthlyConsistency')}</h3>
                                <div className="h-[180px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={sessionsByMonth}>
                                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} barSize={20} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[9px] font-bold" />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col max-h-[600px]">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">{t('client.progress.recentHistory')}</h3>
                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                    {[...workoutHistory].reverse().map(session => (
                                        <div key={session.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-black/[0.02] dark:border-white/[0.02]">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-xs font-black uppercase text-primary">#{t(`days.${session.day}`)}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{new Date(session.date).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{session.loggedExercises.length} {t('client.progress.exercisesLogged')}</p>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {session.loggedExercises.slice(0, 3).map((ex, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded-md text-[8px] font-black text-gray-500 uppercase">{ex.name.split(' ')[0]}</span>
                                                ))}
                                                {session.loggedExercises.length > 3 && <span className="text-[8px] font-black text-gray-300">+{session.loggedExercises.length - 3}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-4xl border-2 border-dashed border-black/5 opacity-50">
                    <ChartBarIcon className="w-20 h-20 text-gray-300 mb-4" />
                    <h3 className="text-2xl font-black text-gray-400">{t('client.progress.noData')}</h3>
                    <p className="text-gray-400 mt-2 max-w-sm">{t('client.progress.noDataDesc')}</p>
                </div>
            )}
        </div>
    );
};

export default ProgressView;
