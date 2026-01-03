
import React, { useMemo, useContext, useState, useEffect } from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { Role, MembershipStatus, User } from '../../types';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { GoogleGenAI } from '@google/genai';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { useTranslation } from 'react-i18next';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; colorClass?: string }> = ({ title, value, icon, colorClass = "from-blue-500 to-indigo-500" }) => (
  <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-black/5 dark:border-white/10 p-6 transition-all hover:shadow-md group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg transition-transform group-hover:scale-110 duration-300`}>{icon}</div>
      </div>
      <div className="mt-4">
           <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{title}</p>
      </div>
  </div>
);

const DashboardOverview: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { users, payments } = useContext(AuthContext);
    const [aiSummary, setAiSummary] = useState('');
    const [loadingAi, setLoadingAi] = useState(true);

    const stats = useMemo(() => {
        const clients = users.filter(u => u.role === Role.CLIENT);
        const active = clients.filter(u => u.membership.status === MembershipStatus.ACTIVE).length;
        const totalIncome = payments.reduce((acc, p) => acc + p.amount, 0);
        const today = new Date().toISOString().split('T')[0];
        const currentAforo = clients.filter(u => u.workoutHistory?.some(w => w.date.startsWith(today))).length;
        const capacity = 50; 
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const atRisk = clients.filter(u => {
            if(!u.workoutHistory || u.workoutHistory.length === 0) return false;
            const lastWorkout = new Date(u.workoutHistory.sort((a,b) => b.date.localeCompare(a.date))[0].date);
            return lastWorkout < sevenDaysAgo && u.membership.status === MembershipStatus.ACTIVE;
        });

        return { total: clients.length, active, totalIncome, currentAforo, capacity, atRisk };
    }, [users, payments]);

    useEffect(() => {
        const fetchAiSummary = async () => {
            if (!process.env.API_KEY) return;
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Analiza estas métricas: Miembros: ${stats.total}, Activos: ${stats.active}, En Riesgo: ${stats.atRisk.length}. Genera un consejo estratégico corto en ${i18n.language}.`;
                const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                setAiSummary(res.text || '');
            } catch (e) { setAiSummary("Optimizando visión estratégica..."); }
            finally { setLoadingAi(false); }
        };
        fetchAiSummary();
    }, [stats, i18n.language]);

    const aforoPercent = Math.min(100, (stats.currentAforo / stats.capacity) * 100);

    return (
         <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl group">
                    <SparklesAiIcon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
                        <SparklesAiIcon className="w-4 h-4" /> AI CRM Insight
                    </h3>
                    {loadingAi ? <div className="space-y-2"><div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div><div className="h-4 bg-white/20 rounded w-1/2 animate-pulse"></div></div> : <p className="text-xl font-bold leading-relaxed">{aiSummary}</p>}
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-black/5 dark:border-white/10 flex flex-col justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aforo Actual</p>
                        <h3 className="text-4xl font-black mt-2 text-gray-900 dark:text-white">{stats.currentAforo} <span className="text-lg text-gray-400 font-medium">/ {stats.capacity}</span></h3>
                    </div>
                    <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ease-out ${aforoPercent > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${aforoPercent}%` }}></div>
                    </div>
                </div>

                <StatCard title="Ingresos Totales" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.totalIncome)} icon={<CurrencyDollarIcon className="w-6 h-6"/>} colorClass="from-emerald-500 to-teal-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Crecimiento Mensual</h3>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{n: 'Ene', v: 40}, {n: 'Feb', v: 45}, {n: 'Mar', v: 55}, {n: 'Abr', v: 60}, {n: 'May', v: 80}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs><linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="n" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#colorV)" strokeWidth={4} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-red-50/50 dark:bg-red-950/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col">
                    <h3 className="text-lg font-black text-red-600 dark:text-red-400 flex items-center gap-2 mb-6 uppercase tracking-tight">
                        <ExclamationTriangleIcon className="w-5 h-5" /> Riesgo de Deserción
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {stats.atRisk.map(user => (
                            <div key={user.id} className="bg-white dark:bg-gray-800 p-3 rounded-2xl flex items-center gap-3 shadow-sm border border-black/5">
                                <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{user.name}</p>
                                    <p className="text-[9px] text-gray-400 uppercase font-black">Inactivo: 8 días</p>
                                </div>
                                <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all">
                                    <SparklesAiIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {stats.atRisk.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                <CheckCircleIcon className="w-12 h-12 mb-2" />
                                <p className="text-center font-bold text-sm">Todo bajo control</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
