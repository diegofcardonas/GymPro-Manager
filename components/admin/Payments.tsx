
import React, { useState, useMemo, useContext } from 'react';
import { Payment, PaymentStatus, User, MembershipTier, Role, MembershipStatus as UserMembershipStatus } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { MOCK_TIERS } from '../../data/membershipTiers';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, TooltipProps } from 'recharts';

const ITEMS_PER_PAGE = 10;

type SortKey = 'user.name' | 'amount' | 'date' | 'status';

interface EnrichedPayment extends Payment {
    user: User | { name: string; email?: string };
    tier: MembershipTier | { name: string, color?: string };
}

const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o && o[k] != null) ? o[k] : null, obj);

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode, formatAsCurrency?: boolean }> = ({ title, value, icon, formatAsCurrency = false }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl flex items-center space-x-4 w-full text-left ring-1 ring-black/5 dark:ring-white/10 h-full">
        <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatAsCurrency ? formatCOP(value) : value.toLocaleString()}
            </p>
        </div>
    </div>
);

const CustomBarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-md border border-gray-300 dark:border-gray-600">
          <p className="label text-sm font-semibold text-gray-800 dark:text-gray-200">{`${label}`}</p>
          <p className="intro text-xs text-primary">{`Ingresos : ${formatCOP(payload[0].value as number)}`}</p>
        </div>
      );
    }
    return null;
};


