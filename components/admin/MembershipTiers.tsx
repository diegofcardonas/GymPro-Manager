
import React, { useState, useEffect } from 'react';
import { MembershipTier } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { MOCK_TIERS } from '../../data/membershipTiers';
import { XCircleIcon } from '../icons/XCircleIcon';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
};

const MembershipTiers: React.FC = () => {
    const [tiers, setTiers] = useState<MembershipTier[]>(MOCK_TIERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);

    return (
        <div className="w-full space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-black/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Planes de Membresía</h2>
                    <p className="text-gray-500 font-medium">Configura tu modelo de negocio y beneficios por nivel.</p>
                </div>
                <button onClick={() => { setEditingTier(null); setIsModalOpen(true); }} className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <PlusIcon className="h-5 w-5" />
                    <span>CREAR NIVEL</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tiers.map(tier => (
                    <div key={tier.id} className="bg-white dark:bg-gray-800 rounded-4xl shadow-sm hover:shadow-2xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden transition-all duration-500 group animate-slide-up">
                        <div className="p-8 text-white relative overflow-hidden" style={{ backgroundColor: tier.color }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic italic">{tier.name}</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <p className="text-4xl font-black tracking-tighter italic">{formatCOP(tier.price)}</p>
                                <span className="text-[10px] font-black uppercase opacity-60">/ MES</span>
                            </div>
                        </div>
                        <div className="p-8 flex-grow space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                            {tier.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 border-t border-black/5 flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Duración: {tier.duration} meses</span>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingTier(tier); setIsModalOpen(true); }} className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-primary rounded-2xl transition-all">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => { if(window.confirm('Eliminar nivel?')) setTiers(tiers.filter(t => t.id !== tier.id)); }} className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-rose-500 rounded-2xl transition-all">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <TierModal tier={editingTier} onSave={(t: any) => {
                if(t.id) setTiers(tiers.map(ti => ti.id === t.id ? t : ti));
                else setTiers([...tiers, {...t, id: `tier-${Date.now()}`}]);
                setIsModalOpen(false);
            }} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const TierModal = ({ tier, onSave, onClose }: any) => {
    const [formData, setFormData] = useState(tier || { name: '', price: 0, duration: 1, features: ['Acceso Total'], color: '#3b82f6' });
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-4xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-10 text-white relative overflow-hidden" style={{ backgroundColor: formData.color }}>
                     <h2 className="text-3xl font-black uppercase tracking-tighter italic">{tier ? "Editar Nivel" : "Nuevo Nivel"}</h2>
                     <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-2">Configurador Maestro de Membresías</p>
                </div>
                <div className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Plan</label>
                             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black text-xl italic" placeholder="Ej: Black VIP" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio COP</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duración (Meses)</label>
                            <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color de Marca</label>
                        <div className="flex gap-2">
                            {['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#000000'].map(c => (
                                <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-10 h-10 rounded-full border-4 ${formData.color === c ? 'border-primary ring-2 ring-primary/50' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-10 flex gap-4 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="flex-1 py-5 font-black uppercase text-xs text-gray-400 tracking-widest">Cancelar</button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black shadow-2xl hover:scale-105 transition-all uppercase text-xs tracking-widest">Guardar Nivel</button>
                </div>
            </div>
        </div>
    );
};

export default MembershipTiers;
