
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

const ITEMS_PER_PAGE = 10;

type UserTab = Role.CLIENT | Role.TRAINER | 'OPERATIONAL' | 'HEALTH';

const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o && o[k] != null) ? o[k] : null, obj);

const exportToCSV = (users: User[], headers: {key: string, label: string}[], filename: string, allTrainers: User[]) => {
    const csvRows = [];
    csvRows.push(headers.map(h => h.label).join(','));
    for (const user of users) {
        const values = headers.map(header => {
            let cellValue;
            if (header.key === 'trainerIds' && user.role === Role.CLIENT) {
                const trainerNames = allTrainers
                    .filter(t => (user.trainerIds || []).includes(t.id))
                    .map(t => t.name)
                    .join('; ');
                cellValue = trainerNames;
            } else {
                cellValue = getNestedValue(user, header.key);
            }
            const value = cellValue !== null ? `"${String(cellValue).replace(/"/g, '""')}"` : '""';
            return value;
        });
        csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

interface UserManagementProps {
    initialFilter: DashboardFilter | null;
    onFilterClear: () => void;
    onViewUserDetails: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ initialFilter, onFilterClear, onViewUserDetails }) => {
    const { t } = useTranslation();
    const { users, addUser, updateUser, deleteUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<UserTab>(Role.CLIENT);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'joinDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [statusFilter, setStatusFilter] = useState<MembershipStatus | null>(null);
    const [trainerFilter, setTrainerFilter] = useState<string | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        id?: string;
        isBulk?: boolean;
    }>({ isOpen: false });

    // Simulate loading delay
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
            setCurrentPage(1); // Reset to first page when filter changes
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
    const handleSaveUser = (user: User) => { if (user.id && user.id !== '') updateUser(user); else addUser({ ...user, id: String(Date.now() + Math.random()) }); handleCloseModal(); };
    
    const handleDeleteUser = (userId: string, e?: React.MouseEvent) => { 
        e?.stopPropagation();
        setDeleteConfirmation({ isOpen: true, id: userId, isBulk: false });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.isBulk) {
            selectedUserIds.forEach(id => deleteUser(id));
            setSelectedUserIds([]);
        } else if (deleteConfirmation.id) {
            deleteUser(deleteConfirmation.id);
        }
        setDeleteConfirmation({ isOpen: false });
    };

    const handleTabClick = (tab: UserTab) => { setActiveTab(tab); setCurrentPage(1); setStatusFilter(null); setTrainerFilter(null); onFilterClear(); };
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.checked) setSelectedUserIds(paginatedUsers.map(u => u.id)); else setSelectedUserIds([]); };
    const handleSelectRow = (userId: string) => { setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
    // This function is now hooked up to the modal via state
    const handleDeleteSelected = () => { 
        if (selectedUserIds.length === 0) return;
        setDeleteConfirmation({ isOpen: true, isBulk: true });
    };

    const headers = activeTab === Role.CLIENT ? [
        { key: 'name', label: t('admin.userManagement.headers.user') }, { key: 'membership.status', label: t('admin.userManagement.headers.status') },
        { key: 'trainerIds', label: t('admin.userManagement.headers.trainers') }, { key: 'joinDate', label: t('admin.userManagement.headers.joinDate') },
        { key: 'membership.endDate', label: t('admin.userManagement.headers.expiryDate') }, { key: 'actions', label: t('admin.userManagement.headers.actions'), sortable: false }
    ] : [
        { key: 'name', label: t('admin.userManagement.headers.user') }, { key: 'role', label: t('admin.userManagement.headers.role') },
        { key: 'phone', label: t('admin.userManagement.headers.phone') }, { key: 'joinDate', label: t('admin.userManagement.headers.joinDate') }, 
        { key: 'actions', label: t('admin.userManagement.headers.actions'), sortable: false }
    ];

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                        {[Role.CLIENT, Role.TRAINER, 'OPERATIONAL', 'HEALTH'].map((tab) => (
                             <button 
                                key={tab}
                                onClick={() => handleTabClick(tab as UserTab)} 
                                className={`flex-1 lg:flex-initial px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                            >
                                {t(`admin.userManagement.${tab === Role.CLIENT ? 'clients' : tab === Role.TRAINER ? 'trainers' : tab === 'OPERATIONAL' ? 'staffOperational' : 'staffHealth'}`)}
                             </button>
                        ))}
                    </div>
                     <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button onClick={() => exportToCSV(sortedUsers, headers.filter(h => h.key !== 'actions'), `gympro_${activeTab.toLowerCase()}_export.csv`, trainers)} className="flex-1 lg:flex-none px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors text-white text-sm">{t('admin.userManagement.exportCsv')}</button>
                        <button onClick={() => handleOpenModal(null)} className="flex-1 lg:flex-none px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-primary-foreground text-sm">
                            <PlusIcon className="h-5 w-5" />
                            <span>{t('admin.userManagement.addUser', { type: activeTab === Role.CLIENT ? t('admin.userManagement.clients') : activeTab === Role.TRAINER ? t('admin.userManagement.trainers') : 'User' })}</span>
                        </button>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('admin.userManagement.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary px-4 py-2 text-gray-800 dark:text-gray-200" />
                     {activeTab === Role.CLIENT && <>
                        <select value={statusFilter || ''} onChange={e => setStatusFilter(e.target.value as MembershipStatus || null)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary px-4 py-2 text-gray-800 dark:text-gray-200">
                            <option value="">{t('admin.userManagement.allStatuses')}</option>
                            {Object.values(MembershipStatus).map(s => <option key={s} value={s}>{t(`statuses.membership.${s}`)}</option>)}
                        </select>
                        <select value={trainerFilter || ''} onChange={e => setTrainerFilter(e.target.value || null)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary px-4 py-2 text-gray-800 dark:text-gray-200">
                            <option value="">{t('admin.userManagement.allTrainers')}</option>
                            <option value="unassigned">{t('admin.userManagement.unassigned')}</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                     </>}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left responsive-table">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 hidden md:table-header-group">
                        <tr>
                            <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0} className="rounded" /></th>
                            {headers.map(header => (
                                <th key={header.key} className="p-4 font-semibold">
                                     {header.sortable === false ? header.label : <button onClick={() => requestSort(header.key as any)} className="flex items-center space-x-1"><span>{header.label}</span>{getSortIcon(header.key)}</button>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            // Skeleton Loading State
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="p-4"><Skeleton width={20} height={20} /></td>
                                    <td className="p-4 flex items-center gap-3">
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <div className="space-y-2">
                                            <Skeleton width={150} height={16} />
                                            <Skeleton width={100} height={12} />
                                        </div>
                                    </td>
                                    <td className="p-4"><Skeleton width={80} height={24} className="rounded-full" /></td>
                                    <td className="p-4"><Skeleton width={120} height={16} /></td>
                                    <td className="p-4"><Skeleton width={100} height={16} /></td>
                                    <td className="p-4"><Skeleton width={100} height={16} /></td>
                                    <td className="p-4 flex gap-2"><Skeleton width={32} height={32} /><Skeleton width={32} height={32} /></td>
                                </tr>
                            ))
                        ) : paginatedUsers.length > 0 ? (
                             paginatedUsers.map(user => <UserRow key={user.id} user={user} trainers={trainers} onEdit={handleOpenModal} onDelete={handleDeleteUser} onSelect={handleSelectRow} isSelected={selectedUserIds.includes(user.id)} onViewDetails={onViewUserDetails} isClientTab={activeTab === Role.CLIENT} />)
                        ) : (
                            <tr>
                                <td colSpan={headers.length + 1} className="p-8">
                                     <EmptyState 
                                        icon={<UserGroupIcon className="w-12 h-12" />}
                                        title="No users found"
                                        description="Try adjusting your search or filters to find what you're looking for."
                                        action={<button onClick={onFilterClear} className="mt-4 text-primary font-semibold hover:underline">Clear Filters</button>}
                                     />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             {/* Pagination Controls */}
             <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <p>{t('admin.userManagement.showingUsers', { start: (paginatedUsers.length > 0 ? (currentPage-1)*ITEMS_PER_PAGE+1 : 0), end: (currentPage-1)*ITEMS_PER_PAGE+paginatedUsers.length, total: sortedUsers.length })}</p>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">{t('admin.userManagement.previous')}</button>
                     <span>{t('admin.userManagement.page', { current: currentPage, total: totalPages || 1 })}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">{t('admin.userManagement.next')}</button>
                </div>
            </div>
             {isModalOpen && <UserModal user={selectedUser} activeTab={activeTab} trainers={trainers} onSave={handleSaveUser} onClose={handleCloseModal} />}
             
             <ConfirmationModal 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
                onConfirm={confirmDelete}
                title={t('general.warning')}
                message={deleteConfirmation.isBulk 
                    ? t('admin.userManagement.confirmDeleteSelected', { count: selectedUserIds.length }) 
                    : t('admin.userManagement.confirmDelete')}
                confirmText={t('general.delete')}
                isDangerous
            />
        </div>
    );
};

const UserRow: React.FC<{ user: User; trainers: User[]; onEdit: (user: User) => void; onDelete: (userId: string, e?: React.MouseEvent) => void; onSelect: (userId: string) => void; isSelected: boolean; onViewDetails: (user: User) => void; isClientTab: boolean; }> = ({ user, trainers, onEdit, onDelete, onSelect, isSelected, onViewDetails, isClientTab }) => {
     const { t } = useTranslation();
    const trainerNames = useMemo(() => trainers.filter(t => user.trainerIds?.includes(t.id)).map(t => t.name).join(', ') || t('admin.userDetailsModal.none'), [trainers, user.trainerIds, t]);
    
    const statusClasses: Record<MembershipStatus, string> = {
        [MembershipStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
        [MembershipStatus.EXPIRED]: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
        [MembershipStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    };

    return (
        <tr className="md:border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200 group">
            <td className="p-4 hidden md:table-cell"><input type="checkbox" checked={isSelected} onChange={() => onSelect(user.id)} className="rounded border-gray-300 text-primary focus:ring-primary"/></td>
            <td data-label={t('admin.userManagement.headers.user')} className="p-4 flex items-center space-x-3 user-cell">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
                <div>
                    <button onClick={() => onViewDetails(user)} className="font-semibold text-gray-900 dark:text-white text-left hover:text-primary transition-colors">{user.name}</button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
            </td>
            {isClientTab ? (
                <>
                    <td data-label={t('admin.userManagement.headers.status')} className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[user.membership.status]}`}>{t(`statuses.membership.${user.membership.status}`)}</span></td>
                    <td data-label={t('admin.userManagement.headers.trainers')} className="p-4 text-gray-600 dark:text-gray-300 text-sm">{trainerNames}</td>
                    <td data-label={t('admin.userManagement.headers.joinDate')} className="p-4 text-gray-600 dark:text-gray-300 text-sm">{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td data-label={t('admin.userManagement.headers.expiryDate')} className="p-4 text-gray-600 dark:text-gray-300 text-sm">{new Date(user.membership.endDate).toLocaleDateString()}</td>
                </>
            ) : (
                 <>
                    <td data-label={t('admin.userManagement.headers.role')} className="p-4 text-gray-600 dark:text-gray-300 capitalize text-sm">{t(`roles.${user.role}`)}</td>
                    <td data-label={t('admin.userManagement.headers.phone')} className="p-4 text-gray-600 dark:text-gray-300 text-sm">{user.phone}</td>
                    <td data-label={t('admin.userManagement.headers.joinDate')} className="p-4 text-gray-600 dark:text-gray-300 text-sm">{new Date(user.joinDate).toLocaleDateString()}</td>
                </>
            )}
            <td data-label={t('admin.userManagement.headers.actions')} className="p-4 actions-cell">
                <div className="flex space-x-2 justify-end">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(user); }} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(user.id, e); }} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                </div>
            </td>
        </tr>
    );
};