const Payments: React.FC = () => {
    const { payments, users } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<EnrichedPayment | null>(null);


    const enrichedPayments = useMemo(() => {
        return payments.map(payment => {
            const user = users.find(u => u.id === payment.userId);
            const tier = MOCK_TIERS.find(t => t.id === payment.tierId);
            return {
                ...payment,
                user: user || { name: 'Usuario Desconocido', email: 'N/A' },
                tier: tier || { name: 'Nivel Desconocido' }
            };
        });
    }, [payments, users]);

    const dashboardStats = useMemo(() => {
        const completedPayments = enrichedPayments.filter(p => p.status === PaymentStatus.COMPLETED);
        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        const activeClients = users.filter(u => u.role === Role.CLIENT && u.membership.status === UserMembershipStatus.ACTIVE);
        const mrr = activeClients.reduce((sum, client) => {
            const tier = MOCK_TIERS.find(t => t.id === client.membership.tierId);
            return sum + (tier?.price || 0);
        }, 0);
    
        const unpaidDues = enrichedPayments
            .filter(p => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.FAILED)
            .reduce((sum, p) => sum + p.amount, 0);
        
        return {
            totalRevenue,
            mrr,
            activeMembers: activeClients.length,
            unpaidDues
        };
    }, [enrichedPayments, users]);
    
    const revenueByTierData = useMemo(() => {
        const tierRevenue: { [key: string]: { name: string; value: number; color: string } } = {};
        
        enrichedPayments
            .filter(p => p.status === PaymentStatus.COMPLETED)
            .forEach(p => {
                const tier = p.tier as MembershipTier;
                if (tier.id) {
                    if (!tierRevenue[tier.id]) {
                        tierRevenue[tier.id] = { name: tier.name, value: 0, color: tier.color };
                    }
                    tierRevenue[tier.id].value += p.amount;
                }
            });
        return Object.values(tierRevenue);
    }, [enrichedPayments]);
    
    const revenueOverTimeData = useMemo(() => {
        const monthRevenue: { [key: string]: number } = {};
        
        enrichedPayments
            .filter(p => p.status === PaymentStatus.COMPLETED)
            .forEach(p => {
                const date = new Date(p.date);
                const month = date.toLocaleString('es-CO', { month: 'short', year: '2-digit' });
                if (!monthRevenue[month]) {
                    monthRevenue[month] = 0;
                }
                monthRevenue[month] += p.amount;
            });
    
        return Object.entries(monthRevenue)
            .map(([month, revenue]) => {
                 // Spanish format usually gives "ene 24", need to handle parsing if needed for sorting
                 // Simple mock sorting by assumption of creation order for now or re-parse
                 return { name: month, revenue };
            })
            // Ideally sort by date object
    }, [enrichedPayments]);

    const filteredPayments = useMemo(() => {
        return enrichedPayments.filter(payment => {
            const searchMatch = (payment.user as User).name.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = !statusFilter || payment.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [enrichedPayments, searchTerm, statusFilter]);

    const sortedPayments = useMemo(() => {
        let sortablePayments = [...filteredPayments];
        if (sortConfig !== null) {
            sortablePayments.sort((a, b) => {
                const aValue = getNestedValue(a, sortConfig.key);
                const bValue = getNestedValue(b, sortConfig.key);
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortablePayments;
    }, [filteredPayments, sortConfig]);

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPayments, currentPage]);

    const totalPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />;
    };

    return (
        <div className="space-y-8">
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Ingresos Totales" value={dashboardStats.totalRevenue} formatAsCurrency icon={<CurrencyDollarIcon className="w-6 h-6 text-green-500"/>} />
                    <StatCard title="IMR Estimado" value={dashboardStats.mrr} formatAsCurrency icon={<CurrencyDollarIcon className="w-6 h-6 text-blue-500"/>} />
                    <StatCard title="Miembros Activos" value={dashboardStats.activeMembers} icon={<UserGroupIcon className="w-6 h-6 text-purple-500"/>} />
                    <StatCard title="Pagos Pendientes" value={dashboardStats.unpaidDues} formatAsCurrency icon={<XCircleIcon className="w-6 h-6 text-red-500"/>} />
                </div>
            </section>
             <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ingresos en el Tiempo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-500 dark:text-gray-400" />
                            <YAxis tick={{ fill: 'currentColor' }} tickFormatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`} className="text-xs text-gray-500 dark:text-gray-400" />
                            <Tooltip cursor={{fill: 'hsla(var(--primary), 0.1)'}} content={<CustomBarTooltip />}/>
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-6 rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ingresos por Nivel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={revenueByTierData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {revenueByTierData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCOP(value)}/>
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>
             <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Historial de Pagos</h2>
                <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 w-full overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Buscar por cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary px-4 py-2 text-gray-800 dark:text-gray-200"
                            />
                            <select
                                value={statusFilter || ''}
                                onChange={e => setStatusFilter(e.target.value as PaymentStatus || null)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary px-4 py-2 text-gray-800 dark:text-gray-200"
                            >
                                <option value="">Todos los Estados</option>
                                {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left responsive-table">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 uppercase hidden md:table-header-group">
                                <tr>
                                    <th className="p-4 font-semibold">
                                        <button onClick={() => requestSort('user.name')} className="flex items-center space-x-1">
                                            <span>Cliente</span>{getSortIcon('user.name')}
                                        </button>
                                    </th>
                                    <th className="p-4 font-semibold">
                                        <button onClick={() => requestSort('amount')} className="flex items-center space-x-1">
                                            <span>Monto</span>{getSortIcon('amount')}
                                        </button>
                                    </th>
                                    <th className="p-4 font-semibold">
                                        <span>Nivel</span>
                                    </th>
                                    <th className="p-4 font-semibold">
                                        <button onClick={() => requestSort('date')} className="flex items-center space-x-1">
                                            <span>Fecha</span>{getSortIcon('date')}
                                        </button>
                                    </th>
                                    <th className="p-4 font-semibold">
                                        <button onClick={() => requestSort('status')} className="flex items-center space-x-1">
                                            <span>Estado</span>{getSortIcon('status')}
                                        </button>
                                    </th>
                                    <th className="p-4 font-semibold">
                                    <span>Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPayments.map(payment => (
                                    <PaymentRow key={payment.id} payment={payment} onViewDetails={() => setSelectedPayment(payment)} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <p>Mostrando {paginatedPayments.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-{(currentPage - 1) * ITEMS_PER_PAGE + paginatedPayments.length} de {sortedPayments.length} pagos</p>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Anterior</button>
                            <span>Página {currentPage} de {totalPages || 1}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Siguiente</button>
                        </div>
                    </div>
                </div>
            </section>
            {selectedPayment && <PaymentDetailsModal payment={selectedPayment} allPayments={enrichedPayments} onClose={() => setSelectedPayment(null)} />}
        </div>
    );
};

const PaymentRow: React.FC<{ payment: EnrichedPayment, onViewDetails: () => void }> = ({ payment, onViewDetails }) => {
    const statusClasses: Record<PaymentStatus, string> = {
        [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
        [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
        [PaymentStatus.FAILED]: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
    };

    return (
        <tr className="md:border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-200 group">
            <td data-label="Cliente" className="p-4 user-cell">
                <div className="font-semibold text-gray-900 dark:text-white">{(payment.user as User).name}</div>
            </td>
            <td data-label="Monto" className="p-4 text-gray-600 dark:text-gray-300">{formatCOP(payment.amount)}</td>
            <td data-label="Nivel" className="p-4 text-gray-600 dark:text-gray-300">{(payment.tier as MembershipTier).name}</td>
            <td data-label="Fecha" className="p-4 text-gray-600 dark:text-gray-300">{new Date(payment.date).toLocaleDateString()}</td>
            <td data-label="Estado" className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[payment.status]}`}>
                    {payment.status}
                </span>
            </td>
            <td className="p-4 actions-cell">
                 <button onClick={onViewDetails} className="text-sm font-semibold text-primary hover:underline">Ver Detalles</button>
            </td>
        </tr>
    );
};

const PaymentDetailsModal: React.FC<{ payment: EnrichedPayment; allPayments: EnrichedPayment[]; onClose: () => void }> = ({ payment, allPayments, onClose }) => {
    const statusClasses: Record<PaymentStatus, string> = {
        [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
        [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
        [PaymentStatus.FAILED]: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
    };

    const clientPaymentHistory = useMemo(() => {
        return allPayments
            .filter(p => p.userId === payment.userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allPayments, payment.userId]);

    const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div className="flex justify-between items-center py-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-200 text-right">{value}</dd>
        </div>
    );
    
    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <CurrencyDollarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalles del Pago</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Detalles de la Transacción</h3>
                        <dl className="divide-y divide-gray-200 dark:divide-gray-600">
                             <DetailRow label="ID Transacción" value={<span className="font-mono text-xs">{payment.id}</span>} />
                             <DetailRow label="Fecha" value={new Date(payment.date).toLocaleString()} />
                             <DetailRow label="Monto" value={<span className="font-bold text-lg">{formatCOP(payment.amount)}</span>} />
                             <DetailRow label="Nivel de Membresía" value={(payment.tier as MembershipTier).name} />
                             <DetailRow label="Estado" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[payment.status]}`}>{payment.status}</span>} />
                        </dl>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Historial de Pagos de {(payment.user as User).name}</h3>
                        <div className="max-h-48 overflow-y-auto pr-2">
                            <table className="w-full text-sm">
                                <thead className="text-left text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="py-1 font-medium">Fecha</th>
                                        <th className="py-1 font-medium">Monto</th>
                                        <th className="py-1 font-medium">Nivel</th>
                                        <th className="py-1 font-medium">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientPaymentHistory.map(histPayment => (
                                        <tr key={histPayment.id} className={`border-t border-gray-200 dark:border-gray-600 ${histPayment.id === payment.id ? 'bg-primary/10' : ''}`}>
                                            <td className="py-2">{new Date(histPayment.date).toLocaleDateString()}</td>
                                            <td className="py-2">{formatCOP(histPayment.amount)}</td>
                                            <td className="py-2">{(histPayment.tier as MembershipTier).name}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[histPayment.status]}`}>
                                                    {histPayment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                <div className="flex justify-end space-x-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold transition-colors text-gray-800 dark:text-gray-200">Cerrar</button>
                </div>
            </div>
        </div>
    );
};


export default Payments;
