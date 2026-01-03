
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './icons/LogoIcon';
import { AuthContext } from '../context/AuthContext';

interface FooterProps {
    onNavigate?: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const { toggleReportModal } = useContext(AuthContext);
    const currentYear = new Date().getFullYear();

    const handleLegalClick = (e: React.MouseEvent, view: string) => {
        e.preventDefault();
        if (onNavigate) onNavigate(view);
    };

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <LogoIcon className="w-6 h-6" />
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-200">GymPro Manager</span>
                    </div>
                    
                    <div className="flex space-x-6 mb-4 md:mb-0">
                        <button 
                            onClick={(e) => handleLegalClick(e, 'privacy')}
                            className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors font-medium"
                        >
                            {t('footer.privacy')}
                        </button>
                        <button 
                            onClick={(e) => handleLegalClick(e, 'terms')}
                            className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors font-medium"
                        >
                            {t('footer.terms')}
                        </button>
                        <button 
                            onClick={toggleReportModal}
                            className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors font-medium"
                        >
                            {t('footer.support')}
                        </button>
                    </div>

                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter">
                            <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Instagram">
                            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
                            </svg>
                        </a>
                    </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 mt-6 pt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {currentYear} GymPro Manager. {t('general.appName')}.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
