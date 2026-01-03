
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Role } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login, register } = useContext(AuthContext);
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const role = Role.CLIENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      let result: string | void;
      if (isLoginView) {
        result = await login(email, password);
      } else {
        if (!name || !email || !password) {
          setError(t('auth.errorMissingFields'));
          setIsLoading(false);
          return;
        }
        result = await register({ name, email, password, role });
      }

      if (result) {
        setError(result);
      }
    } catch (err) {
      setError(t('auth.errorUnexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  }
  
  const fillDemoCredentials = (demoEmail: string, demoPass: string) => {
      setEmail(demoEmail);
      setPassword(demoPass);
      setIsLoginView(true);
      setError(null);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 animate-fade-in p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 animate-slide-up">
        <div className="flex justify-end">
             <LanguageSwitcher />
        </div>
        <div className="text-center">
          <LogoIcon className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300">
            {isLoginView ? t('common.appName') : t('auth.signup')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            {isLoginView ? t('auth.login') : t('auth.signup')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLoginView}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg text-center animate-pulse">
                {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center px-4 py-2.5 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition duration-300 disabled:opacity-70"
          >
            {isLoading ? "..." : (isLoginView ? t('auth.login') : t('auth.signup'))}
          </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                    {isLoginView ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                    <button onClick={toggleView} className="font-bold text-primary hover:underline ml-1">
                        {isLoginView ? t('auth.signup') : t('auth.login')}
                    </button>
                </span>
            </div>
        </div>
        
        {isLoginView && (
            <div className="space-y-2">
                <p className="text-xs text-center text-gray-400 uppercase tracking-wide">{t('auth.demoAccess')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <button onClick={() => fillDemoCredentials('admin@gympro.com', 'password123')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">Admin</button>
                    <button onClick={() => fillDemoCredentials('samantha.w@example.com', 'password123')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">Client</button>
                    <button onClick={() => fillDemoCredentials('chris.v@gympro.com', 'password123')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">Trainer</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
