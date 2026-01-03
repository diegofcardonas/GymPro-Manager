
import React, { useRef, useEffect, useState } from 'react';
import { User, MembershipStatus, MembershipTier } from '../../types';
import { useTranslation } from 'react-i18next';

interface MembershipCardProps {
    user: User;
    tier?: MembershipTier;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ user, tier }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const CARD_WIDTH = 856;
    const CARD_HEIGHT = 540;

    const [dynamicToken, setDynamicToken] = useState<string>(Math.random().toString(36).substring(7));
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setDynamicToken(Math.random().toString(36).substring(7).toUpperCase());
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high-resolution canvas
        const dpr = window.devicePixelRatio || 1;
        canvas.width = CARD_WIDTH * dpr;
        canvas.height = CARD_HEIGHT * dpr;
        canvas.style.width = `${CARD_WIDTH / 2}px`;
        canvas.style.height = `${CARD_HEIGHT / 2}px`;
        ctx.scale(dpr, dpr);

        const drawCard = (avatarImage: HTMLImageElement | null) => {
            // Card Background
            const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
            gradient.addColorStop(0, '#1e3a8a'); // dark blue
            gradient.addColorStop(1, '#064e3b'); // dark teal
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
            
            // Brand Logo
            ctx.font = 'bold 48px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText('GymPro', 50, 80);
            ctx.font = '24px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Manager', 55, 115);

            // Draw Avatar or Fallback
            if (avatarImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(150, 290, 80, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatarImage, 70, 210, 160, 160);
                ctx.restore();
                
                 // Avatar Border
                ctx.beginPath();
                ctx.arc(150, 290, 84, 0, Math.PI * 2, true);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 4;
                ctx.stroke();
            } else {
                // Fallback initial based avatar
                ctx.save();
                ctx.beginPath();
                ctx.arc(150, 290, 80, 0, Math.PI * 2, true);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fill();
                ctx.font = 'bold 70px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                ctx.fillText(initials, 150, 290);
                ctx.restore();
            }
            
            // Text Info
            ctx.fillStyle = 'white';
            ctx.font = 'bold 48px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(user.name, 280, 260);

            if (tier) {
                ctx.font = 'bold 32px sans-serif';
                ctx.fillStyle = tier.color;
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 5;
                ctx.fillText(tier.name, 280, 305);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            ctx.font = '24px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(`${t('general.user')}: ${user.id}`, 280, 345);

            // Status Badge
            const status = user.membership.status;
            const statusInfo = {
                [MembershipStatus.ACTIVE]: { text: 'ACTIVO', color: '#10B981' },
                [MembershipStatus.EXPIRED]: { text: 'VENCIDO', color: '#EF4444' },
                [MembershipStatus.PENDING]: { text: 'PENDIENTE', color: '#F59E0B' },
            };
            ctx.fillStyle = statusInfo[status].color;
            ctx.fillRect(280, 380, 150, 40);
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(statusInfo[status].text, 355, 400);

            // Expiration Date
            ctx.textAlign = 'right';
            ctx.font = '24px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(`${t('client.dashboard.endDate')}: ${new Date(user.membership.endDate).toLocaleDateString()}`, CARD_WIDTH - 50, CARD_HEIGHT - 50);

            // Simulated QR Code area
            const qrSize = 120;
            const qrX = CARD_WIDTH - 170;
            const qrY = 50;
            ctx.fillStyle = 'white';
            ctx.fillRect(qrX, qrY, qrSize, qrSize);
            const seed = dynamicToken.charCodeAt(0) + dynamicToken.charCodeAt(dynamicToken.length - 1);
            ctx.fillStyle = 'black';
            const cellSize = qrSize / 10;
            for(let i=0; i<10; i++) {
                for(let j=0; j<10; j++) {
                    if (Math.sin(seed * i * j + timeLeft) > 0) {
                        ctx.fillRect(qrX + i*cellSize, qrY + j*cellSize, cellSize, cellSize);
                    }
                }
            }
            ctx.fillRect(qrX, qrY, 30, 30);
            ctx.fillRect(qrX + qrSize - 30, qrY, 30, 30);
            ctx.fillRect(qrX, qrY + qrSize - 30, 30, 30);
            ctx.fillStyle = 'white';
            ctx.fillRect(qrX + 5, qrY + 5, 20, 20);
            ctx.fillRect(qrX + qrSize - 25, qrY + 5, 20, 20);
            ctx.fillRect(qrX + 5, qrY + qrSize - 25, 20, 20);
            ctx.fillStyle = 'black';
            ctx.fillRect(qrX + 10, qrY + 10, 10, 10);
            ctx.fillRect(qrX + qrSize - 20, qrY + 10, 10, 10);
            ctx.fillRect(qrX + 10, qrY + qrSize - 20, 10, 10);
        }

        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                // Add unique query param to bypass standard browser cache that may lack CORS headers
                const cacheBuster = url.includes('?') ? '&' : '?';
                const finalUrl = `${url}${cacheBuster}cors_fix=${Date.now()}`;
                
                img.crossOrigin = 'anonymous'; 
                img.onload = () => resolve(img);
                img.onerror = () => {
                    const errMessage = `Failed to fetch avatar image from ${url}. Drawing fallback.`;
                    console.error(errMessage);
                    reject(new Error(errMessage));
                };
                img.src = finalUrl;
            });
        };

        const initDrawing = async () => {
            try {
                const avatar = await loadImage(user.avatarUrl);
                drawCard(avatar);
            } catch (error) {
                drawCard(null);
            }
        };

        initDrawing();

    }, [user, tier, dynamicToken, timeLeft, t]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `GymPro_Card_${user.name.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <div className="w-full max-w-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tarjeta Digital</h2>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-4xl shadow-xl inline-block w-full max-w-[90%] mx-auto border border-black/5">
                <div className="flex justify-center mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        CÓDIGO DE ACCESO DINÁMICO
                    </span>
                </div>
                
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                    <div 
                        className="h-full bg-primary transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / 30) * 100}%` }}
                    />
                </div>
                
                <canvas ref={canvasRef} className="rounded-3xl shadow-2xl mx-auto max-w-full h-auto"></canvas>
                
                <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                     SE ACTUALIZA EN {timeLeft}s
                </p>
            </div>

            <button
                onClick={handleDownload}
                className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                DESCARGAR CARNET
            </button>
        </div>
    );
};

export default MembershipCard;
