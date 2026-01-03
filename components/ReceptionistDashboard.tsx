
import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Role, MembershipStatus, NotificationType } from '../types';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './icons/LogoIcon';
import { IdentificationIcon } from './icons/IdentificationIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CameraIcon } from './icons/CameraIcon';
import Footer from './Footer';
import { UserProfileMenu } from './shared/UserProfileMenu';
import { PointOfSale } from './admin/PointOfSale';
import TaskBoard from './shared/TaskBoard';

const QRScanner: React.FC<{ onScan: (userId: string) => void, onClose: () => void }> = ({ onScan, onClose }) => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                setError(t('receptionist.cameraError'));
            }
        };
        startCamera();
        const interval = setInterval(() => {
            if(Math.random() > 0.8) onScan('2');
        }, 2000);
        return () => {
            if(stream) stream.getTracks().forEach(track => track.stop());
            clearInterval(interval);
        };
    }, [onScan, t]);

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-square bg-gray-800 rounded-3xl overflow-hidden border-4 border-primary/50 shadow-2xl">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                        <p className="text-white font-medium">{error}</p>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                            <div className="w-full h-full border-2 border-white/50 rounded-xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/50 animate-pulse"></div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <p className="text-white/70 mt-6 text-sm font-medium animate-pulse">{t('receptionist.qrTip')}</p>
            <button onClick={onClose} className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all">{t('general.cancel')}</button>
        </div>
    );
};

const ReceptionistDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, logout, users, addNotification } = useContext(AuthContext);
    const [activeView, setActiveView] = useState<'check-in' | 'users' | 'pos' | 'tasks'>('check-in');
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [lastCheckIn, setLastCheckIn] = useState<User | null>(null);

    const handleCheckIn = (user: User) => {
        if (user.membership.status !== MembershipStatus.ACTIVE) {
            alert(`Alert: ${user.name} membership is ${user.membership.status}`);
            return;
        }
        setLastCheckIn(user);
        setShowScanner(false);
        addNotification({ userId: user.id, title: t('receptionist.success'), message: t('receptionist.welcome', { name: user.name }), type: NotificationType.SUCCESS });
        setTimeout(() => setLastCheckIn(null), 5000);
    };

    const filteredUsers = useMemo(() => users.filter(u => u.role === Role.CLIENT && u.name.toLowerCase().includes(searchTerm.toLowerCase())), [users, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-10 h-10" />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">{t('receptionist.title')}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            {['check-in', 'users', 'pos', 'tasks'].map(v => (
                                <button key={v} onClick={() => setActiveView(v as any)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeView === v ? 'bg-white dark:bg-gray-900 text-primary shadow-sm' : 'text-gray-500'}`}>
                                    {t(`receptionist.nav.${v === 'check-in' ? 'checkIn' : v === 'pos' ? 'pos' : v === 'tasks' ? 'tasks' : 'users'}`)}
                                </button>
                            ))}
                        </nav>
                        {currentUser && <UserProfileMenu user={currentUser} onSettings={() => {}} onLogout={logout} />}
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8 max-w-4xl">
                {activeView === 'check-in' && (
                    <div className="space-y-6">
                        {lastCheckIn && (
                            <div className="bg-green-500 text-white p-6 rounded-3xl shadow-xl animate-scale-in flex items-center gap-6">
                                <img src={lastCheckIn.avatarUrl} className="w-20 h-20 rounded-full border-4 border-white/30" />
                                <div>
                                    <h2 className="text-2xl font-black">{t('receptionist.success')}</h2>
                                    <p className="text-lg opacity-90">{t('receptionist.welcome', { name: lastCheckIn.name })}</p>
                                </div>
                                <CheckCircleIcon className="w-16 h-16 ml-auto opacity-50" />
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-black/5 dark:border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <IdentificationIcon className="w-32 h-32" />
                            </div>
                            <h2 className="text-2xl font-bold mb-6">{t('receptionist.nav.checkIn')}</h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <input type="text" placeholder={t('admin.userManagement.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 bg-gray-100 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary text-lg" />
                                    <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                </div>
                                <button onClick={() => setShowScanner(true)} className="px-6 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                    <CameraIcon className="w-6 h-6" />
                                    <span>{t('receptionist.scanQR')}</span>
                                </button>
                            </div>

                            {searchTerm && (
                                <div className="mt-6 divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="py-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <img src={user.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-bold">{user.name}</p>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.membership.status === MembershipStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {user.membership.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleCheckIn(user)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white rounded-xl text-sm font-bold transition-all">{t('receptionist.nav.checkIn')}</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeView === 'pos' && <PointOfSale />}
                {activeView === 'tasks' && <TaskBoard />}
            </main>
            <Footer />
            {showScanner && <QRScanner onScan={(id) => { const u = users.find(u => u.id === id); if(u) handleCheckIn(u); }} onClose={() => setShowScanner(false)} />}
        </div>
    );
};

export default ReceptionistDashboard;
