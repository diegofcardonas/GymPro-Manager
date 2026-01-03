
import React, { useState, useMemo, useContext } from 'react';
import { Payment, PaymentStatus, User, Expense, Budget, PaymentMethod } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from '../icons/ArrowTrendingDownIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ComposedChart, Area, PieChart, Pie } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon } from '../icons/ChartBarIcon';

const ITEMS_PER_PAGE = 10;
type FinanceTab = 'overview' | 'transactions' | 'budgets';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const CATEGORY_COLORS: Record<string, string> = {
    'Rent': '#6366f1', 'Salaries': '#8b5cf6', 'Utilities': '#06b6d4', 'Marketing': '#f43f5e', 
    'Equipment': '#10b981', 'Maintenance': '#f59e0b', 'Sales': '#10b981', 'POS_SALE': '#8b5cf6', 'Other': '#94a3b8'
};

const FinanceStat: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-black/5 dark:border-white/10 hover:shadow-2xl transition-all group animate-fade-in">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-3xl font-black mt-2 text-gray-900 dark:text-white tracking-tighter italic">{formatCOP(value)}</p>
    </div>
);

const Payments: React.FC = () => {
    const { t } = useTranslation();
    const { payments, users, expenses, budgets, addExpense, addPayment } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('income');

    const allTransactions = useMemo(() => {
        const incomes = payments.map(p => {
            const user = users.find(u => u.id === p.userId);
            return { id: p.id, type: 'income', category: p.tierId === 'POS_SALE' ? 'POS_SALE' : 'Sales', description: p.description || 'Membresía', amount: p.amount, date: p.date, status: p.status, user };
        });
        const outflows = expenses.map(e => ({ id: e.id, type: 'expense', category: e.category, description: e.description || e.category, amount: e.amount, date: e.date, status: PaymentStatus.COMPLETED }));
        const combined = [...incomes, ...outflows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return combined.filter(tItem => tItem.description.toLowerCase().includes(searchTerm.toLowerCase()) || tItem.user?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [payments, expenses, users, searchTerm]);

    const totals = useMemo(() => {
        const income = allTransactions.filter(t => t.type === 'income' && t.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const expenseTotal = allTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        return { income, expenses: expenseTotal, net: income - expenseTotal };
    }, [allTransactions]);

    const paginatedData = allTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Tesorería & POS</h2>
                    <p className="text-gray-500 font-medium">Gestión integral de ingresos y gastos operativos.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-3xl shadow-inner border border-black/5">
                    {(['overview', 'transactions', 'budgets'] as FinanceTab[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-primary shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                            {tab === 'overview' ? 'Resumen' : tab === 'transactions' ? 'Libro Diario' : 'Presupuestos'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FinanceStat title="Utilidad Neta" value={totals.net} icon={<CurrencyDollarIcon className="w-8 h-8"/>} colorClass="from-indigo-600 to-blue-500" />
                        <FinanceStat title="Ingresos Brutos" value={totals.income} icon={<ArrowTrendingUpIcon className="w-8 h-8"/>} colorClass="from-emerald-600 to-teal-500" />
                        <FinanceStat title="Gastos Totales" value={totals.expenses} icon={<ArrowTrendingDownIcon className="w-8 h-8"/>} colorClass="from-rose-600 to-orange-500" />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-4xl border border-black/5 shadow-sm">
                        <h3 className="text-xl font-black mb-10 text-gray-900 dark:text-white uppercase tracking-tighter italic">Flujo de Caja Consolidado</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[{n: 'Ene', i: 120, e: 80}, {n: 'Feb', i: 140, e: 85}, {n: 'Mar', i: 130, e: 90}]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                    <XAxis dataKey="n" axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                                    <Tooltip contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 20px 50px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="i" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={4} />
                                    <Bar dataKey="e" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={30} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white dark:bg-gray-800 rounded-4xl border border-black/5 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-80">
                            <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Filtrar libro diario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner" />
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button onClick={() => { setModalType('income'); setIsModalOpen(true); }} className="flex-1 sm:px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">+ INGRESO</button>
                            <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="flex-1 sm:px-8 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 transition-all">+ GASTO</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left responsive-table">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-header-group">
                                <tr>
                                    <th className="p-6">FECHA</th>
                                    <th className="p-6">TRANSACCIÓN</th>
                                    <th className="p-6">CATEGORÍA</th>
                                    <th className="p-6 text-right">VALOR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {paginatedData.map((tItem: any) => (
                                    <tr key={tItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all group">
                                        <td className="p-6 text-xs text-gray-400 font-black">{new Date(tItem.date).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{tItem.description}</p>
                                            <p className="text-[9px] text-primary font-black uppercase mt-1">{tItem.user?.name || 'Gasto Operativo'}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{tItem.category}</span>
                                        </td>
                                        <td className={`p-6 text-right font-black italic text-lg ${tItem.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{tItem.type === 'income' ? '+' : '-'}{formatCOP(tItem.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && <FinanceModal type={modalType} onClose={() => setIsModalOpen(false)} onSubmit={(data: any) => {
                if (modalType === 'expense') addExpense(data);
                else addPayment(data);
                setIsModalOpen(false);
            }} />}
        </div>
    );
};

const FinanceModal = ({ type, onClose, onSubmit }: any) => {
    const [formData, setFormData] = useState({ amount: 0, category: type === 'income' ? 'Sales' : 'Other', description: '', date: new Date().toISOString().split('T')[0] });
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-4xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
                <div className={`p-10 ${type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white relative overflow-hidden`}>
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                     <h2 className="text-3xl font-black uppercase tracking-tighter italic">{type === 'income' ? "Nuevo Ingreso" : "Nuevo Egreso"}</h2>
                     <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Registro Central de Tesorería</p>
                </div>
                <div className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto de Operación</label>
                        <input type="number" autoFocus value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full text-5xl font-black text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 placeholder-gray-200 p-0" placeholder="0" />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <input type="text" placeholder="Concepto / Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-bold" />
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-bold appearance-none">
                            {type === 'income' ? ['Sales', 'POS_SALE', 'Other'].map(c => <option key={c}>{c}</option>) : ['Rent', 'Salaries', 'Maintenance', 'Marketing', 'Equipment', 'Other'].map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-10 flex gap-4 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="flex-1 py-5 font-black uppercase text-xs text-gray-400 tracking-widest">Cancelar</button>
                    <button onClick={() => onSubmit(formData)} className={`flex-[2] py-5 rounded-3xl font-black text-white ${type === 'income' ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-rose-600 shadow-rose-600/30'} shadow-2xl hover:scale-105 transition-all uppercase text-xs tracking-widest`}>Confirmar Transacción</button>
                </div>
            </div>
        </div>
    );
};

export default Payments;
