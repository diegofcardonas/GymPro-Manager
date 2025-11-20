
import React, { useState, useEffect } from 'react';
import { MembershipTier } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { MOCK_TIERS } from '../../data/membershipTiers';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const MembershipTiers: React.FC = () => {
    const [tiers, setTiers] = useState<MembershipTier[]>(MOCK_TIERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);

    const handleAddNew = () => {
        setEditingTier(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tier: MembershipTier) => {
        setEditingTier(tier);
        setIsModalOpen(true);
    };

    const handleDelete = (tierId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este nivel?')) {
            setTiers(tiers.filter(t => t.id !== tierId));
        }
    };

    const handleSave = (tier: MembershipTier) => {
        if (tier.id) {
            setTiers(tiers.map(t => t.id === tier.id ? tier : t));
        } else {
            setTiers([...tiers, { ...tier, id: `tier${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Niveles de Membresía</h2>
                <button onClick={handleAddNew} className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-primary-foreground">
                    <PlusIcon className="h-5 w-5" />
                    <span>Añadir Nuevo Nivel</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tiers.map(tier => (
                    <TierCard key={tier.id} tier={tier} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
            </div>

            {isModalOpen && (
                <TierModal
                    tier={editingTier}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

const TierCard: React.FC<{ tier: MembershipTier, onEdit: (tier: MembershipTier) => void, onDelete: (id: string) => void }> = ({ tier, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg flex flex-col overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="p-6 text-white" style={{ backgroundColor: tier.color }}>
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="text-3xl font-extrabold mt-2">{formatCOP(tier.price)}<span className="text-lg font-medium">/mes</span></p>
                <p className="text-sm opacity-80">{tier.duration} mes(es) de compromiso</p>
            </div>
            <div className="p-6 flex-grow">
                <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                <button onClick={() => onEdit(tier)} className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => onDelete(tier.id)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
            </div>
        </div>
    );
};

const TierModal: React.FC<{ tier: MembershipTier | null, onSave: (tier: MembershipTier) => void, onClose: () => void }> = ({ tier, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<MembershipTier, 'id'> & { id?: string }>(
        tier || { name: '', price: 0, duration: 1, features: [], color: '#3b82f6' }
    );
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        if (tier) {
            setFormData(tier);
        } else {
            setFormData({ name: '', price: 0, duration: 1, features: [], color: '#3b82f6' });
        }
    }, [tier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
            setNewFeature('');
        }
    };
    
    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as MembershipTier);
    };

    const colors = ['#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#ec4899', '#14b8a6'];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
                <h2 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">Nivel {tier ? 'Editar' : 'Añadir'}</h2>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nombre del Nivel</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Precio (COP/mes)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full input-style" required />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Duración (meses)</label>
                        <input type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" className="mt-1 block w-full input-style" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Color de Acento</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {colors.map(color => (
                                <button type="button" key={color} onClick={() => setFormData(prev => ({ ...prev, color }))} className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary' : ''}`} style={{backgroundColor: color}}></button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Características</label>
                        <div className="space-y-2 mt-1">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={feature} readOnly className="block w-full input-style bg-gray-200/50 dark:bg-gray-700/50" />
                                    <button type="button" onClick={() => handleRemoveFeature(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Añadir nueva característica" className="block w-full input-style" />
                            <button type="button" onClick={handleAddFeature} className="px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-semibold hover:bg-primary/20">Añadir</button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold text-primary-foreground">Guardar Nivel</button>
                </div>
             {/* FIX: Removed non-standard "jsx" prop from style tag. */}
             <style>{`
                .input-style {
                    background-color: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    color: #111827;
                    padding: 0.5rem 0.75rem;
                }
                .dark .input-style {
                    background-color: #4b5563;
                    border-color: #6b7280;
                    color: #f9fafb;
                }
                .input-style:focus {
                    --tw-ring-color: hsl(var(--primary));
                    border-color: hsl(var(--primary));
                }
            `}</style>
            </form>
        </div>
    );
};

export default MembershipTiers;
