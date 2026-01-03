
import React, { useState, useMemo, useContext } from 'react';
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart, Area } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { FilterIcon } from '../icons/FilterIcon';

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
                    {trend}%
                </div>
            )}
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black mt-1 text-gray-900 dark:text-white tracking-tight">{formatCOP(value)}</p>
    </div>
);

const Payments: React.FC = () => {
    const { t } = useTranslation();
    const { payments, users, expenses, budgets, addExpense, deleteExpense, addPayment, updateBudget, deleteBudget } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const allTransactions = useMemo(() => {
        const incomes = payments.map(p => {
            const user = users.find(u => u.id === p.userId);
            return { id: p.id, type: 'income', category: 'Sales', description: p.description || 'Membresía', amount: p.amount, date: p.date, status: p.status, method: p.paymentMethod, user };
        });
        const outflows = expenses.map(e => ({ id: e.id, type: 'expense', category: e.category, description: e.description || e.category, amount: e.amount, date: e.date, status: PaymentStatus.COMPLETED }));
        const combined = [...incomes, ...outflows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return paymentMethodFilter === 'all' ? combined : combined.filter(t => t.type === 'income' && t.method === paymentMethodFilter);
    }, [payments, expenses, users, paymentMethodFilter]);

    const kpis = useMemo(() => {
        const income = allTransactions.filter(t => t.type === 'income' && t.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const expenseTotal = allTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        return { income, expenses: expenseTotal, netProfit: income - expenseTotal };
    }, [allTransactions]);

    const paginatedData = allTransactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase())).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Gestión Financiera</h2>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl shadow-inner border border-black/5 dark:border-white/5">
                    {(['overview', 'transactions', 'budgets', 'reports'] as FinanceTab[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-primary shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                            {t(`admin.finances.tabs.${tab}`)}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title="Utilidad Neta" value={kpis.netProfit} icon={<CurrencyDollarIcon className="w-6 h-6" />} trend={12} colorClass="from-indigo-500 to-purple-500" />
                        <StatCard title="Ingresos" value={kpis.income} icon={<ArrowTrendingUpIcon className="w-6 h-6" />} trend={8} colorClass="from-emerald-500 to-teal-500" />
                        <StatCard title="Gastos" value={kpis.expenses} icon={<ArrowTrendingDownIcon className="w-6 h-6" />} trend={-2} isExpense colorClass="from-rose-500 to-orange-500" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-black/5 shadow-sm">
                        <h3 className="text-lg font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tight">Flujo de Efectivo</h3>
                        <div className="h-[350px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[{name: 'Ene', income: 4000, expense: 2400}, {name: 'Feb', income: 3000, expense: 1398}, {name: 'Mar', income: 2000, expense: 9800}]} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-xl">Transacciones</h3>
                             <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-[10px] font-black uppercase px-3 py-1 text-gray-500">
                                <option value="all">TODOS</option>
                                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setIsIncomeModalOpen(true)} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all">+ INGRESO</button>
                            <button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 sm:flex-none px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-all">+ GASTO</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left responsive-table">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-header-group">
                                <tr>
                                    <th className="p-4">FECHA</th>
                                    <th className="p-4">TIPO</th>
                                    <th className="p-4">CONCEPTO</th>
                                    <th className="p-4 text-right">MONTO</th>
                                    <th className="p-4">ESTADO</th>
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
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{tItem.user?.name || tItem.category}</p>
                                        </td>
                                        <td data-label="Monto" className={`p-4 text-right font-black ${tItem.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {formatCOP(tItem.amount)}
                                        </td>
                                        <td data-label="Estado" className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${tItem.status === PaymentStatus.COMPLETED ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {tItem.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
