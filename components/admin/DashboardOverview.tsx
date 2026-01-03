
import React, { useMemo, useContext, useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { Role, MembershipStatus, User, PaymentStatus } from '../../types';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { GoogleGenAI } from '@google/genai';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { useTranslation } from 'react-i18next';

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, colorClass = "from-blue-500 to-indigo-500", onClick }) => (
  <div onClick={onClick} className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl border border-black/5 dark:border-white/10">
      <div className="p-6 flex flex-col justify-between h-full relative z-10">
        <div className="flex justify-between items-start">
             <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
                {icon}
            </div>
            {trend && (
                <div className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-[10px] font-bold text-green-700 dark:text-green-400">
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-4">
             <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{title}</p>
        </div>
      </div>
  </div>
);

const DashboardOverview: React.FC<{ onNavigate: any, onUserClick: any }> = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { users, payments, expenses } = useContext(AuthContext);
    const [aiSummary, setAiSummary] = useState('');
    const [loadingAi, setLoadingAi] = useState(true);

    const stats = useMemo(() => {
        const clients = users.filter(u => u.role === Role.CLIENT);
        const active = clients.filter(u => u.membership.status === MembershipStatus.ACTIVE).length;
        const pending = clients.filter(u => u.membership.status === MembershipStatus.PENDING).length;
        const trainers = users.filter(u => u.role === Role.TRAINER).length;
        const income = payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((acc, p) => acc + p.amount, 0);
        return { total: clients.length, active, pending, trainers, income };
    }, [users, payments]);

    useEffect(() => {
        const fetchAiSummary = async () => {
            if (!process.env.API_KEY) return;
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Analiza estas métricas de un gimnasio y genera un resumen ejecutivo de 1 párrafo alentador: Miembros: ${stats.total}, Activos: ${stats.active}, Pendientes: ${stats.pending}, Ingresos Totales: ${stats.income}. Idioma: ${i18n.language}`;
                const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                setAiSummary(res.text || '');
            } catch (e) {
                setAiSummary(t('app.aiCoachError'));
            } finally {
                setLoadingAi(false);
            }
        };
        fetchAiSummary();
    }, [stats, i18n.language, t]);

    return (
         <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative rounded-3xl overflow-hidden p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl">
                    <SparklesAiIcon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2 flex items-center gap-2">
                        <SparklesAiIcon className="w-4 h-4" /> AI Insights
                    </h3>
                    {loadingAi ? <div className="h-20 animate-pulse bg-white/10 rounded-lg"></div> : <p className="text-lg font-medium leading-relaxed">{aiSummary}</p>}
                </div>
                <StatCard title={t('admin.dashboard.totalMembers')} value={stats.total} icon={<UserGroupIcon className="w-6 h-6"/>} trend="+4%" colorClass="from-blue-500 to-cyan-400" />
                <StatCard title={t('admin.dashboard.active')} value={stats.active} icon={<CheckCircleIcon className="w-6 h-6"/>} colorClass="from-emerald-500 to-green-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{t('admin.dashboard.growthTrends')}</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{name: 'Ene', v: 40}, {name: 'Feb', v: 45}, {name: 'Mar', v: 55}, {name: 'Abr', v: 60}, {name: 'May', v: 80}]}>
                                <defs>
                                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                                <Tooltip />
                                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#colorV)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <StatCard title={t('admin.dashboard.pending')} value={stats.pending} icon={<ClockIcon className="w-6 h-6"/>} colorClass="from-amber-500 to-orange-400" />
                    <StatCard title={t('admin.dashboard.finances')} value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.income)} icon={<CurrencyDollarIcon className="w-6 h-6"/>} colorClass="from-purple-500 to-pink-500" />
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
