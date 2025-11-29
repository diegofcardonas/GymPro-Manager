import React, { useMemo } from 'react';
import { User, Role, MembershipStatus } from '../../types';
import { MOCK_TIERS } from '../../data/membershipTiers';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { useTranslation } from 'react-i18next';

interface UserDetailsModalProps {
    user: User;
    allUsers: User[];
    onClose: () => void;
    onEdit: (user: User) => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{title}</h3>
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{value || 'N/A'}</p>
    </div>
);

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, allUsers, onClose, onEdit }) => {
    const { t } = useTranslation();
    const tier = useMemo(() => MOCK_TIERS.find(t => t.id === user.membership.tierId), [user]);
    const trainers = useMemo(() => allUsers.filter(u => u.role === Role.TRAINER), [allUsers]);
    const clients = useMemo(() => allUsers.filter(u => u.role === Role.CLIENT), [allUsers]);

    const assignedTrainers = useMemo(() => trainers.filter(t => user.trainerIds?.includes(t.id)).map(t => t.name).join(', '), [trainers, user.trainerIds]);
    const clientCount = useMemo(() => clients.filter(c => c.trainerIds?.includes(user.id)).length, [clients, user.id]);

    const calculateAge = (birthDate?: string): number | undefined => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const displayAge = user.birthDate ? calculateAge(user.birthDate) : user.age;

    const roleBg = user.role === Role.CLIENT ? 'bg-blue-500' : user.role === Role.TRAINER ? 'bg-purple-500' : 'bg-gray-500';
    
    const statusClasses: Record<MembershipStatus, string> = {
        [MembershipStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
        [MembershipStatus.EXPIRED]: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
        [MembershipStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                             <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${roleBg} capitalize`}>{t(`roles.${user.role}`)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XCircleIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <DetailSection title={t('admin.userDetailsModal.keyInfo')}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {user.role === Role.CLIENT ? (
                                <>
                                    <DetailItem label={t('admin.userDetailsModal.status')} value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[user.membership.status]}`}>{t(`statuses.membership.${user.membership.status}`)}</span>} />
                                    <DetailItem label={t('admin.userDetailsModal.tier')} value={tier?.name} />
                                </>
                            ) : (
                                <DetailItem label={t('admin.userDetailsModal.status')} value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[user.membership.status]}`}>{t(`statuses.membership.${user.membership.status}`)}</span>}/>
                            )}
                             {user.role === Role.TRAINER && <DetailItem label={t('admin.userDetailsModal.clientLoad')} value={t('admin.userDetailsModal.clientsCount', { count: clientCount })} />}
                            <DetailItem label={t('admin.userDetailsModal.memberSince')} value={new Date(user.joinDate).toLocaleDateString()} />
                             {user.role === Role.CLIENT && <DetailItem label={t('admin.userDetailsModal.expiresOn')} value={new Date(user.membership.endDate).toLocaleDateString()} />}
                        </div>
                         {user.role === Role.CLIENT && <DetailItem label={t('admin.userDetailsModal.assignedTrainers')} value={assignedTrainers || t('admin.userDetailsModal.none')} />}
                    </DetailSection>

                    <DetailSection title={t('admin.userDetailsModal.personalInfo')}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <DetailItem label={t('admin.userDetailsModal.phone')} value={user.phone} />
                            <DetailItem label={t('admin.userDetailsModal.gender')} value={user.gender ? t(`genders.${user.gender}`) : undefined} />
                            <DetailItem label={t('admin.userDetailsModal.age')} value={displayAge ? t('admin.userDetailsModal.ageYears', { age: displayAge }) : undefined} />
                            <DetailItem label={t('general.birthDate')} value={user.birthDate ? new Date(user.birthDate).toLocaleDateString() : undefined} />
                        </div>
                    </DetailSection>
                    
                    {user.role === Role.CLIENT && (
                         <DetailSection title={t('admin.userDetailsModal.healthFitness')}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <DetailItem label={t('admin.userDetailsModal.fitnessLevel')} value={user.fitnessLevel ? t(`fitnessLevels.${user.fitnessLevel}`) : undefined} />
                                <DetailItem label={t('admin.userDetailsModal.height')} value={user.height ? t('admin.userDetailsModal.heightCm', { height: user.height }) : undefined} />
                                <DetailItem label={t('admin.userDetailsModal.weight')} value={user.weight ? t('admin.userDetailsModal.weightKg', { weight: user.weight }) : undefined} />
                            </div>
                            <DetailItem label={t('admin.userDetailsModal.fitnessGoals')} value={<p className="whitespace-pre-wrap">{user.fitnessGoals}</p>} />
                            <DetailItem label={t('admin.userDetailsModal.dietaryPreferences')} value={<p className="whitespace-pre-wrap">{user.dietaryPreferences}</p>} />
                             <DetailItem label={t('admin.userDetailsModal.medicalConditions')} value={<p className="whitespace-pre-wrap">{user.medicalConditions}</p>} />
                        </DetailSection>
                    )}
                    
                    {user.role !== Role.CLIENT && user.skills && (
                        <DetailSection title={t('admin.userDetailsModal.professionalInfo')}>
                             <DetailItem label={t('admin.userDetailsModal.skills')} value={user.skills} />
                        </DetailSection>
                    )}

                    <DetailSection title={t('admin.userDetailsModal.emergencyContact')}>
                         <div className="grid grid-cols-2 gap-4">
                             <DetailItem label={t('admin.userDetailsModal.name')} value={user.emergencyContact?.name} />
                             <DetailItem label={t('admin.userDetailsModal.phone')} value={user.emergencyContact?.phone} />
                         </div>
                    </DetailSection>
                </div>
                <div className="flex justify-end space-x-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold">{t('admin.userDetailsModal.close')}</button>
                    <button onClick={() => onEdit(user)} className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold text-primary-foreground flex items-center space-x-2">
                        <PencilIcon className="h-4 w-4"/>
                        <span>{t('admin.userDetailsModal.editUser')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};