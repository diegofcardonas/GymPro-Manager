
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { SendIcon } from '../icons/SendIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

const SupportModal: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, toggleReportModal, addToast, addNotification } = useContext(AuthContext);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        category: 'technical' as any,
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.message.trim()) return;

        // Simular envío a backend/administrador
        setIsSubmitted(true);
        
        // Notificar al admin (simulado)
        addNotification({
            userId: '1', // Admin ID
            title: `Nuevo Ticket de Soporte: ${formData.category}`,
            message: `${currentUser?.name} reportó: ${formData.subject}`,
            type: 'ALERT' as any
        });

        setTimeout(() => {
            addToast(t('general.success'), 'success');
            toggleReportModal();
        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-4xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                {!isSubmitted ? (
                    <>
                        <div className="p-8 bg-primary text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">{t('footer.support')}</h2>
                                <p className="text-primary-foreground/70 text-xs font-bold uppercase mt-1">GymPro Help Center</p>
                            </div>
                            <button onClick={toggleReportModal} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Categoría</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['technical', 'billing', 'equipment', 'suggestion'].map(cat => (
                                        <button 
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({...formData, category: cat})}
                                            className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${formData.category === cat ? 'bg-primary border-primary text-white' : 'bg-gray-50 dark:bg-gray-900 border-black/5 dark:border-white/5 text-gray-500'}`}
                                        >
                                            {t(`support.categories.${cat}`, { defaultValue: cat })}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Asunto</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    placeholder="¿Qué sucede?"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Detalles</label>
                                <textarea 
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    placeholder="Describe tu problema con detalle..."
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm min-h-[120px] shadow-inner font-medium resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                <SendIcon className="w-5 h-5" /> Enviar Reporte
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="p-12 text-center space-y-6 flex flex-col items-center animate-fade-in">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center shadow-inner">
                            <CheckCircleIcon className="w-12 h-12" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Reporte Recibido</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Nuestro equipo técnico revisará tu caso en las próximas 24 horas.</p>
                        </div>
                        <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 animate-loading-bar"></div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 2.5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default SupportModal;
