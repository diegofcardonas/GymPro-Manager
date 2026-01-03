
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
import { ChartBarIcon } from '../icons/ChartBarIcon';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; colorClass?: string; trend?: string }> = ({ title, value, icon, colorClass = "from-blue-500 to-indigo-500", trend }) => (
  <div className="relative rounded-4xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-black/5 dark:border-white/10 p-6 md:p-8 transition-all hover:shadow-2xl group animate-fade-in">
      <div className="flex justify-between items-start">
        <div className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500`}>{icon}</div>
        {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <div className="mt-6">
           <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">{value}</h3>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{title}</p>
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
                const prompt = `Analiza estas métricas: Miembros: ${stats.total}, Activos: ${stats.active}, En Riesgo: ${stats.atRisk.length}. Genera un consejo estratégico corto y profesional para el dueño del gym en ${i18n.language}.`;
                const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                setAiSummary(res.text || '');
            } catch (e) { setAiSummary("Optimizando visión estratégica..."); }
            finally { setLoadingAi(false); }
        };
        fetchAiSummary();
    }, [stats, i18n.language]);

    const aforoPercent = Math.min(100, (stats.currentAforo / stats.capacity) * 100);

    return (
         <div className="w-full space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Control de Mando</h2>
                    <p className="text-sm text-gray-500 font-medium">Resumen ejecutivo del ecosistema GymPro.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative rounded-4xl overflow-hidden p-6 md:p-8 bg-gray-900 dark:bg-black text-white shadow-2xl group border border-white/5">
                    <SparklesAiIcon className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">AI STRATEGIC INSIGHT</h3>
                        </div>
                        {loadingAi ? (
                            <div className="space-y-3">
                                <div className="h-3 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                                <div className="h-3 bg-white/10 rounded-full w-1/2 animate-pulse"></div>
                            </div>
                        ) : (
                            <p className="text-lg md:text-xl font-bold leading-snug tracking-tight italic">"{aiSummary}"</p>
                        )}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-4xl border border-black/5 dark:border-white/10 flex flex-col justify-between shadow-sm group hover:shadow-xl transition-all">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacidad en Vivo</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-900 dark:text-white tracking-tighter italic">{stats.currentAforo} <span className="text-sm text-gray-300 font-medium not-italic">/ {stats.capacity}</span></h3>
                    </div>
                    <div className="mt-6 w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden p-0.5 border border-black/5">
                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${aforoPercent > 80 ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${aforoPercent}%` }}></div>
                    </div>
                </div>

                <StatCard title="Revenue Total" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.totalIncome)} icon={<CurrencyDollarIcon className="w-7 h-7"/>} colorClass="from-emerald-600 to-teal-500" trend="+12.5%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 md:p-10 rounded-4xl border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Crecimiento de Membresías</h3>
                        <div className="flex gap-2">
                             <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Año 2025</span>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{n: 'Ene', v: 40}, {n: 'Feb', v: 45}, {n: 'Mar', v: 55}, {n: 'Abr', v: 60}, {n: 'May', v: 80}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs><linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="n" axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '1rem', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#colorV)" strokeWidth={4} dot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-rose-500 rounded-4xl p-1 shadow-2xl">
                    <div className="bg-white dark:bg-gray-900 rounded-[calc(2rem-2px)] p-6 md:p-8 h-full flex flex-col">
                        <h3 className="text-lg font-black text-rose-500 flex items-center gap-3 mb-8 uppercase tracking-tighter italic">
                            <ExclamationTriangleIcon className="w-5 h-5" /> Riesgo de Churn
                        </h3>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {stats.atRisk.map(user => (
                                <div key={user.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl flex items-center gap-4 border border-black/[0.03] group hover:scale-[1.02] transition-transform">
                                    <img src={user.avatarUrl} className="w-10 h-10 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs truncate text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-[9px] text-rose-500 uppercase font-black tracking-widest mt-1">Inactivo: 8 días</p>
                                    </div>
                                    <button className="p-2.5 bg-white dark:bg-gray-700 text-primary rounded-xl shadow-sm hover:bg-primary hover:text-white transition-all">
                                        <SparklesAiIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {stats.atRisk.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-10">
                                    <CheckCircleIcon className="w-12 h-12 mb-4 text-emerald-500" />
                                    <p className="font-black uppercase tracking-widest text-[10px]">Máxima Fidelidad</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
