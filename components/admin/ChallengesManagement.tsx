
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Challenge } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

const ChallengesManagement: React.FC = () => {
    const { challenges, addChallenge, updateChallenge, deleteChallenge } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

    const handleAddNew = () => {
        setEditingChallenge(null);
        setIsModalOpen(true);
    };

    const handleEdit = (challenge: Challenge) => {
        setEditingChallenge(challenge);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este desafío?')) {
            deleteChallenge(id);
        }
    };

    const handleSave = (challenge: Omit<Challenge, 'id' | 'participants'> & { id?: string }) => {
        if (challenge.id) {
            updateChallenge(challenge as Challenge);
        } else {
            addChallenge(challenge);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionar Desafíos</h2>
                <button onClick={handleAddNew} className="btn-primary">
                    <PlusIcon className="h-5 w-5" />
                    <span>Nuevo Desafío</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div>
                                <h3 className="font-semibold text-primary">{challenge.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{challenge.description}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    Meta: {challenge.goal} {challenge.unit} | Participantes: {challenge.participants.length}
                                </p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 self-end sm:self-center">
                                <button onClick={() => handleEdit(challenge)} className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => handleDelete(challenge.id)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {isModalOpen && (
                <ChallengeModal
                    challenge={editingChallenge}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
             {/* FIX: Removed non-standard "jsx" prop from style tag. */}
             <style>{`
                .btn-primary { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: hsl(var(--primary) / 0.9); }
            `}</style>
        </div>
    );
};

const ChallengeModal: React.FC<{
    challenge: Challenge | null;
    onSave: (challenge: Omit<Challenge, 'id' | 'participants'> & { id?: string }) => void;
    onClose: () => void;
}> = ({ challenge, onSave, onClose }) => {
    const [formData, setFormData] = useState(challenge || { name: '', description: '', goal: 1, unit: '', startDate: '', endDate: '' });

    useEffect(() => {
        if (challenge) {
            setFormData(challenge);
        } else {
            setFormData({ name: '', description: '', goal: 1, unit: '', startDate: '', endDate: '' });
        }
    }, [challenge]);

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
                <h2 className="text-2xl font-bold p-6 border-b">{challenge ? 'Editar' : 'Nuevo'} Desafío</h2>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nombre</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full input-style" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Meta</label>
                            <input type="number" name="goal" value={formData.goal} onChange={handleChange} min="1" className="mt-1 block w-full input-style" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Unidad</label>
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="p. ej., km, entrenamientos, kg" className="mt-1 block w-full input-style" required />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Fecha de Inicio</label>
                            <input type="date" name="startDate" value={formData.startDate.split('T')[0]} onChange={handleChange} className="mt-1 block w-full input-style" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fecha de Fin</label>
                            <input type="date" name="endDate" value={formData.endDate.split('T')[0]} onChange={handleChange} className="mt-1 block w-full input-style" required />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-t">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Desafío</button>
                </div>
                {/* FIX: Removed non-standard "jsx" prop from style tag. */}
                <style>{`
                    .input-style { background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; color: #111827; padding: 0.5rem 0.75rem; }
                    .dark .input-style { background-color: #374151; border-color: #4b5563; color: #f9fafb; }
                    .input-style:focus { --tw-ring-color: hsl(var(--primary)); border-color: hsl(var(--primary)); }
                    .btn-primary { padding: 0.5rem 1rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
                    .btn-primary:hover { background-color: hsl(var(--primary) / 0.9); }
                    .btn-secondary { padding: 0.5rem 1rem; background-color: #e5e7eb; color: #1f2937; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
                    .dark .btn-secondary { background-color: #4b5563; color: #f9fafb; }
                `}</style>
            </form>
        </div>
    );
};

export default ChallengesManagement;
