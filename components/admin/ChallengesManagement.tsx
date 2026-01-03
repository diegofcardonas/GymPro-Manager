
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Challenge } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { useTranslation } from 'react-i18next';
import { XCircleIcon } from '../icons/XCircleIcon';

const ChallengesManagement: React.FC = () => {
    const { t } = useTranslation();
    const { challenges, addChallenge, updateChallenge, deleteChallenge } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

    return (
        <div className="w-full space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-black/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Game Center</h2>
                    <p className="text-gray-500 font-medium">Motiva a tus atletas con desafíos épicos y recompensas.</p>
                </div>
                <button onClick={() => { setEditingChallenge(null); setIsModalOpen(true); }} className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <PlusIcon className="h-5 w-5" />
                    <span>NUEVO RETO</span>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {challenges.map(challenge => (
                    <div key={challenge.id} className="bg-white dark:bg-gray-800/50 rounded-4xl p-8 border border-black/5 dark:border-white/10 shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-500 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity text-emerald-500">
                            <TrophyIcon className="w-48 h-48 rotate-12" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic group-hover:text-emerald-500 transition-colors">{challenge.name}</h3>
                                <p className="text-gray-500 font-medium mt-1 text-sm">{challenge.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingChallenge(challenge); setIsModalOpen(true); }} className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-primary rounded-2xl transition-all hover:scale-110 shadow-sm">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => { if(window.confirm(t('general.confirmDelete'))) deleteChallenge(challenge.id); }} className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-rose-500 rounded-2xl transition-all hover:scale-110 shadow-sm">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10 border-t border-black/5 dark:border-white/5">
                            <div className="flex gap-10">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Meta</p>
                                    <p className="text-xl font-black text-emerald-500 italic">{challenge.goal} {challenge.unit}</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscritos</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white italic">{challenge.participants.length} ATLETAS</p>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border border-black/5">
                                Vence: {new Date(challenge.endDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <ChallengeModal 
                    challenge={editingChallenge} 
                    onSave={(data: any) => {
                        if(data.id) updateChallenge(data);
                        else addChallenge(data);
                        setIsModalOpen(false);
                    }} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

const ChallengeModal = ({ challenge, onSave, onClose }: any) => {
    const [formData, setFormData] = useState(challenge || { name: '', description: '', goal: 100, unit: 'KM', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString() });
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-4xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-10 bg-emerald-600 text-white flex justify-between items-center relative overflow-hidden">
                    <TrophyIcon className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">{challenge ? 'Editar Desafío' : 'Nuevo Desafío'}</h2>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-1">Ingeniería de Motivación Atleta</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>
                <div className="p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre de la Épica</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black text-xl italic" placeholder="Ej: Rey del Peso Muerto" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Objetivo del Reto</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl text-sm font-medium resize-none leading-relaxed" placeholder="Describe lo que deben lograr..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Meta Numérica</label>
                            <input type="number" value={formData.goal} onChange={e => setFormData({...formData, goal: Number(e.target.value)})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad</label>
                            <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black" placeholder="KM / KG / PTS" />
                        </div>
                    </div>
                </div>
                <div className="p-10 flex gap-4 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="flex-1 py-5 font-black uppercase text-xs text-gray-400 tracking-widest">Cancelar</button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-2xl hover:scale-105 transition-all uppercase text-xs tracking-widest">Activar Desafío</button>
                </div>
            </div>
        </div>
    );
};

export default ChallengesManagement;
