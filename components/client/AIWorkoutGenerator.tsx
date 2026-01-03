
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI } from '@google/genai';
import { AuthContext } from '../../context/AuthContext';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { FireIcon } from '../icons/FireIcon';

const AIWorkoutGenerator: React.FC<{ onUseRoutine: (routine: any) => void }> = ({ onUseRoutine }) => {
    const { t, i18n } = useTranslation();
    const { currentUser } = useContext(AuthContext);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedRoutine, setGeneratedRoutine] = useState<any | null>(null);

    const suggestions = [
        "Full body, 30 min, sin equipo",
        "Hipertrofia torso, 60 min, gimnasio completo",
        "Yoga y estiramiento, 20 min para oficina",
        "Enfoque Glúteo, 45 min, solo bandas"
    ];

    const generateRoutine = async (text: string) => {
        if (!text.trim() || !process.env.API_KEY) return;
        setIsLoading(true);
        setGeneratedRoutine(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a workout routine based on: "${text}". 
                Respond ONLY in valid JSON with this structure: 
                {"name": "string", "duration": "string", "intensity": "string", "exercises": [{"name": "string", "sets": number, "reps": "string", "notes": "string"}]}
                Language: ${i18n.language}`,
            });

            const res = await model;
            const cleaned = (res.text || '').replace(/```json|```/g, "").trim();
            const data = JSON.parse(cleaned);
            setGeneratedRoutine(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl space-y-6 animate-fade-in pb-20">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-4xl text-white shadow-2xl relative overflow-hidden">
                <SparklesAiIcon className="absolute -right-6 -top-6 w-40 h-40 opacity-10 rotate-12" />
                <h2 className="text-3xl font-black tracking-tight mb-2">{t('client.aiGenerator.title')}</h2>
                <p className="text-indigo-100 font-medium opacity-80">{t('client.aiGenerator.disclaimer')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-4xl shadow-xl border border-black/5 space-y-6">
                <div className="space-y-4">
                    <textarea 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder={t('client.aiGenerator.promptPlaceholder')}
                        className="w-full p-5 bg-gray-50 dark:bg-gray-900 border-none rounded-3xl focus:ring-2 focus:ring-primary font-medium min-h-[120px] resize-none"
                    />
                    
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(s => (
                            <button 
                                key={s} 
                                onClick={() => { setPrompt(s); generateRoutine(s); }}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-500 hover:bg-primary/10 hover:text-primary transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={isLoading || !prompt.trim()}
                        onClick={() => generateRoutine(prompt)}
                        className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{t('client.aiGenerator.loading')}</span>
                            </div>
                        ) : (
                            <><SparklesAiIcon className="w-6 h-6" /> {t('client.aiGenerator.generate')}</>
                        )}
                    </button>
                </div>

                {generatedRoutine && (
                    <div className="space-y-6 pt-6 border-t border-black/5 animate-scale-in">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{generatedRoutine.name}</h3>
                                <div className="flex gap-4 mt-1">
                                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase"><ClockIcon className="w-4 h-4"/> {generatedRoutine.duration}</span>
                                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase"><FireIcon className="w-4 h-4"/> {generatedRoutine.intensity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {generatedRoutine.exercises.map((ex: any, i: number) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl flex justify-between items-center border border-black/[0.02]">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{ex.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{ex.notes}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary">{ex.sets} x {ex.reps}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => onUseRoutine(generatedRoutine)}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"
                        >
                            {t('client.aiGenerator.addToLog')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIWorkoutGenerator;
