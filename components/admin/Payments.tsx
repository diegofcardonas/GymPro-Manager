
import React, { useState, useMemo, useContext } from 'react';
import { Payment, PaymentStatus, User, MembershipTier, Role } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { MOCK_TIERS } from '../../data/membershipTiers';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from '../icons/ArrowTrendingDownIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps, ComposedChart, Line, Area } from 'recharts';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 10;

type SortKey = 'user.name' | 'amount' | 'date' | 'status' | 'category';
type DateRange = 'month' | 'quarter' | 'year';
type FinanceTab = 'income' | 'expenses';

interface EnrichedPayment extends Payment {
    user: User | { name: string; email?: string };
    tier: MembershipTier | { name: string, color?: string };
}

// Mock Expenses Data
const MOCK_EXPENSES = [
    { id: 'e1', category: 'Rent', amount: 5000000, date: new Date(new Date().setDate(1)).toISOString() },
    { id: 'e2', category: 'Salaries', amount: 12000000, date: new Date(new Date().setDate(5)).toISOString() },
    { id: 'e3', category: 'Utilities', amount: 1500000, date: new Date(new Date().setDate(10)).toISOString() },
    { id: 'e4', category: 'Equipment', amount: 3500000, date: new Date(new Date().setDate(15)).toISOString() },
    { id: 'e5', category: 'Marketing', amount: 800000, date: new Date(new Date().setDate(20)).toISOString() },
    { id: 'e6', category: 'Maintenance', amount: 600000, date: new Date(new Date().setDate(25)).toISOString() },
    // Previous month mock data
    { id: 'e7', category: 'Rent', amount: 5000000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString() },
    { id: 'e8', category: 'Salaries', amount: 12000000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString() },
];

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    trend?: number; 
    isExpense?: boolean;
    colorClass?: string;
}> = ({ title, value, icon, trend, isExpense, colorClass = "bg-white dark:bg-gray-800" }) => (
    <div className={`${colorClass} p-6 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm">{icon}</div>
            {trend !== undefined && (
                <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (isExpense ? trend < 0 : trend > 0) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {(isExpense ? trend < 0 : trend > 0) ? <ArrowTrendingUpIcon className="w-3 h-3 mr-1" /> : <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <p className="text-sm font-medium opacity-70">{title}</p>
        <p className="text-3xl font-bold mt-1 tracking-tight">{formatCOP(value)}</p>
    </div>
);

const Payments: React.FC = () => {
    const { t } = useTranslation();
    const { payments, users } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [activeTab, setActiveTab] = useState<FinanceTab>('income');

    // Filter Logic
    const getDateRangeFilter = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateRange === 'month') return diffDays <= 30;
        if (dateRange === 'quarter') return diffDays <= 90;
        if (dateRange === 'year') return date.getFullYear() === now.getFullYear();
        return true;
    };

    const enrichedPayments = useMemo(() => {
        return payments
            .filter(p => getDateRangeFilter(p.date))
            .map(payment => {
                const user = users.find(u => u.id === payment.userId);
                const tier = MOCK_TIERS.find(t => t.id === payment.tierId);
                return {
                    ...payment,
                    user: user || { name: 'Usuario Desconocido', email: 'N/A' },
                    tier: tier || { name: 'Venta POS', color: '#cbd5e1' }
                };
            });
    }, [payments, users, dateRange]);

    const filteredExpenses = useMemo(() => {
        return MOCK_EXPENSES.filter(e => getDateRangeFilter(e.date));
    }, [dateRange]);

    // KPIs Calculation
    const kpis = useMemo(() => {
        const income = enrichedPayments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const expenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        const outstanding = enrichedPayments.filter(p => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.FAILED).reduce((acc, curr) => acc + curr.amount, 0);
        const netProfit = income - expenses;

        // Mock Trends (Randomized for demo effect, usually would compare vs prev period)
        return {
            income,
            expenses,
            netProfit,
            outstanding,
            incomeTrend: 12,
            expenseTrend: -5,
            profitTrend: 8
        };
    }, [enrichedPayments, filteredExpenses]);

    // Charts Data
    const incomeVsExpenseData = useMemo(() => {
        // Group by day or month based on range
        const data: Record<string, { name: string, income: number, expense: number, profit: number }> = {};
        
        enrichedPayments.filter(p => p.status === PaymentStatus.COMPLETED).forEach(p => {
            const dateKey = new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
            if (!data[dateKey]) data[dateKey] = { name: dateKey, income: 0, expense: 0, profit: 0 };
            data[dateKey].income += p.amount;
            data[dateKey].profit += p.amount;
        });

        filteredExpenses.forEach(e => {
            const dateKey = new Date(e.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
            if (!data[dateKey]) data[dateKey] = { name: dateKey, income: 0, expense: 0, profit: 0 };
            data[dateKey].expense += e.amount;
            data[dateKey].profit -= e.amount;
        });

        return Object.values(data).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Simplified sort
    }, [enrichedPayments, filteredExpenses]);

    const expenseBreakdownData = useMemo(() => {
        const breakdown: Record<string, number> = {};
        filteredExpenses.forEach(e => {
             breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
        });
        return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    }, [filteredExpenses]);

    const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1'];

    // Table Data
    const tableData = useMemo(() => {
        if (activeTab === 'income') {
            return enrichedPayments
                .filter(p => p.user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => {
                    if (!sortConfig) return 0;
                    const valA = sortConfig.key === 'user.name' ? (a.user as User).name : a[sortConfig.key as keyof Payment];
                    const valB = sortConfig.key === 'user.name' ? (b.user as User).name : b[sortConfig.key as keyof Payment];
                    
                    if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                });
        } else {
            return filteredExpenses
                .filter(e => e.category.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => {
                     if (!sortConfig) return 0;
                     const valA = a[sortConfig.key as keyof typeof a];
                     const valB = b[sortConfig.key as keyof typeof b];
                     if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                     if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                     return 0;
                });
        }
    }, [activeTab, enrichedPayments, filteredExpenses, searchTerm, sortConfig]);

    const paginatedData = tableData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-8">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.finances.title')}</h2>
                <div className="flex flex-wrap gap-3">
                     <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex">
                        {(['month', 'quarter', 'year'] as DateRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    dateRange === range 
                                    ? 'bg-primary text-primary-foreground shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {t(`admin.finances.ranges.${range}`)}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium shadow-sm">
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span>{t('admin.finances.exportReport')}</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={t('admin.finances.totalIncome')} 
                    value={kpis.income} 
                    icon={<ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />} 
                    trend={kpis.incomeTrend}
                    colorClass="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800"
                />
                <StatCard 
                    title={t('admin.finances.totalExpenses')} 
                    value={kpis.expenses} 
                    icon={<ArrowTrendingDownIcon className="w-6 h-6 text-rose-600" />} 
                    trend={kpis.expenseTrend}
                    isExpense
                    colorClass="bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100 border border-rose-100 dark:border-rose-800"
                />
                <StatCard 
                    title={t('admin.finances.netProfit')} 
                    value={kpis.netProfit} 
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-indigo-600" />} 
                    trend={kpis.profitTrend}
                    colorClass="bg-indigo-50 text-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-100 border border-indigo-100 dark:border-indigo-800"
                />
                <StatCard 
                    title={t('admin.finances.outstanding')} 
                    value={kpis.outstanding} 
                    icon={<XCircleIcon className="w-6 h-6 text-amber-600" />} 
                    colorClass="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100 border border-amber-100 dark:border-amber-800"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.finances.incomeVsExpense')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={incomeVsExpenseData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'currentColor' }} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} className="text-xs text-gray-500 dark:text-gray-400" axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => formatCOP(value)}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="income" name={t('admin.finances.income')} fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="expense" name={t('admin.finances.expenses')} fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                            <Line type="monotone" dataKey="profit" name={t('admin.finances.netProfit')} stroke="#6366f1" strokeWidth={3} dot={{r: 4}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.finances.expenseBreakdown')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={expenseBreakdownData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {expenseBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCOP(value)} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <button 
                            onClick={() => { setActiveTab('income'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {t('admin.finances.income')}
                        </button>
                        <button 
                            onClick={() => { setActiveTab('expenses'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {t('admin.finances.expenses')}
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder={t('admin.userManagement.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 cursor-pointer hover:text-primary" onClick={() => requestSort(activeTab === 'income' ? 'user.name' : 'category')}>
                                    <div className="flex items-center gap-1">
                                        {activeTab === 'income' ? t('admin.finances.client') : t('admin.finances.category')}
                                        {sortConfig?.key === (activeTab === 'income' ? 'user.name' : 'category') && (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3"/>)}
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-primary" onClick={() => requestSort('amount')}>
                                     <div className="flex items-center gap-1">
                                        {t('admin.finances.amount')}
                                        {sortConfig?.key === 'amount' && (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3"/>)}
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-primary" onClick={() => requestSort('date')}>
                                     <div className="flex items-center gap-1">
                                        {t('admin.finances.date')}
                                        {sortConfig?.key === 'date' && (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3"/>)}
                                    </div>
                                </th>
                                {activeTab === 'income' && <th className="p-4">{t('admin.finances.status')}</th>}
                                {activeTab === 'income' && <th className="p-4">{t('admin.finances.concept')}</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {paginatedData.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                                        {activeTab === 'income' ? item.user.name : t(`admin.finances.categories.${item.category}`, {defaultValue: item.category})}
                                    </td>
                                    <td className={`p-4 font-bold ${activeTab === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {activeTab === 'expenses' && '- '}{formatCOP(item.amount)}
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    {activeTab === 'income' && (
                                        <td className="p-4">
                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                item.status === PaymentStatus.COMPLETED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                item.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    )}
                                    {activeTab === 'income' && (
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300" style={{ backgroundColor: item.tier?.color ? `${item.tier.color}20` : undefined, color: item.tier?.color }}>
                                                {item.tier?.name}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                             {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                 <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('admin.userManagement.page', { current: currentPage, total: totalPages || 1 })}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700">{t('admin.userManagement.previous')}</button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700">{t('admin.userManagement.next')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
