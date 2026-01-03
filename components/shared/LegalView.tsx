
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BackArrowIcon } from '../icons/BackArrowIcon';

interface LegalViewProps {
    type: 'privacy' | 'terms';
    onBack: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
    const { t } = useTranslation();

    const sections = type === 'privacy' ? [
        { title: t('legal.privacy.section1Title'), content: t('legal.privacy.section1Content') },
        { title: t('legal.privacy.section2Title'), content: t('legal.privacy.section2Content') },
        { title: t('legal.privacy.section3Title'), content: t('legal.privacy.section3Content') },
        { title: t('legal.privacy.section4Title'), content: t('legal.privacy.section4Content') },
    ] : [
        { title: t('legal.terms.section1Title'), content: t('legal.terms.section1Content') },
        { title: t('legal.terms.section2Title'), content: t('legal.terms.section2Content') },
        { title: t('legal.terms.section3Title'), content: t('legal.terms.section3Content') },
        { title: t('legal.terms.section4Title'), content: t('legal.terms.section4Content') },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-4xl shadow-xl border border-black/5 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-black/5 flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                >
                    <BackArrowIcon className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {type === 'privacy' ? t('legal.privacy.title') : t('legal.terms.title')}
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        {t('legal.privacy.lastUpdate')}
                    </p>
                </div>
            </div>

            <div className="p-8 md:p-12 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {type === 'privacy' && (
                    <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic border-l-4 border-primary pl-4">
                        {t('legal.privacy.intro')}
                    </p>
                )}

                {sections.map((section, index) => (
                    <div key={index} className="space-y-3">
                        <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">
                                {index + 1}
                            </span>
                            {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-black/5 flex justify-center">
                <button 
                    onClick={onBack}
                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest"
                >
                    He leído y entiendo
                </button>
            </div>
        </div>
    );
};

export default LegalView;
