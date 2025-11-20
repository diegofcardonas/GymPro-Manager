
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

const Announcements: React.FC = () => {
    const { currentUser, announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const handleAddNew = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
            deleteAnnouncement(id);
        }
    };

    const handleSave = (announcement: Omit<Announcement, 'id' | 'timestamp' | 'authorId'> & { id?: string }) => {
        if (!currentUser) return;
        
        if (announcement.id) {
            updateAnnouncement({ ...announcement, timestamp: new Date().toISOString(), authorId: currentUser.id } as Announcement);
        } else {
            addAnnouncement({ ...announcement, authorId: currentUser.id });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full max-w-4xl space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Anuncios</h2>
                <button onClick={handleAddNew} className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-primary-foreground">
                    <PlusIcon className="h-5 w-5" />
                    <span>Nuevo Anuncio</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {announcements.map(announcement => (
                        <div key={announcement.id} className="p-4 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{announcement.content}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    Publicado el {new Date(announcement.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-4">
                                <button onClick={() => handleEdit(announcement)} className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => handleDelete(announcement.id)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <AnnouncementModal
                    announcement={editingAnnouncement}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

const AnnouncementModal: React.FC<{
    announcement: Announcement | null;
    onSave: (announcement: Omit<Announcement, 'id' | 'timestamp' | 'authorId'> & { id?: string }) => void;
    onClose: () => void;
}> = ({ announcement, onSave, onClose }) => {
    const [formData, setFormData] = useState(announcement || { title: '', content: '' });

    useEffect(() => {
        if (announcement) {
            setFormData(announcement);
        } else {
            setFormData({ title: '', content: '' });
        }
    }, [announcement]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg animate-scale-in">
                <h2 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">{announcement ? 'Editar' : 'Nuevo'} Anuncio</h2>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">Título</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full input-style" required />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium">Contenido</label>
                        <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows={5} className="mt-1 block w-full input-style" required />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold text-primary-foreground">Guardar Anuncio</button>
                </div>
                 {/* FIX: Removed non-standard "jsx" prop from style tag. */}
                 <style>{`
                    .input-style {
                        background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; color: #111827; padding: 0.5rem 0.75rem;
                    }
                    .dark .input-style {
                        background-color: #374151; border-color: #4b5563; color: #f9fafb;
                    }
                    .input-style:focus { --tw-ring-color: hsl(var(--primary)); border-color: hsl(var(--primary)); }
                `}</style>
            </form>
        </div>
    );
};

export default Announcements;
