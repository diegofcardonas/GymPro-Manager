
import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { EquipmentItem, EquipmentStatus } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { useTranslation } from 'react-i18next';
import { WrenchIcon } from '../icons/WrenchIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

const EquipmentManagement: React.FC = () => {
    const { t } = useTranslation();
    const { equipment, incidents, addEquipment, updateEquipment, deleteEquipment, resolveIncident } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);

    const unresolvedIncidents = useMemo(() => incidents.filter(i => !i.isResolved), [incidents]);
    
    return (
        <div className="w-full space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-black/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Activos e Inventario</h2>
                    <p className="text-gray-500 font-medium">Control de estado físico y mantenimiento de la maquinaria.</p>
                </div>
                <button onClick={() => { setEditingEquipment(null); setIsModalOpen(true); }} className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <PlusIcon className="h-5 w-5" />
                    <span>AÑADIR EQUIPO</span>
                </button>
            </div>
            
            {unresolvedIncidents.length > 0 && (
                 <div className="bg-rose-500 rounded-4xl p-1 shadow-2xl">
                    <div className="bg-white dark:bg-gray-900 rounded-[calc(2rem-2px)] p-8">
                        <h3 className="text-xl font-black text-rose-500 mb-6 flex items-center gap-3 uppercase tracking-tighter italic">
                            <ExclamationTriangleIcon className="w-6 h-6 animate-pulse" /> Alertas de Mantenimiento ({unresolvedIncidents.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unresolvedIncidents.map(incident => {
                                const item = equipment.find(e => e.id === incident.equipmentId);
                                return (
                                    <div key={incident.id} className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-3xl flex justify-between items-center border border-rose-100 dark:border-rose-900/30 group animate-slide-up">
                                        <div className="flex-1 mr-4">
                                            <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-tight">{item?.name || 'Desconocido'}</p>
                                            <p className="text-sm text-gray-600 dark:text-rose-200 mt-1 italic font-medium">"{incident.description}"</p>
                                        </div>
                                        <button onClick={() => resolveIncident(incident.id)} className="px-6 py-2.5 text-[10px] font-black text-white bg-rose-500 rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-all uppercase tracking-widest">Resolver</button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {equipment.map(item => (
                    <EquipmentCard key={item.id} item={item} onEdit={(i) => { setEditingEquipment(i); setIsModalOpen(true); }} onDelete={deleteEquipment} />
                ))}
            </div>
            
            {isModalOpen && <EquipmentModal equipment={editingEquipment} onSave={(i: any) => { if(i.id) updateEquipment(i); else addEquipment({...i, id: `eq-${Date.now()}`}); setIsModalOpen(false); }} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const EquipmentCard: React.FC<{ item: EquipmentItem; onEdit: (i: EquipmentItem) => void; onDelete: (id: string) => void }> = ({ item, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const statusData = {
        [EquipmentStatus.OPERATIONAL]: { label: 'OPERATIVO', color: 'bg-emerald-500', text: 'text-emerald-500', icon: CheckCircleIcon },
        [EquipmentStatus.IN_REPAIR]: { label: 'EN REPARACIÓN', color: 'bg-amber-500', text: 'text-amber-500', icon: WrenchIcon },
        [EquipmentStatus.OUT_OF_SERVICE]: { label: 'FUERA DE SERVICIO', color: 'bg-rose-500', text: 'text-rose-500', icon: ExclamationTriangleIcon },
    };
    const StatusIcon = statusData[item.status].icon;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-4xl p-8 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col overflow-hidden">
            <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${statusData[item.status].text}`}>
                <StatusIcon className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusData[item.status].color} text-white shadow-lg`}>
                    {statusData[item.status].label}
                </span>
                <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">{item.type}</p>
            </div>

            <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> {item.location}
                </p>
            </div>

            <div className="mt-10 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                <button onClick={() => onEdit(item)} className="p-4 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-primary rounded-2xl transition-all hover:scale-110">
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => { if(window.confirm(t('general.confirmDelete'))) onDelete(item.id); }} className="p-4 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-rose-500 rounded-2xl transition-all hover:scale-110">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const EquipmentModal = ({ equipment, onSave, onClose }: any) => {
    const [formData, setFormData] = useState(equipment || { name: '', type: 'Cardio', location: 'Piso 1', status: EquipmentStatus.OPERATIONAL });
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-4xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-10 bg-primary text-white relative overflow-hidden">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">{equipment ? "Editar Equipo" : "Nuevo Equipo"}</h2>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Auditoría Física de Activos</p>
                </div>
                <div className="p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Comercial del Equipo</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-bold focus:ring-2 focus:ring-primary" placeholder="Ej: Power Rack V3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ubicación</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-bold focus:ring-2 focus:ring-primary" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-bold">
                                {['Cardio', 'Strength', 'Free Weights', 'Machine'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado de Operación</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(EquipmentStatus).map(s => (
                                <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`py-4 px-2 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${formData.status === s ? 'bg-primary border-primary text-white shadow-xl' : 'bg-gray-50 dark:bg-gray-800 border-black/5 text-gray-400'}`}>
                                    {s.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-10 flex gap-4 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="flex-1 py-5 font-black uppercase text-xs text-gray-400 tracking-widest">Cancelar</button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black shadow-2xl hover:scale-105 transition-all uppercase text-xs tracking-widest">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentManagement;
