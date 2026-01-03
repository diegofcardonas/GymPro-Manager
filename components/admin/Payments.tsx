
import React, { useState, useMemo, useContext } from 'react';
import { Payment, PaymentStatus, User, Expense, Budget, PaymentMethod } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from '../icons/ArrowTrendingDownIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart, Area, Line } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { XCircleIcon } from '../icons/XCircleIcon';

const ITEMS_PER_PAGE = 10;
type FinanceTab = 'overview' | 'transactions' | 'budgets' | 'reports';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const CATEGORY_COLORS: Record<string, string> = {
    'Rent': '#8b5cf6',
    'Salaries': '#3b82f6',
    'Utilities': '#f59e0b',
    'Marketing': '#ec4899',
    'Equipment': '#10b981',
    'Maintenance': '#f43f5e',
    'Sales': '#6366f1',
    'POS_SALE': '#14b8a6',
    'Other': '#94a3b8'
};

const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    trend?: number; 
    isExpense?: boolean;
    colorClass?: string;
}> = ({ title, value, icon, trend, isExpense, colorClass = "from-blue-500 to-indigo-500" }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>{icon}</div>
            {trend !== undefined && (
                <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    (isExpense ? trend < 0 : trend > 0) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </div>
            )}
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black mt-1 text-gray-900 dark:text-white tracking-tight">{formatCOP(value)}</p>
    </div>
);

