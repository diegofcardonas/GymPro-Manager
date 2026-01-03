
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Payment, PaymentStatus, User, Expense, Budget, PaymentMethod } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from '../icons/ArrowTrendingDownIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ComposedChart, Area } from 'recharts';
import { useTranslation } from 'react-i18next';
import { XCircleIcon } from '../icons/XCircleIcon';

const ITEMS_PER_PAGE = 15;
type FinanceTab = 'overview' | 'transactions' | 'budgets';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const FinanceStat: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass: string; small?: boolean }> = ({ title, value, icon, colorClass, small }) => (
    <div className={`bg-white dark:bg-gray-800 ${small ? 'p-4 rounded-3xl' : 'p-6 md:p-8 rounded-4xl'} shadow-sm border border-black/5 dark:border-white/10 hover:shadow-lg transition-all group animate-fade-in`}>
        <div className={`flex items-center gap-4`}>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${colorClass} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <p className={`${small ? 'text-lg' : 'text-xl md:text-2xl'} font-black text-gray-900 dark:text-white tracking-tighter italic`}>{formatCOP(value)}</p>
            </div>
        </div>
    </div>
);

const Payments: React.FC = () => {
    const { t } = useTranslation();
    const { payments, users, expenses, budgets, addExpense, addPayment } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<FinanceTab>('transactions');
    
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
                method: p.paymentMethod || PaymentMethod.CASH,
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
            method: PaymentMethod.CASH, // Expenses are usually recorded as cash/outflow
            status: PaymentStatus.COMPLETED 
        }));
        
        return [...incomes, ...outflows]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter(tItem => {
                const matchesSearch = tItem.description.toLowerCase().includes(searchTerm.toLowerCase()) || tItem.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = typeFilter === 'all' || tItem.type === typeFilter;
                const matchesMethod = methodFilter === 'all' || tItem.method === methodFilter;
                return matchesSearch && matchesType && matchesMethod;
            });
    }, [payments, expenses, users, searchTerm, typeFilter, methodFilter]);

    const filteredTotals = useMemo(() => {
        const income = allTransactions.filter(t => t.type === 'income' && t.status === PaymentStatus.COMPLETED).reduce((acc, curr) => acc + curr.amount, 0);
        const expense = allTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        return { income, expense, net: income - expense };
    }, [allTransactions]);

    const paginatedData = allTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const exportToCSV = () => {
        const headers = ["Fecha,Descripción,Usuario,Categoría,Método,Tipo,Monto"];
        const rows = allTransactions.map(t => 
            `${new Date(t.date).toLocaleDateString()},"${t.description}",${t.user?.name || 'N/A'},${t.category},${t.method},${t.type},${t.amount}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Libro_Diario_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="w-full space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Tesorería Central</h2>
                    <p className="text-xs text-gray-500 font-medium">Control maestro de flujos de capital.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl shadow-inner border border-black/5">
                    {(['overview', 'transactions', 'budgets'] as FinanceTab[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                            {tab === 'overview' ? 'Métricas' : tab === 'transactions' ? 'Libro Diario' : 'Presupuestos'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'transactions' && (
                <div className="space-y-6">
                    {/* Resumen Filtrado Dinámico */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FinanceStat small title="Ingresos Filtrados" value={filteredTotals.income} icon={<ArrowTrendingUpIcon className="w-5 h-5"/>} colorClass="from-emerald-500 to-teal-500" />
                        <FinanceStat small title="Egresos Filtrados" value={filteredTotals.expense} icon={<ArrowTrendingDownIcon className="w-5 h-5"/>} colorClass="from-rose-500 to-orange-500" />
                        <FinanceStat small title="Balance de Vista" value={filteredTotals.net} icon={<CurrencyDollarIcon className="w-5 h-5"/>} colorClass="from-indigo-500 to-blue-500" />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 shadow-xl overflow-hidden">
                        {/* Toolbar de Filtros */}
                        <div className="p-6 border-b border-black/5 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col xl:flex-row justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 flex-1">
                                <div className="relative flex-1 min-w-[200px]">
                                    <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Búsqueda rápida..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary shadow-sm" />
                                </div>
                                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="px-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer">
                                    <option value="all">TODOS LOS TIPOS</option>
                                    <option value="income">INGRESOS</option>
                                    <option value="expense">EGRESOS</option>
                                </select>
                                <select value={methodFilter} onChange={e => setMethodFilter(e.target.value as any)} className="px-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer">
                                    <option value="all">TODOS LOS MÉTODOS</option>
                                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={exportToCSV} className="p-2.5 bg-white dark:bg-gray-700 text-gray-500 hover:text-primary rounded-xl shadow-sm border border-black/5 transition-all">
                                    <DocumentArrowDownIcon className="w-5 h-5" />
                                </button>
                                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden xl:block"></div>
                                <button onClick={() => { setModalType('income'); setIsModalOpen(true); }} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">+ INGRESO</button>
                                <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all">+ GASTO</button>
                            </div>
                        </div>

                        {/* Tabla de Transacciones */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left responsive-table">
                                <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-header-group border-b border-black/5">
                                    <tr>
                                        <th className="px-6 py-4">FECHA</th>
                                        <th className="px-6 py-4">CONCEPTO / DESCRIPCIÓN</th>
                                        <th className="px-6 py-4 text-center">MÉTODO</th>
                                        <th className="px-6 py-4">CATEGORÍA</th>
                                        <th className="px-6 py-4 text-right">VALOR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {paginatedData.map((tItem: any) => (
                                        <tr key={tItem.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all group animate-slide-up">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] text-gray-900 dark:text-white font-black italic">{new Date(tItem.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(tItem.date).getFullYear()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate max-w-[250px]">{tItem.description}</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">{tItem.user?.name || 'OPERATIVO INTERNO'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg" title={tItem.method}>
                                                        {tItem.method === PaymentMethod.CARD ? <CreditCardIcon className="w-3.5 h-3.5 text-blue-500" /> : <CurrencyDollarIcon className="w-3.5 h-3.5 text-emerald-500" />}
                                                        <span className="text-[9px] font-black text-gray-500 uppercase">{tItem.method}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${tItem.category === 'POS_SALE' ? 'bg-violet-50 text-violet-500 border-violet-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                    {tItem.category}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black italic text-sm md:text-base ${tItem.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <div className="flex flex-col items-end">
                                                    <span>{tItem.type === 'income' ? '+' : '-'}{formatCOP(tItem.amount)}</span>
                                                    {tItem.status === PaymentStatus.PENDING && <span className="text-[8px] px-1 bg-amber-100 text-amber-600 rounded mt-0.5">PENDIENTE</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="p-4 border-t border-black/5 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Mostrando {paginatedData.length} de {allTransactions.length}</p>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30">
                                    <FilterIcon className="w-4 h-4 rotate-90" />
                                </button>
                                <span className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-black italic">{currentPage}</span>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedData.length < ITEMS_PER_PAGE} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30">
                                    <FilterIcon className="w-4 h-4 -rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FinanceStat title="Utilidad Bruta" value={filteredTotals.net} icon={<CurrencyDollarIcon className="w-8 h-8"/>} colorClass="from-indigo-600 to-blue-500" />
                        <FinanceStat title="Ingresos Totales" value={filteredTotals.income} icon={<ArrowTrendingUpIcon className="w-8 h-8"/>} colorClass="from-emerald-600 to-teal-500" />
                        <FinanceStat title="Gastos Acumulados" value={filteredTotals.expense} icon={<ArrowTrendingDownIcon className="w-8 h-8"/>} colorClass="from-rose-600 to-orange-500" />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-black/5 shadow-sm">
                        <h3 className="text-xl font-black mb-10 text-gray-900 dark:text-white uppercase tracking-tighter italic">Flujo de Caja Consolidado</h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[{n: 'Ene', i: 120, e: 80}, {n: 'Feb', i: 140, e: 85}, {n: 'Mar', i: 130, e: 90}]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                    <XAxis dataKey="n" axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black text-gray-400" />
                                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="i" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={4} />
                                    <Bar dataKey="e" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={25} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && <FinanceModal type={modalType} onClose={() => setIsModalOpen(false)} onSubmit={(data: any) => {
                if (modalType === 'expense') addExpense(data);
                else addPayment({ ...data, status: PaymentStatus.COMPLETED });
                setIsModalOpen(false);
            }} />}
        </div>
    );
};

const FinanceModal = ({ type, onClose, onSubmit }: any) => {
    const [formData, setFormData] = useState({ amount: 0, category: type === 'income' ? 'Sales' : 'Other', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.CASH });
    
    // Prevent background scrolling
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const modalContent = (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-0 md:p-6 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full h-full md:h-auto md:max-w-xl md:rounded-4xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in flex flex-col border border-white/10">
                <div className={`p-8 md:p-10 ${type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white relative overflow-hidden shrink-0`}>
                     <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">{type === 'income' ? "Registrar Ingreso" : "Registrar Egreso"}</h2>
                            <p className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Unidad de Gestión de Caja</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 hover:scale-110 active:scale-95">
                            <XCircleIcon className="w-7 h-7" />
                        </button>
                     </div>
                </div>
                <div className="p-8 md:p-12 space-y-10 flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto de Operación</label>
                        <div className="flex items-center border-b-4 border-gray-100 dark:border-gray-800 focus-within:border-primary transition-colors pb-2">
                             <span className="text-3xl md:text-4xl font-black text-gray-300 mr-2">$</span>
                             <input 
                                type="number" 
                                autoFocus 
                                value={formData.amount || ''} 
                                onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
                                className="w-full text-4xl md:text-5xl font-black text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 placeholder-gray-100 p-0 italic tracking-tighter" 
                                placeholder="0" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Concepto del Movimiento</label>
                            <input type="text" placeholder="¿Cuál es el concepto?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner appearance-none">
                                    {type === 'income' ? ['Sales', 'POS_SALE', 'Other'].map(c => <option key={c}>{c}</option>) : ['Rent', 'Salaries', 'Maintenance', 'Marketing', 'Equipment', 'Other'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Método de Pago</label>
                                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner appearance-none">
                                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-900 border-t border-black/5 dark:border-white/5 shrink-0">
                    <button onClick={onClose} className="flex-1 py-5 font-black uppercase text-xs text-gray-400 tracking-widest rounded-3xl bg-white dark:bg-gray-800 border border-black/5 dark:border-white/5 hover:bg-black/5 transition-all">Cancelar</button>
                    <button onClick={() => onSubmit(formData)} className={`flex-[2] py-5 rounded-3xl font-black text-white ${type === 'income' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-600 shadow-rose-500/30'} shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest`}>Confirmar Registro</button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Payments;
