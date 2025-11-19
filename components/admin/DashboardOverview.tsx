
import React, { useMemo, useContext, useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { Role, MembershipStatus, User } from '../../types';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { DashboardFilter } from '../AdminDashboard';
import { PlusIcon } from '../icons/PlusIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { CogIcon } from '../icons/CogIcon';
import { GoogleGenAI } from '@google/genai';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';

type View = 'dashboard' | 'users' | 'reports' | 'app-settings' | 'settings';

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
  className?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, colorClass = "from-blue-500 to-indigo-500", className = "", onClick }) => (
  <div onClick={onClick} className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-xl ${className}`}>
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl z-0"></div>
      {/* Gradient Border Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0`}></div>
      
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
             <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                {icon}
            </div>
            {trend && (
                <div className="px-2 py-1 rounded-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-4">
             <h3 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">{value}</h3>
             <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{title}</p>
        </div>
      </div>
  </div>
);

const ExecutiveSummaryCard: React.FC<{ stats: any }> = ({ stats }) => {
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateSummary = async () => {
            try {
                // Simulate slight delay for realism or debounce
                setLoading(true);
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const model = ai.models.getGenerativeModel({ model: 'gemini-2.5-flash' });
                
                const prompt = `
                    Act as a business analyst for a gym. Generate a concise, professional, 2-sentence executive summary based on these stats:
                    - Total Clients: ${stats.totalClients}
                    - Active Members: ${stats.active}
                    - Expired Members: ${stats.expired} (Action needed)
                    - Pending Signups: ${stats.pending}
                    - Active Trainers: ${stats.totalTrainers}
                    
                    Focus on growth and areas needing attention (like expirations). Use an encouraging tone.
                `;

                const result = await model.generateContent(prompt);
                setSummary(result.response.text());
            } catch (error) {
                setSummary("Unable to generate AI summary at this time. Please check metrics manually.");
            } finally {
                setLoading(false);
            }
        };

        generateSummary();
    }, [stats.totalClients, stats.active, stats.expired, stats.pending]);

    return (
        <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 shadow-xl col-span-1 md:col-span-2">
            <div className="h-full bg-white dark:bg-gray-900 rounded-[20px] p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <SparklesAiIcon className="w-32 h-32 text-purple-500" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <SparklesAiIcon className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500 uppercase tracking-wider text-sm">AI Executive Summary</h3>
                </div>
                {loading ? (
                     <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ) : (
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        {summary}
                    </p>
                )}
            </div>
        </div>
    )
}

interface DashboardOverviewProps {
    onNavigate: (view: View, filter?: DashboardFilter) => void;
    onUserClick: (user: User) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onUserClick }) => {
    const { users } = useContext(AuthContext);

    const clients = useMemo(() => users.filter(u => u.role === Role.CLIENT), [users]);
    const trainers = useMemo(() => users.filter(u => u.role === Role.TRAINER), [users]);

    const stats = useMemo(() => {
        const active = clients.filter(u => u.membership.status === MembershipStatus.ACTIVE).length;
        const expired = clients.filter(u => u.membership.status === MembershipStatus.EXPIRED).length;
        const pending = clients.filter(u => u.membership.status === MembershipStatus.PENDING).length;
        const unassigned = clients.filter(u => !u.trainerIds || u.trainerIds.length === 0).length;
        return { totalClients: clients.length, active, expired, pending, totalTrainers: trainers.length, unassigned };
    }, [clients, trainers]);

    const memberGrowthData = useMemo(() => {
         // Mock data logic similar to before, but memoized
         return [
            { name: 'Jan', count: 65 }, { name: 'Feb', count: 78 },
            { name: 'Mar', count: 90 }, { name: 'Apr', count: 81 },
            { name: 'May', count: 95 }, { name: 'Jun', count: 112 },
         ];
    }, []);

    return (
         <div className="w-full max-w-7xl mx-auto p-2">
             
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                
                {/* Row 1: AI Summary (Spans 2 cols on md+) & Top Stats */}
                <ExecutiveSummaryCard stats={stats} />

                <StatCard 
                    title="Total Members" 
                    value={stats.totalClients} 
                    icon={<UserGroupIcon className="w-6 h-6" />} 
                    trend="+12%"
                    colorClass="from-blue-500 to-cyan-400"
                    onClick={() => onNavigate('users', { type: 'role', value: Role.CLIENT })}
                />
                
                <StatCard 
                    title="Active" 
                    value={stats.active} 
                    icon={<CheckCircleIcon className="w-6 h-6" />} 
                    colorClass="from-emerald-500 to-green-400"
                    onClick={() => onNavigate('users', { type: 'status', value: MembershipStatus.ACTIVE })}
                />

                 {/* Row 2: Main Chart (Spans 2 cols on md, 2 cols 2 rows on lg) & More Stats */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Growth Trends</h3>
                        <select className="bg-transparent text-sm font-medium text-gray-500 dark:text-gray-400 border-none focus:ring-0 cursor-pointer hover:text-primary">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="flex-grow min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={memberGrowthData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} className="text-xs font-medium text-gray-400" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: 'white' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={4} 
                                    dot={{r: 0}} 
                                    activeDot={{r: 6, strokeWidth: 0}} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <StatCard 
                    title="Trainers" 
                    value={stats.totalTrainers} 
                    icon={<UserGroupIcon className="w-6 h-6" />} 
                    colorClass="from-purple-500 to-pink-400"
                    onClick={() => onNavigate('users', { type: 'role', value: Role.TRAINER })}
                />

                <StatCard 
                    title="Pending" 
                    value={stats.pending} 
                    icon={<ClockIcon className="w-6 h-6" />} 
                    colorClass="from-amber-500 to-orange-400"
                    onClick={() => onNavigate('users', { type: 'status', value: MembershipStatus.PENDING })}
                />

                 {/* Quick Actions - Spans 2 cols on md+ */}
                 <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-8 rounded-3xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
                     
                     <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
                        <p className="text-gray-400 text-sm mb-6">Manage your gym efficiently.</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => onNavigate('users')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 backdrop-blur-sm border border-white/5">
                                <div className="p-2 bg-blue-500/80 rounded-lg"><PlusIcon className="w-5 h-5 text-white"/></div>
                                <span className="font-medium">Add Member</span>
                            </button>
                             <button onClick={() => onNavigate('reports')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 backdrop-blur-sm border border-white/5">
                                <div className="p-2 bg-purple-500/80 rounded-lg"><ChartBarIcon className="w-5 h-5 text-white"/></div>
                                <span className="font-medium">Analytics</span>
                            </button>
                        </div>
                     </div>
                 </div>

            </div>
        </div>
    );
};

export default DashboardOverview;