const Payments: React.FC = () => {
    const { t } = useTranslation();
    const { payments, users, expenses, budgets, addExpense, deleteExpense, addPayment } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('income');

    const allTransactions = useMemo(() => {
        const incomes = payments.map(p => {
            const user = users.find(u => u.id === p.userId);
            return { 
                id: p.id, 
                type: 'income', 
                category: p.tierId === 'POS_SALE' ? 'POS_SALE' : 'Sales', 
                description: p.description || 'Membresía', 
                amount: p.amount, 
                date: p.date, 
                status: p.status, 
                method: p.paymentMethod, 
                user 
            };
        });
        const outflows = expenses.map(e => ({ 
            id: e.id, 
            type: 'expense', 
            category: e.category, 
            description: e.description || e.category, 
            amount: e.amount, 
            date: e.date, 
            status: PaymentStatus.COMPLETED,
            method: PaymentMethod.TRANSFER
        }));
        const combined = [...incomes, ...outflows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return combined.filter(tItem => {
            const matchesSearch = tItem.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 tItem.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMethod = paymentMethodFilter === 'all' || tItem.method === paymentMethodFilter;
            return matchesSearch && matchesMethod;
        });
    }, [payments, expenses, users, searchTerm, paymentMethodFilter]);

    const kpis = useMemo(() => {
        const income = allTransactions.filter(t => t.type === 'income' && t.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const expenseTotal = allTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        return { income, expenses: expenseTotal, netProfit: income - expenseTotal };
    }, [allTransactions]);

    const cashFlowData = useMemo(() => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        return months.map((m, i) => ({
            name: m,
            income: Math.floor(Math.random() * 50000000) + 30000000,
            expense: Math.floor(Math.random() * 30000000) + 10000000
        }));
    }, []);

    const expensePieData = useMemo(() => {
        const categories: Record<string, number> = {};
        expenses.forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + e.amount;
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const budgetComparisonData = useMemo(() => {
        return budgets.map(b => {
            const actual = expenses
                .filter(e => e.category === b.category)
                .reduce((sum, e) => sum + e.amount, 0);
            return {
                category: t(`finance.categories.${b.category}`),
                planned: b.amount,
                actual: actual,
                percent: (actual / b.amount) * 100
            };
        });
    }, [budgets, expenses, t]);

    const paginatedData = allTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE);

    const exportCSV = () => {
        const headers = ["Fecha", "Tipo", "Categoría", "Descripción", "Monto", "Método"];
        const rows = allTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type.toUpperCase(),
            t.category,
            t.description,
            t.amount,
            t.method
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "finanzas_gympro.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{t('admin.finances.title')}</h2>
                    <p className="text-gray-500 font-medium text-sm">Gestiona ingresos, egresos y proyecciones.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={exportCSV} className="flex-1 md:flex-none px-4 py-2.5 bg-white dark:bg-gray-800 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                        <DocumentArrowDownIcon className="w-4 h-4" /> {t('general.export')}
                    </button>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl shadow-inner border border-black/5 dark:border-white/5">
                        {(['overview', 'transactions', 'budgets', 'reports'] as FinanceTab[]).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-primary shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                                {t(`admin.finances.tabs.${tab}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title={t('admin.finances.stats.netProfit')} value={kpis.netProfit} icon={<CurrencyDollarIcon className="w-6 h-6" />} trend={12} colorClass="from-indigo-500 to-purple-500" />
                        <StatCard title={t('admin.finances.stats.totalIncome')} value={kpis.income} icon={<ArrowTrendingUpIcon className="w-6 h-6" />} trend={8} colorClass="from-emerald-500 to-teal-500" />
                        <StatCard title={t('admin.finances.stats.totalExpenses')} value={kpis.expenses} icon={<ArrowTrendingDownIcon className="w-6 h-6" />} trend={-2} isExpense colorClass="from-rose-500 to-orange-500" />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-4xl border border-black/5 shadow-sm">
                            <h3 className="text-lg font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-primary" /> {t('admin.finances.stats.cashFlow')}
                            </h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={cashFlowData} margin={{ left: -20 }}>
                                        <defs>
                                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                        <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" tickFormatter={v => `${v/1000000}M`} />
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="income" fill="url(#incomeGrad)" stroke="#10b981" strokeWidth={3} />
                                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-black/5 shadow-sm flex flex-col">
                            <h3 className="text-lg font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tight">Distribución de Gastos</h3>
                            <div className="flex-1 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {expensePieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ccc'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} formatter={(v: number) => formatCOP(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {expensePieData.slice(0, 4).map(item => (
                                    <div key={item.name} className="flex items-center justify-between text-[10px] font-bold uppercase">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }}></div>
                                            <span className="text-gray-500">{t(`finance.categories.${item.name}`)}</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-white">{formatCOP(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white dark:bg-gray-800 rounded-4xl border border-black/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder={t('general.search')} 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary shadow-inner" 
                                />
                            </div>
                            <select 
                                value={paymentMethodFilter} 
                                onChange={(e) => setPaymentMethodFilter(e.target.value)} 
                                className="bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-[10px] font-black uppercase px-4 py-2.5 text-gray-500 shadow-inner"
                            >
                                <option value="all">TODOS LOS MÉTODOS</option>
                                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => { setModalType('income'); setIsModalOpen(true); }} className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:scale-105">+ INGRESO</button>
                            <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="flex-1 sm:flex-none px-6 py-3 bg-rose-500 text-white rounded-2xl text-xs font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 hover:scale-105">+ GASTO</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left responsive-table">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-header-group">
                                <tr>
                                    <th className="p-4">FECHA</th>
                                    <th className="p-4">TIPO</th>
                                    <th className="p-4">CONCEPTO</th>
                                    <th className="p-4">CATEGORÍA</th>
                                    <th className="p-4 text-right">MONTO</th>
                                    <th className="p-4 text-center">ESTADO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                                {paginatedData.map((tItem: any) => (
                                    <tr key={tItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer">
                                        <td data-label="Fecha" className="p-4 text-gray-500 font-medium">{new Date(tItem.date).toLocaleDateString()}</td>
                                        <td data-label="Tipo" className="p-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tighter ${tItem.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {tItem.type === 'income' ? 'IN' : 'OUT'}
                                            </span>
                                        </td>
                                        <td data-label="Concepto" className="p-4">
                                            <p className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{tItem.description}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{tItem.user?.name || tItem.method}</p>
                                        </td>
                                        <td data-label="Categoría" className="p-4">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-black text-gray-500 uppercase">
                                                {t(`finance.categories.${tItem.category}`)}
                                            </span>
                                        </td>
                                        <td data-label="Monto" className={`p-4 text-right font-black ${tItem.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {formatCOP(tItem.amount)}
                                        </td>
                                        <td data-label="Estado" className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${tItem.status === PaymentStatus.COMPLETED ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {tItem.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-6 border-t border-black/5 flex justify-between items-center text-xs font-bold text-gray-400">
                        <p>Página {currentPage} de {totalPages}</p>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl disabled:opacity-30">Anterior</button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl disabled:opacity-30">Siguiente</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'budgets' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {budgetComparisonData.map(item => (
                            <div key={item.category} className="bg-white dark:bg-gray-800 p-6 rounded-4xl border border-black/5 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{item.category}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Estado de Ejecución</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${item.percent > 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {item.percent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-4 rounded-full overflow-hidden mb-6 shadow-inner">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${item.percent > 100 ? 'bg-red-500' : 'bg-primary'}`} 
                                        style={{ width: `${Math.min(100, item.percent)}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase">{t('admin.finances.budget.planned')}</p>
                                        <p className="text-xl font-black text-gray-600 dark:text-gray-300">{formatCOP(item.planned)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase">{t('admin.finances.budget.actual')}</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{formatCOP(item.actual)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-black/5 shadow-sm">
                        <h3 className="text-lg font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tight">Proyección de Ingresos (6 Meses)</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashFlowData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                    <Bar dataKey="income" name="Proyectado" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && <TransactionModal type={modalType} onClose={() => setIsModalOpen(false)} onSubmit={(data) => {
                if (modalType === 'expense') addExpense(data);
                else addPayment(data);
                setIsModalOpen(false);
            }} />}
        </div>
    );
};

const TransactionModal = ({ type, onClose, onSubmit }: any) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        amount: 0,
        category: type === 'income' ? 'Sales' : 'Rent',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: PaymentMethod.CASH
    });

    const expenseCats = ['Rent', 'Salaries', 'Utilities', 'Marketing', 'Equipment', 'Maintenance', 'Other'];
    const incomeCats = ['Sales', 'POS_SALE', 'Other'];

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-4xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                <div className={`p-8 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'} text-white relative`}>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">
                        {type === 'income' ? t('admin.finances.modal.addIncome') : t('admin.finances.modal.addExpense')}
                    </h2>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/40"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="space-y-2 text-center">
                        <label className="text-[10px] font-black uppercase text-gray-400">{t('admin.finances.modal.amount')}</label>
                        <input 
                            type="number" 
                            autoFocus
                            value={formData.amount} 
                            onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                            className="w-full text-4xl font-black text-center bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">{t('admin.finances.modal.category')}</label>
                            <select 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-bold shadow-inner"
                            >
                                {(type === 'income' ? incomeCats : expenseCats).map(cat => (
                                    <option key={cat} value={cat}>{t(`finance.categories.${cat}`)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">{t('admin.finances.modal.date')}</label>
                            <input 
                                type="date" 
                                value={formData.date} 
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-bold shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">{t('admin.finances.modal.description')}</label>
                        <input 
                            type="text" 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-bold shadow-inner"
                            placeholder="Ej. Pago servicios mes de mayo"
                        />
                    </div>

                    <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase text-gray-400 ml-1">{t('admin.finances.modal.method')}</label>
                         <div className="flex gap-2">
                             {Object.values(PaymentMethod).map(m => (
                                 <button 
                                    key={m} 
                                    onClick={() => setFormData({...formData, paymentMethod: m as any})}
                                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${formData.paymentMethod === m ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                                >
                                    {m}
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-black/5 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-400 font-black rounded-2xl border border-black/5 shadow-sm uppercase text-xs">
                        {t('general.cancel')}
                    </button>
                    <button 
                        onClick={() => onSubmit(formData)}
                        className={`flex-[2] py-4 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'} text-white font-black rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] transition-all uppercase text-xs`}
                    >
                        {t('general.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payments;
