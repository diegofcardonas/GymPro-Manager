
import React, { useMemo, useContext } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { Role, User } from '../../types';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon } from '../icons/ChartBarIcon';

export const Reports: React.FC = () => {
    const { t } = useTranslation();
    const { users } = useContext(AuthContext);

    const clients = useMemo(() => users.filter(u => u.role === Role.CLIENT), [users]);
    const trainers = useMemo(() => users.filter(u => u.role === Role.TRAINER), [users]);

    const trainerLoadData = useMemo(() => {
        return trainers.map(trainer => ({
            name: trainer.name.split(' ')[0],
            clients: clients.filter(client => client.trainerIds?.includes(trainer.id)).length
        }));
    }, [clients, trainers]);

    const genderData = useMemo(() => {
        const counts = clients.reduce((acc, client) => {
            const gender = client.gender || t('admin.reports.notSet');
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [clients, t]);

    const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#94a3b8'];

    return (
        <div className="w-full space-y-10 animate-fade-in pb-20">
            <div className="border-b border-black/5 pb-6">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Análisis Avanzado</h2>
                <p className="text-gray-500 font-medium">Métricas de operación y demografía en tiempo real.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReportCard title="Carga de Trabajo: Entrenadores" subtitle="Número de clientes asignados por coach profesional">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={trainerLoadData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                            <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" allowDecimals={false} />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="clients" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>

                <ReportCard title="Segmentación por Género" subtitle="Distribución demográfica de la base de usuarios">
                    <div className="flex flex-col md:flex-row items-center">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5}>
                                    {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-4 px-10 w-full md:w-auto">
                            {genderData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }}></div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.name}</span>
                                    </div>
                                    <span className="text-lg font-black text-gray-800 dark:text-white italic">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ReportCard>
            </div>
        </div>
    );
};

const ReportCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="bg-white dark:bg-gray-800/50 rounded-4xl p-8 border border-black/5 dark:border-white/10 shadow-sm group hover:shadow-2xl transition-all duration-500">
        <div className="mb-10">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{title}</h3>
            <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">{subtitle}</p>
        </div>
        {children}
    </div>
);
