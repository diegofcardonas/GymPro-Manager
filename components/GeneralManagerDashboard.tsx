
import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Role, MembershipStatus, PaymentStatus } from '../types';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './icons/LogoIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import NotificationBell from './NotificationBell';
import NotificationsView from './NotificationsView';
import LanguageSwitcher from './LanguageSwitcher';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_TIERS } from '../data/membershipTiers';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import Footer from './Footer';

type View = 'overview' | 'staff' | 'financials' | 'notifications';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string }> = ({ title, value, icon, trend }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && <p className="text-xs text-green-500 font-medium">{trend}</p>}
        </div>
    </div>
);

const GeneralManagerDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, logout, users, payments, toggleReportModal } = useContext(AuthContext);
    const [activeView, setActiveView] = useState<View>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const stats = useMemo(() => {
        const activeMembers = users.filter(u => u.role === Role.CLIENT && u.membership.status === MembershipStatus.ACTIVE).length;
        const totalRevenue = payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const monthlyRevenue = payments
            .filter(p => p.status === PaymentStatus.COMPLETED && new Date(p.date).getMonth() === new Date().getMonth())
            .reduce((acc, curr) => acc + curr.amount, 0);
        const mrr = users
            .filter(u => u.role === Role.CLIENT && u.membership.status === MembershipStatus.ACTIVE)
            .reduce((acc, u) => acc + (MOCK_TIERS.find(t => t.id === u.membership.tierId)?.price || 0), 0);

        return { activeMembers, totalRevenue, monthlyRevenue, mrr };
    }, [users, payments]);

    const staffMembers = useMemo(() => {
        return users.filter(u => u.role !== Role.CLIENT);
    }, [users]);

    const revenueData = useMemo(() => {
         const monthRevenue: { [key: string]: number } = {};
        payments
            .filter(p => p.status === PaymentStatus.COMPLETED)
            .forEach(p => {
                const date = new Date(p.date);
                const month = date.toLocaleString('es-CO', { month: 'short' });
                if (!monthRevenue[month]) monthRevenue[month] = 0;
                monthRevenue[month] += p.amount;
            });
        return Object.entries(monthRevenue).map(([name, value]) => ({ name, value }));
    }, [payments]);

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('manager.revenue')} value={formatCOP(stats.totalRevenue)} icon={<CurrencyDollarIcon className="w-6 h-6"/>} />
                            <StatCard title={t('manager.mrr')} value={formatCOP(stats.mrr)} icon={<ChartBarIcon className="w-6 h-6"/>} trend="+5% vs último mes" />
                            <StatCard title={t('manager.activeMembers')} value={stats.activeMembers} icon={<UserGroupIcon className="w-6 h-6"/>} />
                             <StatCard title={t('manager.staffCount')} value={staffMembers.length} icon={<UserGroupIcon className="w-6 h-6"/>} />
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">{t('manager.revenueTrend')}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                                    <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" />
                                    <YAxis tick={{ fill: 'currentColor' }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="text-xs text-gray-500 dark:text-gray-400" />
                                    <Tooltip formatter={(value: number) => formatCOP(value)} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px' }} />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            case 'staff':
                return (
                     <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">{t('manager.staff')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staffMembers.map(staff => (
                                <div key={staff.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <img src={staff.avatarUrl} alt={staff.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{staff.name}</p>
                                        <p className="text-sm text-primary capitalize">{staff.role.toLowerCase().replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-gray-500">{staff.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'financials':
                return (
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">{t('manager.financials')}</h2>
                        <p className="text-gray-500">{t('manager.financialsPlaceholder')}</p>
                    </div>
                );
             case 'notifications':
                return <NotificationsView />;
            default:
                return null;
        }
    };
    
    const getViewTitle = (view: View) => {
        switch(view) {
            case 'overview': return t('manager.overview');
            case 'staff': return t('manager.staff');
            case 'financials': return t('manager.financials');
            case 'notifications': return t('admin.dashboard.notifications');
            default: return view;
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex text-gray-800 dark:text-gray-200">
            {/* Sidebar */}
             <div className={`w-64 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-r border-black/10 dark:border-white/10 p-4 flex flex-col fixed h-full z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
                <div className="flex items-center gap-2 mb-10 px-2 pt-2">
                    <LogoIcon className="w-10 h-10" />
                    <span className="text-xl font-bold text-primary">{t('manager.title')}</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <button onClick={() => setActiveView('overview')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === 'overview' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                        <ChartBarIcon className="w-6 h-6" />
                        <span>{t('manager.overview')}</span>
                    </button>
                    <button onClick={() => setActiveView('staff')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === 'staff' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                        <UserGroupIcon className="w-6 h-6" />
                        <span>{t('manager.staff')}</span>
                    </button>
                     <button onClick={() => setActiveView('financials')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === 'financials' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                        <CurrencyDollarIcon className="w-6 h-6" />
                        <span>{t('manager.financials')}</span>
                    </button>
                </nav>
                 <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                     <button onClick={toggleReportModal} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`}>
                        <ExclamationTriangleIcon className="w-6 h-6" />
                        <span>{t('app.reportProblem')}</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0">
                 <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm sticky top-0 z-20 p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold capitalize">{getViewTitle(activeView)}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <NotificationBell onViewAll={() => setActiveView('notifications')} onNotificationClick={() => {}} />
                        <div className="flex items-center space-x-2">
                            <img src={currentUser?.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                            <span className="hidden sm:inline font-medium">{currentUser?.name}</span>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <LogoutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                <main className="p-6 flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
                <Footer />
            </div>
             {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden" />}
        </div>
    );
};

export default GeneralManagerDashboard;
