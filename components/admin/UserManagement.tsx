
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { User, Role, MembershipStatus, SortConfig, FitnessLevel, MembershipTier } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { DashboardFilter } from '../AdminDashboard';
import { MOCK_TIERS } from '../../data/membershipTiers';
import { XCircleIcon } from '../icons/XCircleIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../shared/Skeleton';
import { EmptyState } from '../shared/EmptyState';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { UserDetailsModal } from './UserDetailsModal';
import { IdentificationIcon } from '../icons/IdentificationIcon';
import { FireIcon } from '../icons/FireIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { NumberInputWithButtons } from '../shared/NumberInputWithButtons';

const ITEMS_PER_PAGE = 10;

type UserTab = Role.CLIENT | Role.TRAINER | 'OPERATIONAL' | 'HEALTH';

const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o && o[k] != null) ? o[k] : null, obj);

interface UserManagementProps {
    initialFilter: DashboardFilter | null;
    onFilterClear: () => void;
    initialUser?: User | null;
}

const UserManagement: React.FC<UserManagementProps> = ({ initialFilter, onFilterClear, initialUser }) => {
    const { t } = useTranslation();
    const { users, addUser, updateUser, deleteUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<UserTab>(Role.CLIENT);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'joinDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const [statusFilter, setStatusFilter] = useState<MembershipStatus | null>(null);
    const [trainerFilter, setTrainerFilter] = useState<string | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        id?: string;
        isBulk?: boolean;
    }>({ isOpen: false });

    useEffect(() => {
        if (initialUser) setViewingUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [activeTab]);

    useEffect(() => {
        if (initialFilter) {
            if (initialFilter.type === 'role') {
                setActiveTab(initialFilter.value as UserTab);
                setStatusFilter(null);
                setTrainerFilter(null);
            } else if (initialFilter.type === 'status') {
                setActiveTab(Role.CLIENT);
                setStatusFilter(initialFilter.value);
                setTrainerFilter(null);
            } else if (initialFilter.type === 'unassigned') {
                setActiveTab(Role.CLIENT);
                setStatusFilter(null);
                setTrainerFilter('unassigned');
            }
            setCurrentPage(1);
        }
    }, [initialFilter]);

    const trainers = useMemo(() => users.filter(u => u.role === Role.TRAINER), [users]);
    
    const usersForTab = useMemo(() => {
        if (activeTab === 'OPERATIONAL') {
            return users.filter(u => [Role.RECEPTIONIST, Role.GENERAL_MANAGER, Role.GROUP_INSTRUCTOR].includes(u.role));
        }
        if (activeTab === 'HEALTH') {
            return users.filter(u => [Role.NUTRITIONIST, Role.PHYSIOTHERAPIST].includes(u.role));
        }
        return users.filter(u => u.role === activeTab);
    }, [users, activeTab]);

    const filteredUsers = useMemo(() => {
        return usersForTab.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = !statusFilter || (user.role === Role.CLIENT && user.membership.status === statusFilter);
            let trainerMatch = true;
            if (trainerFilter) {
                if (trainerFilter === 'unassigned') {
                    trainerMatch = user.role === Role.CLIENT && (!user.trainerIds || user.trainerIds.length === 0);
                } else {
                    trainerMatch = user.role === Role.CLIENT && !!user.trainerIds?.includes(trainerFilter);
                }
            }
            return searchMatch && statusMatch && trainerMatch;
        });
    }, [usersForTab, searchTerm, statusFilter, trainerFilter]);

    const sortedUsers = useMemo(() => {
        let sortableUsers = [...filteredUsers];
        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                const aValue = getNestedValue(a, sortConfig.key);
                const bValue = getNestedValue(b, sortConfig.key);
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableUsers;
    }, [filteredUsers, sortConfig]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedUsers, currentPage]);

    const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);

    const requestSort = (key: SortConfig['key']) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />;
    };

    const handleOpenModal = (user: User | null) => { setSelectedUser(user); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedUser(null); };
    const handleSaveUser = (user: User) => { if (user.id && user.id !== '') updateUser(user); else addUser({ ...user, id: `u-${Date.now()}` }); handleCloseModal(); };
    const handleDeleteUser = (userId: string, e?: React.MouseEvent) => { e?.stopPropagation(); setDeleteConfirmation({ isOpen: true, id: userId, isBulk: false }); };
    const confirmDelete = () => { if (deleteConfirmation.isBulk) { selectedUserIds.forEach(id => deleteUser(id)); setSelectedUserIds([]); } else if (deleteConfirmation.id) deleteUser(deleteConfirmation.id); setDeleteConfirmation({ isOpen: false }); };

    const handleTabClick = (tab: UserTab) => { setActiveTab(tab); setCurrentPage(1); setStatusFilter(null); setTrainerFilter(null); onFilterClear(); };
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.checked) setSelectedUserIds(paginatedUsers.map(u => u.id)); else setSelectedUserIds([]); };
    const handleSelectRow = (userId: string) => { setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };

    const headers = activeTab === Role.CLIENT ? [
        { key: 'name', label: t('general.user') }, { key: 'membership.status', label: 'Estado' },
        { key: 'trainerIds', label: 'Entrenador' }, { key: 'joinDate', label: 'Alta' },
        { key: 'membership.endDate', label: 'Vence' }, { key: 'actions', label: t('general.actions'), sortable: false }
    ] : [
        { key: 'name', label: t('general.user') }, { key: 'role', label: 'Rol' },
        { key: 'phone', label: 'Teléfono' }, { key: 'joinDate', label: 'Alta' }, 
        { key: 'actions', label: t('general.actions'), sortable: false }
    ];

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-4xl ring-1 ring-black/5 dark:ring-white/10 w-full overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-2xl w-full lg:w-auto overflow-x-auto">
                        {[Role.CLIENT, Role.TRAINER, 'OPERATIONAL', 'HEALTH'].map((tab) => (
                             <button 
                                key={tab} 
                                onClick={() => handleTabClick(tab as UserTab)} 
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                {tab === Role.CLIENT ? t('nav.users') : tab === Role.TRAINER ? t('enums.Role.TRAINER') : tab}
                             </button>
                        ))}
                    </div>
                     <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        {selectedUserIds.length > 0 && (
                             <button onClick={() => setDeleteConfirmation({ isOpen: true, isBulk: true })} className="flex-1 lg:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-all text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <TrashIcon className="w-4 h-4" />
                                <span>{selectedUserIds.length}</span>
                            </button>
                        )}
                        <button onClick={() => handleOpenModal(null)} className="flex-1 lg:flex-none px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <PlusIcon className="h-4 w-4" />
                            <span>{t('general.add')}</span>
                        </button>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('general.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary px-4 py-2.5 text-sm font-medium" />
                     {activeTab === Role.CLIENT && (
                        <select value={statusFilter || ''} onChange={e => setStatusFilter(e.target.value as MembershipStatus || null)} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary px-4 py-2.5 text-sm font-bold">
                            <option value="">Todos los Estados</option>
                            {Object.values(MembershipStatus).map(s => <option key={s} value={s}>{t(`enums.MembershipStatus.${s}`)}</option>)}
                        </select>
                     )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left responsive-table">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-header-group">
                        <tr>
                            <th className="p-4 w-12 text-center"><input type="checkbox" onChange={handleSelectAll} checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0} className="rounded-md" /></th>
                            {headers.map(header => (
                                <th key={header.key} className="p-4">
                                     {header.sortable === false ? header.label : <button onClick={() => requestSort(header.key as any)} className="flex items-center gap-1"><span>{header.label}</span>{getSortIcon(header.key)}</button>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}><td colSpan={headers.length + 1} className="p-4"><Skeleton height={60} /></td></tr>
                            ))
                        ) : paginatedUsers.length > 0 ? (
                             paginatedUsers.map(user => <UserRow key={user.id} user={user} trainers={trainers} onEdit={handleOpenModal} onDelete={handleDeleteUser} onSelect={handleSelectRow} isSelected={selectedUserIds.includes(user.id)} onViewDetails={setViewingUser} isClientTab={activeTab === Role.CLIENT} />)
                        ) : (
                            <tr><td colSpan={headers.length + 1} className="p-20 text-center"><EmptyState title={t('general.noData')} /></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-900/20">
                <p>Mostrando {paginatedUsers.length} de {sortedUsers.length}</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-black/5 disabled:opacity-30">Anterior</button>
                    <span className="px-4 py-2 bg-primary text-white rounded-xl shadow-md">{currentPage} / {totalPages || 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-black/5 disabled:opacity-30">Siguiente</button>
                </div>
            </div>
             
             {isModalOpen && <UserModal user={selectedUser} activeTab={activeTab} trainers={trainers} onSave={handleSaveUser} onClose={handleCloseModal} />}
             {viewingUser && <UserDetailsModal user={viewingUser} allUsers={users} onClose={() => setViewingUser(null)} onEdit={(u) => { setViewingUser(null); handleOpenModal(u); }} />}
             <ConfirmationModal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })} onConfirm={confirmDelete} title={t('general.warning')} message={t('general.confirmDelete')} isDangerous />
        </div>
    );
};

