
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { useTranslation } from 'react-i18next';
import { XCircleIcon } from '../icons/XCircleIcon';

const Announcements: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    return (
        <div className="w-full space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Panel de Avisos</h2>
                    <p className="text-gray-500 font-medium">Comunicados oficiales para la comunidad y el staff.</p>
                </div>
                <button onClick={() => { setEditingAnnouncement(null); setIsModalOpen(true); }} className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <PlusIcon className="h-5 w-5" />
                    <span>PUBLICAR</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {announcements.length > 0 ? announcements.map(announcement => (
                    <div key={announcement.id} className="bg-white dark:bg-gray-800/50 rounded-4xl p-8 border border-black/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-8 group hover:shadow-2xl transition-all duration-500 animate-slide-up">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                            <MegaphoneIcon className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">{announcement.title}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingAnnouncement(announcement); setIsModalOpen(true); }} className="p-3 bg-white dark:bg-gray-700 text-gray-500 hover:text-primary rounded-2xl shadow-sm transition-all hover:scale-110">
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { if(window.confirm(t('general.confirmDelete'))) deleteAnnouncement(announcement.id); }} className="p-3 bg-white dark:bg-gray-700 text-gray-500 hover:text-rose-500 rounded-2xl shadow-sm transition-all hover:scale-110">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-3xl">{announcement.content}</p>
                            <div className="mt-6 flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <span>Publicado: {new Date(announcement.timestamp).toLocaleDateString()}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                                <span>Autor: Admin Central</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-4xl">
                         <MegaphoneIcon className="w-20 h-20 text-gray-200 mb-6" />
                         <p className="text-xl font-black text-gray-300 uppercase tracking-widest italic">Silencio en el Muro</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AnnouncementModal 
                    announcement={editingAnnouncement} 
                    onSave={(data: any) => {
                        if(data.id) updateAnnouncement(data);
                        else addAnnouncement({...data, authorId: currentUser?.id || '1'});
                        setIsModalOpen(false);
                    }} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

const AnnouncementModal = ({ announcement, onSave, onClose }: any) => {
    const [formData, setFormData] = useState(announcement || { title: '', content: '' });
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-4xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-10 bg-gray-900 text-white flex justify-between items-center relative overflow-hidden">
                    <MegaphoneIcon className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">{announcement ? 'Editar Aviso' : 'Nuevo Aviso'}</h2>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-1">Editor de Boletín Corporativo</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>
                <div className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título del Anuncio</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl font-black text-xl italic" placeholder="¡Atención Atletas!" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cuerpo del Comunicado</label>
                        <textarea rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-6 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl text-sm font-medium resize-none leading-relaxed" placeholder="Escribe los detalles aquí..." />
                    </div>
                </div>
                <div className="p-10 flex gap-4 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="flex-1 py-5 font-black uppercase text-xs text-gray-400 tracking-widest">Descartar</button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black shadow-2xl hover:scale-105 transition-all uppercase text-xs tracking-widest">Publicar Ahora</button>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
