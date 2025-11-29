
import React, { useMemo, useContext } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { Role, User } from '../../types';
import { useTranslation } from 'react-i18next';

export const Reports: React.FC = () => {
    const { t } = useTranslation();
    const { users } = useContext(AuthContext);

    const clients = useMemo(() => users.filter(u => u.role === Role.CLIENT), [users]);
    const trainers = useMemo(() => users.filter(u => u.role === Role.TRAINER), [users]);

    const trainerLoadData = useMemo(() => {
        return trainers.map(trainer => ({
            name: trainer.name,
            clients: clients.filter(client => client.trainerIds?.includes(trainer.id)).length
        }));
    }, [clients, trainers]);

    const expirationForecastData = useMemo(() => {
        const months: { [key: string]: number } = {};
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            months[monthName] = 0;
        }

        clients.forEach(client => {
            const endDate = new Date(client.membership.endDate);
            if (endDate >= now && endDate < new Date(now.getFullYear(), now.getMonth() + 6, 1)) {
                const monthName = endDate.toLocaleString('default', { month: 'short' });
                if (months[monthName] !== undefined) {
                    months[monthName]++;
                }
            }
        });

        return Object.entries(months).map(([name, count]) => ({ name, expiring: count }));
    }, [clients]);

    const genderData = useMemo(() => {
        const counts = clients.reduce((acc, client) => {
            const gender = client.gender || t('admin.reports.notSet');
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [clients, t]);

    const fitnessLevelData = useMemo(() => {
         const counts = clients.reduce((acc, client) => {
            const level = client.fitnessLevel || t('admin.reports.notSet');
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [clients, t]);

    const GENDER_COLORS = ['#38bdf8', '#f472b6', '#a78bfa', '#a8a29e']; // blue, pink, purple, gray
    const LEVEL_COLORS = ['#facc15', '#fb923c', '#22c55e', '#a8a29e']; // yellow, orange, green, gray

    return (
        <div className="w-full space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.reports.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('admin.reports.trainerLoad')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={trainerLoadData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" />
                            <YAxis tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" allowDecimals={false} />
                            <Tooltip cursor={{fill: 'rgba(100,100,100,0.1)'}} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px' }} />
                            <Legend />
                            <Bar dataKey="clients" name={t('admin.reports.clients')} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('admin.reports.expirationForecast')}</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={expirationForecastData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" />
                            <YAxis tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px' }} />
                            <Legend />
                            <Line type="monotone" dataKey="expiring" stroke="#f43f5e" name={t('admin.reports.expiringMemberships')} strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('admin.reports.demographicsGender')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('admin.reports.demographicsLevel')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={fitnessLevelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {fitnessLevelData.map((entry, index) => <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
