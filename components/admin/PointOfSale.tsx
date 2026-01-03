
import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Role, PaymentStatus, Product } from '../../types';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '../icons/PlusIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { IdentificationIcon } from '../icons/IdentificationIcon';

const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

export const PointOfSale: React.FC = () => {
    const { t } = useTranslation();
    const { users, addPayment, products, updateProduct } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);

    const clients = useMemo(() => users.filter(u => u.role === Role.CLIENT), [users]);
    
    const filteredClients = useMemo(() => {
        if (!searchTerm) return [];
        return clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [clients, searchTerm]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            alert("No hay stock disponible de este producto.");
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    alert("Has alcanzado el límite de stock disponible.");
                    return prev;
                }
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                if (newQty > item.product.stock) {
                    alert("Stock insuficiente.");
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [cart]);

    const handleCheckout = () => {
        if (!selectedUser) {
            alert(t('pos.selectUserAlert'));
            return;
        }
        if (cart.length === 0) return;

        const payment = {
            userId: selectedUser,
            amount: total,
            date: new Date().toISOString(),
            status: PaymentStatus.COMPLETED,
            tierId: 'POS_SALE',
            description: `Compra POS: ${cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`
        };

        // Reducir stock
        cart.forEach(item => {
            updateProduct({
                ...item.product,
                stock: item.product.stock - item.quantity
            });
        });

        addPayment(payment);
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setCart([]);
            setSelectedUser(null);
            setSearchTerm('');
        }, 3000);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-green-50 dark:bg-green-900/20 rounded-4xl animate-scale-in">
                <CheckCircleIcon className="w-24 h-24 text-green-500 mb-4" />
                <h2 className="text-3xl font-black text-green-800 dark:text-green-200 uppercase tracking-tighter italic">{t('pos.saleSuccess')}</h2>
                <p className="text-green-600 dark:text-green-300 mt-2 font-bold">{t('pos.totalCharged')}: {formatCOP(total)}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in">
            {/* Product Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800/50 rounded-4xl shadow-sm border border-black/5 p-6 overflow-y-auto custom-scrollbar">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter italic">Catálogo de Tienda</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(product => (
                        <button 
                            key={product.id} 
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className={`flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-transparent hover:border-primary hover:shadow-xl transition-all text-center group relative overflow-hidden ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors text-primary shadow-sm">
                                <IdentificationIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs mb-1 line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                            <span className="text-primary font-black italic">{formatCOP(product.price)}</span>
                            <div className="mt-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">STOCK: {product.stock}</div>
                            {product.stock <= 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] font-black text-[10px] text-rose-500 uppercase tracking-widest rotate-12">AGOTADO</div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-4xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter italic">{t('pos.currentSale')}</h3>
                    
                    <div className="relative">
                        <div className="flex items-center bg-white dark:bg-gray-900 border-none rounded-2xl p-3 shadow-inner focus-within:ring-2 focus-within:ring-primary">
                            <UserGroupIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder={t('pos.searchClient')} 
                                value={selectedUser ? clients.find(c => c.id === selectedUser)?.name : searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedUser(null);
                                }}
                                className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold"
                            />
                        </div>
                        
                        {searchTerm && !selectedUser && (
                            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl mt-2 z-50 max-h-60 overflow-y-auto border border-black/5 custom-scrollbar">
                                {filteredClients.length > 0 ? filteredClients.map(client => (
                                    <button 
                                        key={client.id}
                                        onClick={() => { setSelectedUser(client.id); setSearchTerm(''); }}
                                        className="w-full text-left p-4 hover:bg-primary hover:text-white transition-colors border-b border-black/[0.03] last:border-none"
                                    >
                                        <p className="font-bold text-sm">{client.name}</p>
                                        <p className="text-[10px] font-medium opacity-70">{client.email}</p>
                                    </button>
                                )) : <p className="p-4 text-xs text-gray-500 text-center font-bold uppercase tracking-widest">Sin resultados</p>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-30">
                            <IdentificationIcon className="w-16 h-16 mb-4" />
                            <p className="font-black text-xs uppercase tracking-[0.2em]">{t('pos.emptyCart')}</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-black/[0.03] animate-slide-up">
                                <div className="flex-1 mr-4">
                                    <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight line-clamp-1">{item.product.name}</p>
                                    <p className="text-[10px] text-primary font-black italic">{formatCOP(item.product.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100"><MinusIcon className="w-3 h-3" /></button>
                                    <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100"><PlusIcon className="w-3 h-3" /></button>
                                    <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-gray-400 hover:text-rose-500 ml-1"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-black/5">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SUBTOTAL VENTA</span>
                        <span className="text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter">{formatCOP(total)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || !selectedUser}
                        className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 transition-all uppercase text-xs tracking-widest"
                    >
                        PROCESAR COBRO
                    </button>
                </div>
            </div>
        </div>
    );
};