const UserModal: React.FC<{ user: User | null; activeTab: UserTab; trainers: User[]; onSave: (user: User) => void; onClose: () => void }> = ({ user, activeTab, trainers, onSave, onClose }) => {
    const { t } = useTranslation();
    const defaultUser: User = { id: '', name: '', email: '', phone: '', avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`, role: activeTab === 'OPERATIONAL' ? Role.RECEPTIONIST : activeTab === 'HEALTH' ? Role.NUTRITIONIST : activeTab, joinDate: new Date().toISOString(), membership: { status: MembershipStatus.PENDING, startDate: new Date().toISOString(), endDate: '', tierId: MOCK_TIERS[0].id }, trainerIds: [], assignedRoutines: [], progressNotes: [] } as User;
    const [formData, setFormData] = useState<User>(user || defaultUser);
    
    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({ ...defaultUser, id: '', avatarUrl: `https://picsum.photos/seed/${Date.now()}/200` });
        }
    }, [user, activeTab]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
         const { name, value } = e.target;
         setFormData(prev => ({ ...prev, [name]: value })); 
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 animate-scale-in">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{user ? t('admin.userManagement.editUserModalTitle') : t('admin.userManagement.addUserModalTitle')}</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('general.name')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('general.email')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('general.phone')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white">{t('general.cancel')}</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">{t('general.save')}</button>
                </div>
             </div>
        </div>
    )
};

export default UserManagement;
