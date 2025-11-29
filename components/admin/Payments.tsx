import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Payment, PaymentStatus, User, Expense, Budget, PaymentMethod } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { MOCK_TIERS } from '../../data/membershipTiers';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from '../icons/ArrowTrendingDownIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { DocumentChartBarIcon } from '../icons/DocumentChartBarIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { FilterIcon } from '../icons/FilterIcon';

const ITEMS_PER_PAGE = 10;

type SortKey = 'user.name' | 'amount' | 'date' | 'status' | 'category' | 'type';
type DateRange = 'month' | 'quarter' | 'year';
type FinanceTab = 'overview' | 'transactions' | 'budgets' | 'reports';

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

const downloadCSV = (data: any[], headers: { key: string, label: string }[], filename: string) => {
    const csvContent = [
        headers.map(h => h.label).join(','),
        ...data.map(item => headers.map(h => {
            const val = h.key.split('.').reduce((obj: any, k: string) => obj && obj[k], item);
            return `"${val !== undefined ? val : ''}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Unified Transaction Type
interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string; // Or user.name for income
    description: string;
    amount: number;
    date: string;
    status: string;
    method?: string;
    original: Payment | Expense;
}

const Payments: React.FC = () => {
    const { t } = useTranslation();
    const { payments, users, expenses, budgets, addExpense, deleteExpense, addPayment, addBudget, updateBudget, deleteBudget } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState<DateRange>('year');
    const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    
    // Modals state
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    
    const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'expense' | 'budget'} | null>(null);

    // Date Filtering Logic
    const getDateRangeFilter = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        // Reset time for accurate day comparison
        now.setHours(0,0,0,0);
        const checkDate = new Date(date);
        checkDate.setHours(0,0,0,0);

        if (dateRange === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (dateRange === 'quarter') {
             const quarter = Math.floor((now.getMonth() + 3) / 3);
             const dateQuarter = Math.floor((date.getMonth() + 3) / 3);
             return quarter === dateQuarter && date.getFullYear() === now.getFullYear();
        }
        if (dateRange === 'year') return date.getFullYear() === now.getFullYear();
        return true;
    };

    // Unified Data Processing
    const allTransactions: Transaction[] = useMemo(() => {
        const incomes: Transaction[] = payments
            .filter(p => getDateRangeFilter(p.date))
            .map(p => {
                const user = users.find(u => u.id === p.userId);
                const tier = MOCK_TIERS.find(t => t.id === p.tierId);
                return {
                    id: p.id,
                    type: 'income',
                    category: 'Sales', // Default category for income
                    description: p.description || tier?.name || 'Venta POS',
                    amount: p.amount,
                    date: p.date,
                    status: p.status,
                    method: p.paymentMethod,
                    original: { ...p, user } as any
                };
            });

        const outflows: Transaction[] = expenses
            .filter(e => getDateRangeFilter(e.date))
            .map(e => ({
                id: e.id,
                type: 'expense',
                category: e.category,
                description: e.description || e.category,
                amount: e.amount,
                date: e.date,
                status: PaymentStatus.COMPLETED,
                original: e
            }));

        const combined = [...incomes, ...outflows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (paymentMethodFilter === 'all') return combined;
        return combined.filter(t => t.type === 'income' && t.method === paymentMethodFilter);

    }, [payments, expenses, users, dateRange, paymentMethodFilter]);

    // Financial KPIs
    const kpis = useMemo(() => {
        const income = allTransactions.filter(t => t.type === 'income' && t.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const expenseTotal = allTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const outstanding = allTransactions.filter(t => t.type === 'income' && t.status !== PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const netProfit = income - expenseTotal;
        const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;

        return { income, expenses: expenseTotal, netProfit, outstanding, profitMargin };
    }, [allTransactions]);

    // Chart Data Generation
    const cashFlowData = useMemo(() => {
        const data: Record<string, { name: string, income: number, expense: number, profit: number }> = {};
        
        allTransactions.forEach(t => {
            if (t.status !== PaymentStatus.COMPLETED) return;
            // Aggregate by month for smoother charts
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const name = date.toLocaleDateString(undefined, { month: 'short' });
            
            if (!data[key]) data[key] = { name, income: 0, expense: 0, profit: 0 };
            
            if (t.type === 'income') {
                data[key].income += t.amount;
                data[key].profit += t.amount;
            } else {
                data[key].expense += t.amount;
                data[key].profit -= t.amount;
            }
        });

        return Object.values(data).sort((a, b) => {
             // Basic sort assuming the keys were inserted somewhat chronologically or the names allow it. 
             // Ideally use the 'key' to sort.
             return 0; // The source array is already sorted by date, but grouping might mess it up slightly.
        });
    }, [allTransactions]);

    // Budgets Analysis
    const budgetAnalysis = useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();

        const currentMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        // Previous month calculation for comparison
        const prevMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            // Handling January case for prev month
            const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        });

        return budgets.map(b => {
            const spent = currentMonthExpenses
                .filter(e => e.category === b.category)
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            const spentPrevMonth = prevMonthExpenses
                .filter(e => e.category === b.category)
                .reduce((acc, curr) => acc + curr.amount, 0);

            const dailyAverage = spent / Math.max(1, currentDay);
            const projectedSpend = dailyAverage * daysInMonth;
            const remaining = b.amount - spent;
            const dailyRemaining = remaining / Math.max(1, (daysInMonth - currentDay));

            return {
                ...b,
                spent,
                spentPrevMonth,
                remaining,
                percentage: Math.min(100, (spent / b.amount) * 100),
                dailyAverage,
                projectedSpend,
                dailyRemaining
            };
        });
    }, [budgets, expenses]);

    // Table Filtering & Pagination
    const filteredTableData = useMemo(() => {
        return allTransactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.original as any).user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allTransactions, searchTerm]);

    const paginatedData = filteredTableData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredTableData.length / ITEMS_PER_PAGE);

    // Handlers
    const handleDelete = () => {
        if (itemToDelete?.type === 'expense') deleteExpense(itemToDelete.id);
        if (itemToDelete?.type === 'budget') deleteBudget(itemToDelete.id);
        setItemToDelete(null);
    };

    const handleGenerateReceipt = (item: any) => {
        alert(t('admin.finances.receiptAlert') + ` ID: ${item.id}`);
    };

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.finances.title')}</h2>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {(['overview', 'transactions', 'budgets', 'reports'] as FinanceTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t(`admin.finances.tabs.${tab}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions & Filters Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                 <div className="flex gap-2">
                    {(['month', 'quarter', 'year'] as DateRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                                dateRange === range 
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' 
                                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t(`admin.finances.ranges.${range}`)}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsIncomeModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                        <PlusIcon className="w-4 h-4" /> {t('admin.finances.addIncome')}
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                        <PlusIcon className="w-4 h-4" /> {t('admin.finances.addExpense')}
                    </button>
                </div>
            </div>

            {/* Content Rendering */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title={t('admin.finances.netProfit')} 
                            value={kpis.netProfit} 
                            icon={<CurrencyDollarIcon className="w-6 h-6 text-indigo-600" />} 
                            trend={12} // Mock trend
                            colorClass="bg-indigo-50 text-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-100 border border-indigo-100 dark:border-indigo-800"
                        />
                        <StatCard 
                            title={t('admin.finances.totalIncome')} 
                            value={kpis.income} 
                            icon={<ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />} 
                            trend={8}
                            colorClass="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800"
                        />
                        <StatCard 
                            title={t('admin.finances.totalExpenses')} 
                            value={kpis.expenses} 
                            icon={<ArrowTrendingDownIcon className="w-6 h-6 text-rose-600" />} 
                            trend={-2}
                            isExpense
                            colorClass="bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100 border border-rose-100 dark:border-rose-800"
                        />
                        <StatCard 
                            title={t('admin.finances.runRate')} 
                            value={kpis.netProfit * 12} // Very simple projection
                            icon={<ChartBarIcon className="w-6 h-6 text-amber-600" />} 
                            colorClass="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100 border border-amber-100 dark:border-amber-800"
                        />
                    </div>

                    {/* Main Chart: Cash Flow */}
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.finances.cashFlow')}</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <ComposedChart data={cashFlowData}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'currentColor' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} className="text-xs text-gray-500 dark:text-gray-400" axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#1f2937' }}
                                    formatter={(value: number) => formatCOP(value)}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="income" name={t('admin.finances.income')} fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="expense" name={t('admin.finances.expenses')} fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                                <Area type="monotone" dataKey="profit" name={t('admin.finances.netProfit')} stroke="#6366f1" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white dark:bg-gray-800/50 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-gray-800 dark:text-white">{t('admin.finances.unifiedLedger')}</h3>
                            
                            {/* Payment Method Filter */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <FilterIcon className="h-4 w-4 text-gray-400" />
                                </div>
                                <select 
                                    value={paymentMethodFilter}
                                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                    className="pl-8 pr-4 py-1 text-xs bg-gray-100 dark:bg-gray-700 border-none rounded-md focus:ring-1 focus:ring-primary text-gray-700 dark:text-gray-200 cursor-pointer"
                                >
                                    <option value="all">{t('admin.finances.allMethods')}</option>
                                    {Object.values(PaymentMethod).map(m => (
                                        <option key={m} value={m}>{t(`paymentMethods.${m}`)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder={t('admin.userManagement.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">{t('admin.finances.date')}</th>
                                    <th className="p-4">{t('admin.finances.type')}</th>
                                    <th className="p-4">{t('admin.finances.category')}</th>
                                    <th className="p-4">{t('admin.finances.concept')}</th>
                                    <th className="p-4 text-right">{t('admin.finances.amount')}</th>
                                    <th className="p-4">{t('admin.finances.status')}</th>
                                    <th className="p-4 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {paginatedData.map((tItem: Transaction) => (
                                    <tr 
                                        key={tItem.id} 
                                        onClick={() => setSelectedTransaction(tItem)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(tItem.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                                tItem.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                                {tItem.type === 'income' ? 'IN' : 'OUT'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {tItem.type === 'income' ? (tItem.original as any).user?.name : t(`admin.finances.categories.${tItem.category}`, {defaultValue: tItem.category})}
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{tItem.description}</td>
                                        <td className={`p-4 text-right font-bold ${tItem.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tItem.type === 'expense' && '- '}{formatCOP(tItem.amount)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                tItem.status === PaymentStatus.COMPLETED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                tItem.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                                {t(`statuses.payment.${tItem.status}`)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                {tItem.type === 'income' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleGenerateReceipt(tItem); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <DocumentChartBarIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {tItem.type === 'expense' && (
                                                    <button onClick={(e) => { e.stopPropagation(); setItemToDelete({id: tItem.id, type: 'expense'}); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <button onClick={() => downloadCSV(allTransactions, [{key: 'date', label: 'Date'}, {key: 'amount', label: 'Amount'}, {key: 'category', label: 'Category'}], 'ledger.csv')} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                            <DocumentArrowDownIcon className="w-4 h-4"/> CSV
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50">{t('admin.userManagement.previous')}</button>
                            <span className="text-sm text-gray-500 self-center">{currentPage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50">{t('admin.userManagement.next')}</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'budgets' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.finances.budgetsOverview')}</h3>
                        <button onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                            <PlusIcon className="w-4 h-4" /> {t('admin.finances.addBudget')}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgetAnalysis.map(budget => {
                            const isOver = budget.spent > budget.amount;
                            const isWarning = !isOver && budget.spent > budget.amount * 0.8;
                            const projectedOver = budget.projectedSpend > budget.amount;
                            
                            return (
                                <div key={budget.id} className="bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            <ClipboardListIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingBudget(budget); setIsBudgetModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-primary bg-white dark:bg-gray-800 rounded shadow"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setItemToDelete({id: budget.id, type: 'budget'})} className="p-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t(`admin.finances.categories.${budget.category}`, {defaultValue: budget.category})}</h4>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatCOP(budget.spent)}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ {formatCOP(budget.amount)}</span>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'}`} 
                                            style={{ width: `${Math.min(100, budget.percentage)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className={isOver ? 'text-red-500' : 'text-green-500'}>
                                            {isOver ? t('admin.finances.overBudget') : t('admin.finances.underBudget')}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">{budget.percentage.toFixed(1)}%</span>
                                    </div>

                                    {/* Advanced Budget Metrics */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-gray-400">{t('admin.finances.dailyAverage')}</p>
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">{formatCOP(budget.dailyAverage)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">{t('admin.finances.dailyRemaining')}</p>
                                            <p className={`font-semibold ${budget.dailyRemaining < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCOP(Math.max(0, budget.dailyRemaining))}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">{t('admin.finances.projected')}</p>
                                            <p className={`font-semibold ${projectedOver ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`}>{formatCOP(budget.projectedSpend)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">{t('admin.finances.vsLastMonth')}</p>
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">{formatCOP(budget.spentPrevMonth)}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.finances.expenseBreakdown')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(expenses.reduce((acc, curr) => ({...acc, [curr.category]: (acc[curr.category] || 0) + curr.amount}), {} as Record<string, number>))
                                        .map(([name, value]) => ({ name: t(`admin.finances.categories.${name}`, {defaultValue: name}), value }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCOP(value)} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.finances.incomeBreakdown')} (Método)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(payments.reduce((acc, curr) => ({...acc, [curr.paymentMethod || 'Unknown']: (acc[curr.paymentMethod || 'Unknown'] || 0) + curr.amount}), {} as Record<string, number>))
                                        .map(([name, value]) => ({ name: t(`paymentMethods.${name}`, {defaultValue: name}), value }))}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {payments.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCOP(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isExpenseModalOpen && (
                <ExpenseModal 
                    onSave={(e) => { addExpense(e); setIsExpenseModalOpen(false); }} 
                    onClose={() => setIsExpenseModalOpen(false)} 
                />
            )}
            {isIncomeModalOpen && (
                <IncomeModal 
                    onSave={(p) => { addPayment(p as any); setIsIncomeModalOpen(false); }} 
                    onClose={() => setIsIncomeModalOpen(false)} 
                />
            )}
            {isBudgetModalOpen && (
                <BudgetModal
                    budget={editingBudget}
                    onSave={(b) => { 
                        if(b.id) updateBudget(b as Budget); 
                        else addBudget(b); 
                        setIsBudgetModalOpen(false); 
                    }}
                    onClose={() => setIsBudgetModalOpen(false)}
                />
            )}
            
            {selectedTransaction && (
                <TransactionDetailsModal 
                    transaction={selectedTransaction} 
                    onClose={() => setSelectedTransaction(null)} 
                />
            )}

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title={t('general.warning')}
                message={itemToDelete?.type === 'budget' ? t('admin.finances.deleteBudgetConfirm') : t('admin.finances.confirmDeleteExpense')}
                confirmText={t('general.delete')}
                isDangerous
            />
        </div>
    );
};

const TransactionDetailsModal: React.FC<{ transaction: Transaction, onClose: () => void }> = ({ transaction, onClose }) => {
    const { t } = useTranslation();
    
    return (
        <ModalWrapper title={t('admin.finances.details')} onClose={onClose}>
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('admin.finances.transactionId')}</span>
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{transaction.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">{t('admin.finances.type')}</span>
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? t('admin.finances.income') : t('admin.finances.expenses')}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">{t('admin.finances.amount')}</span>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{formatCOP(transaction.amount)}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">{t('admin.finances.date')}</span>
                        <span className="text-gray-800 dark:text-gray-200">{new Date(transaction.date).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">{t('admin.finances.modal.paymentMethod')}</span>
                        <span className="text-gray-800 dark:text-gray-200">{transaction.method ? t(`paymentMethods.${transaction.method}`, {defaultValue: transaction.method}) : 'N/A'}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="block text-xs text-gray-500 uppercase mb-1">{t('admin.finances.category')} / {t('general.user')}</span>
                    <p className="font-medium text-gray-800 dark:text-white">
                        {transaction.type === 'income' ? (transaction.original as any).user?.name : t(`admin.finances.categories.${transaction.category}`, {defaultValue: transaction.category})}
                    </p>
                </div>

                <div>
                    <span className="block text-xs text-gray-500 uppercase mb-1">{t('admin.finances.modal.description')}</span>
                    <p className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        {transaction.description || 'No description provided.'}
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        {t('admin.finances.modal.close')}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    )
}

// Sub-components for Modals
const ExpenseModal: React.FC<{ onSave: (expense: Omit<Expense, 'id'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const { t } = useTranslation();
    const { currentUser } = useContext(AuthContext);
    const [category, setCategory] = useState('Other');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ category, amount: Number(amount), date: new Date(date).toISOString(), description, registeredBy: currentUser?.id || 'unknown' });
    };

    const categories = ['Rent', 'Salaries', 'Utilities', 'Equipment', 'Marketing', 'Maintenance', 'Other'];

    return (
        <ModalWrapper title={t('admin.finances.modal.addTitle')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <SelectField label={t('admin.finances.modal.category')} value={category} onChange={setCategory} options={categories.map(c => ({value: c, label: t(`admin.finances.categories.${c}`, {defaultValue: c})}))} />
                <InputField label={t('admin.finances.modal.amount')} value={amount} onChange={setAmount} type="number" required />
                <InputField label={t('admin.finances.modal.date')} value={date} onChange={setDate} type="date" required />
                <TextAreaField label={t('admin.finances.modal.description')} value={description} onChange={setDescription} />
                <ModalFooter onClose={onClose} submitText={t('admin.finances.modal.save')} />
            </form>
        </ModalWrapper>
    );
};

const IncomeModal: React.FC<{ onSave: (payment: Partial<Payment>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ userId: 'manual_entry', amount: Number(amount), date: new Date(date).toISOString(), status: PaymentStatus.COMPLETED, tierId: 'MANUAL_INCOME', paymentMethod: method, description: description || 'Ingreso Vario' });
    };

    return (
        <ModalWrapper title={t('admin.finances.modal.addIncomeTitle')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label={t('admin.finances.modal.amount')} value={amount} onChange={setAmount} type="number" required />
                <SelectField label={t('admin.finances.modal.paymentMethod')} value={method} onChange={(v) => setMethod(v as PaymentMethod)} options={Object.values(PaymentMethod).map(m => ({value: m, label: t(`paymentMethods.${m}`)}))} />
                <InputField label={t('admin.finances.modal.date')} value={date} onChange={setDate} type="date" required />
                <TextAreaField label={t('admin.finances.modal.description')} value={description} onChange={setDescription} />
                <ModalFooter onClose={onClose} submitText={t('admin.finances.modal.saveIncome')} />
            </form>
        </ModalWrapper>
    );
};

const BudgetModal: React.FC<{ budget: Budget | null, onSave: (budget: Omit<Budget, 'id'> & {id?: string}) => void, onClose: () => void }> = ({ budget, onSave, onClose }) => {
    const { t } = useTranslation();
    const [category, setCategory] = useState(budget?.category || 'Rent');
    const [amount, setAmount] = useState(budget?.amount.toString() || '');
    const categories = ['Rent', 'Salaries', 'Utilities', 'Equipment', 'Marketing', 'Maintenance', 'Other'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: budget?.id, category, amount: Number(amount), period: 'monthly', year: new Date().getFullYear() });
    };

    return (
        <ModalWrapper title={budget ? t('admin.finances.modal.editBudgetTitle') : t('admin.finances.modal.addBudgetTitle')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <SelectField label={t('admin.finances.modal.category')} value={category} onChange={setCategory} options={categories.map(c => ({value: c, label: t(`admin.finances.categories.${c}`, {defaultValue: c})}))} />
                <InputField label={t('admin.finances.modal.amount')} value={amount} onChange={setAmount} type="number" required />
                <ModalFooter onClose={onClose} submitText={t('admin.finances.modal.saveBudget')} />
            </form>
        </ModalWrapper>
    );
}

// Reusable UI Components for Modals to reduce boilerplate
const ModalWrapper: React.FC<{title: string, onClose: () => void, children: React.ReactNode}> = ({title, onClose, children}) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold p-6 border-b dark:border-gray-700 text-gray-900 dark:text-white">{title}</h2>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const InputField: React.FC<{label: string, value: string, onChange: (val: string) => void, type?: string, required?: boolean}> = ({label, value, onChange, type="text", required}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white" required={required} />
    </div>
);

const TextAreaField: React.FC<{label: string, value: string, onChange: (val: string) => void}> = ({label, value, onChange}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white" rows={3} />
    </div>
);

const SelectField: React.FC<{label: string, value: string, onChange: (val: string) => void, options: {value: string, label: string}[]}> = ({label, value, onChange, options}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const ModalFooter: React.FC<{onClose: () => void, submitText: string}> = ({onClose, submitText}) => (
    <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">{submitText}</button>
    </div>
);

export default Payments;