const UserRow: React.FC<{ user: User; trainers: User[]; onEdit: (user: User) => void; onDelete: (userId: string, e?: React.MouseEvent) => void; onSelect: (userId: string) => void; isSelected: boolean; onViewDetails: (user: User) => void; isClientTab: boolean; }> = ({ user, trainers, onEdit, onDelete, onSelect, isSelected, onViewDetails, isClientTab }) => {
    const { t } = useTranslation();
    const trainerNames = useMemo(() => trainers.filter(t => user.trainerIds?.includes(t.id)).map(t => t.name.split(' ')[0]).join(', ') || '-', [trainers, user.trainerIds]);
    const statusClasses: Record<MembershipStatus, string> = {
        [MembershipStatus.ACTIVE]: 'bg-green-500/10 text-green-500',
        [MembershipStatus.EXPIRED]: 'bg-red-500/10 text-red-500',
        [MembershipStatus.PENDING]: 'bg-amber-500/10 text-amber-500',
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200 group animate-slide-up">
            <td className="p-4 text-center hidden md:table-cell"><input type="checkbox" checked={isSelected} onChange={() => onSelect(user.id)} className="rounded-lg border-gray-300" /></td>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-black/5" />
                    <div>
                        <button onClick={() => onViewDetails(user)} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors text-left text-sm">{user.name}</button>
                        <p className="text-[10px] text-gray-400 font-bold tracking-tighter truncate max-w-[120px]">{user.email}</p>
                    </div>
                </div>
            </td>
            {isClientTab ? (
                <>
                    <td className="p-4"><span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg ${statusClasses[user.membership.status]}`}>{user.membership.status}</span></td>
                    <td className="p-4 text-gray-500 font-bold text-xs">{trainerNames}</td>
                    <td className="p-4 text-gray-400 font-medium text-xs">{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-800 dark:text-gray-200 font-black text-xs">{new Date(user.membership.endDate).toLocaleDateString()}</td>
                </>
            ) : (
                 <>
                    <td className="p-4"><span className="px-2 py-1 bg-violet-500/10 text-violet-500 text-[9px] font-black uppercase rounded-lg">{t(`enums.Role.${user.role}`)}</span></td>
                    <td className="p-4 text-gray-500 font-bold text-xs">{user.phone}</td>
                    <td className="p-4 text-gray-400 font-medium text-xs">{new Date(user.joinDate).toLocaleDateString()}</td>
                </>
            )}
            <td className="p-4">
                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(user); }} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:text-primary transition-all"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(user.id, e); }} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:text-red-500 transition-all"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </td>
        </tr>
    );
};

const UserModal: React.FC<{ user: User | null, activeTab: string, trainers: User[], onSave: (u: User) => void, onClose: () => void }> = ({ user, activeTab, trainers, onSave, onClose }) => {
    const { t } = useTranslation();
    const [activeFormTab, setActiveFormTab] = useState<'personal' | 'membership' | 'fitness'>('personal');
    const [formData, setFormData] = useState<User>(() => {
        if (user) return { ...user };
        return {
            id: '',
            name: '',
            email: '',
            phone: '',
            role: activeTab === 'OPERATIONAL' ? Role.RECEPTIONIST : (activeTab === Role.TRAINER ? Role.TRAINER : Role.CLIENT),
            avatarUrl: `https://ui-avatars.com/api/?name=New+User&background=random`,
            joinDate: new Date().toISOString(),
            membership: { 
                status: MembershipStatus.ACTIVE, 
                startDate: new Date().toISOString(), 
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                tierId: 'tier_basic'
            },
            trainerIds: [],
            fitnessLevel: FitnessLevel.BEGINNER,
            gender: 'Prefiero no decirlo'
        } as User;
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...(prev as any)[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
             <div className="bg-white dark:bg-gray-800 rounded-4xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8 bg-primary text-white flex justify-between items-center relative overflow-hidden">
                    <UserCircleIcon className="absolute -right-6 -top-6 w-32 h-32 opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">{user ? t('general.edit') : t('general.create')} {t('general.user')}</h2>
                        <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-widest mt-1">Configuración Maestro de Perfil</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                <div className="flex bg-gray-50 dark:bg-gray-900/50 p-2 border-b border-black/5">
                    {[
                        { id: 'personal', label: t('admin.userEditor.tabs.personal'), icon: <UserCircleIcon className="w-4 h-4"/> },
                        { id: 'membership', label: t('admin.userEditor.tabs.membership'), icon: <IdentificationIcon className="w-4 h-4"/> },
                        { id: 'fitness', label: t('admin.userEditor.tabs.fitness'), icon: <FireIcon className="w-4 h-4"/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveFormTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFormTab === tab.id ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeFormTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Completo</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Teléfono</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Género</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner">
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                    <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeFormTab === 'membership' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Rol de Sistema</label>
                                    <select name="role" value={formData.role} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner">
                                        {Object.values(Role).map(r => <option key={r} value={r}>{t(`enums.Role.${r}`)}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado de Membresía</label>
                                    <select name="membership.status" value={formData.membership.status} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner">
                                        {Object.values(MembershipStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('admin.userEditor.fields.tier')}</label>
                                    <select name="membership.tierId" value={formData.membership.tierId} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner">
                                        {MOCK_TIERS.map(tier => <option key={tier.id} value={tier.id}>{tier.name} - {tier.price}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('admin.userEditor.fields.expiration')}</label>
                                    <input type="date" name="membership.endDate" value={formData.membership.endDate.split('T')[0]} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeFormTab === 'fitness' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 text-center block">Altura (cm)</label>
                                    <NumberInputWithButtons value={formData.height || 170} onChange={v => setFormData({...formData, height: v as number})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 text-center block">Peso (kg)</label>
                                    <NumberInputWithButtons value={formData.weight || 70} onChange={v => setFormData({...formData, weight: v as number})} step={0.5} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 text-center block">Nivel</label>
                                    <select name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary text-[10px] font-black uppercase text-center shadow-inner">
                                        {Object.values(FitnessLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('admin.userEditor.fields.goals')}</label>
                                <textarea name="fitnessGoals" value={formData.fitnessGoals || ''} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm min-h-[100px] shadow-inner font-medium" placeholder="Bajar de peso, ganar masa muscular..." />
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-black/5 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Cancelar</button>
                    <button onClick={handleSave} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">Guardar Usuario-Cliente</button>
                </div>
             </div>
        </div>
    )
};

export default UserManagement;
