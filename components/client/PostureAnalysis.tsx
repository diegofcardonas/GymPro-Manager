
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraIcon } from '../icons/CameraIcon';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { GoogleGenAI } from '@google/genai';

const PostureAnalysis: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const runAnalysis = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analiza la postura y técnica de este ejercicio de gimnasio. Indica errores comunes y cómo mejorar. Responde de forma motivadora y concisa en ${i18n.language}.`;
            
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: 'image/jpeg', data: image.split(',')[1] } }
                    ]
                }
            });
            setAnalysis(res.text || 'No pude analizar la imagen. Intenta otra toma.');
        } catch (e) {
            setAnalysis('Error en el análisis de IA.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('analysis.title')}</h2>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-xl border border-black/5 space-y-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative"
                >
                    {image ? (
                        <img src={image} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-6">
                            <CameraIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('analysis.upload')}</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                </div>

                <button 
                    disabled={!image || loading}
                    onClick={runAnalysis}
                    className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <><SparklesAiIcon className="w-6 h-6" /> {t('analysis.analyzing').split('...')[0]}</>}
                </button>

                {analysis && (
                    <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-3xl border border-primary/20 animate-slide-up">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                            <SparklesAiIcon className="w-4 h-4" /> {t('analysis.feedback')}
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 font-medium">{analysis}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostureAnalysis;
