
import React, { useContext, useState, useMemo, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SparklesAiIcon } from '../icons/SparklesAiIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { useTranslation } from 'react-i18next';

const NutritionLog: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, updateUser } = useContext(AuthContext);
    const [mealDescription, setMealDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const nutritionHistory = useMemo(() => {
        return [...(currentUser?.nutritionLogs || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentUser?.nutritionLogs]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setCapturedImage(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleLogMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!mealDescription.trim() && !capturedImage) || !currentUser) return;

        setIsLoading(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        try {
            const contents: any[] = [{ text: `Analiza esta comida${mealDescription ? `: ${mealDescription}` : ''}. Identifica alimentos, estima calorías y macros (proteína, carbohidratos, grasa) y da un consejo breve.` }];
            
            if (capturedImage) {
                contents.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: capturedImage.split(',')[1],
                    },
                });
            }

            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: contents },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            estimatedCalories: { type: Type.STRING },
                            estimatedMacros: {
                                type: Type.OBJECT,
                                properties: { protein: { type: Type.STRING }, carbs: { type: Type.STRING }, fat: { type: Type.STRING } }
                            },
                            suggestion: { type: Type.STRING }
                        }
                    }
                }
            });

            const analysis = JSON.parse(res.text);
            const newLog = {
                id: `nut-${Date.now()}`,
                date: new Date().toISOString(),
                mealDescription: mealDescription || "Comida analizada por foto",
                imageUrl: capturedImage || undefined,
                aiAnalysis: analysis
            };

            const updatedLogs = [newLog, ...(currentUser.nutritionLogs || [])];
            updateUser({ ...currentUser, nutritionLogs: updatedLogs });
            setMealDescription('');
            setCapturedImage(null);
        } catch (err) {
            alert("Error al analizar la comida con IA.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full max-w-5xl space-y-6 pb-12">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-2xl text-white shadow-lg shadow-green-500/20">
                    <SparklesAiIcon className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Nutrición IA Vision</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                     <form onSubmit={handleLogMeal} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-black/5 dark:border-white/5 space-y-6">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all relative group overflow-hidden"
                        >
                            {capturedImage ? (
                                <>
                                    <img src={capturedImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <CameraIcon className="w-8 h-8 text-white" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <CameraIcon className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="text-sm font-bold text-gray-500">Subir foto del plato</p>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-400 uppercase mb-2">Descripción (Opcional)</label>
                            <textarea
                                value={mealDescription}
                                onChange={e => setMealDescription(e.target.value)}
                                rows={3}
                                placeholder="Añade detalles para mayor precisión..."
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><SparklesAiIcon className="w-5 h-5"/> Analizar con IA</>}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {nutritionHistory.length > 0 ? nutritionHistory.map(log => (
                        <div key={log.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-md overflow-hidden flex flex-col md:flex-row group">
                            {log.imageUrl && <img src={log.imageUrl} className="w-full md:w-48 object-cover aspect-square md:aspect-auto" />}
                            <div className="p-6 flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{new Date(log.date).toLocaleString()}</p>
                                <h4 className="text-lg font-bold mb-4">"{log.mealDescription}"</h4>
                                {log.aiAnalysis && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { l: 'Prot.', v: log.aiAnalysis.estimatedMacros.protein, c: '#8b5cf6' },
                                            { l: 'Carb.', v: log.aiAnalysis.estimatedMacros.carbs, c: '#3b82f6' },
                                            { l: 'Grasa', v: log.aiAnalysis.estimatedMacros.fat, c: '#10b981' }
                                        ].map(m => (
                                            <div key={m.l} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">{m.l}</p>
                                                <p className="font-bold text-gray-800 dark:text-white" style={{color: m.c}}>{m.v}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-4 text-sm text-gray-500 italic">"{log.aiAnalysis?.suggestion}"</p>
                            </div>
                        </div>
                    )) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                            <p className="text-gray-400 font-medium">Aún no has registrado ninguna comida.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionLog;
