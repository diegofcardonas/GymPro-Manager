
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './icons/LogoIcon';

const SplashScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 text-white">
      <div className="text-center animate-fade-in-up">
        <LogoIcon className="w-24 h-24 mx-auto mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300">
          {t('general.appName')}
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 font-medium">
          {t('splash.tagline')}
        </p>
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('splash.loading')}</span>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
