
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { IdentificationIcon } from '../icons/IdentificationIcon';
import { useTranslation } from 'react-i18next';

const ProductManagement: React.FC = () => {
    const { t } = useTranslation();
    const { products, addProduct, updateProduct, deleteProduct } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const categories = useMemo(() => ['Supplement', 'Drink', 'Snack', 'Gear', 'Other'], []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    const handleOpenModal = (product: Product | null = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (product: Product) => {
        if (product.id) updateProduct(product);
        else addProduct({ ...product, id: `p-${Date.now()}` });
        setIsModalOpen(false);
    };

    return (
        <div className="w-full space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-black/5 pb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Control de Inventario</h2>
                    <p className="text-sm text-gray-500 font-medium">Gestión de stock, precios y catalogación de productos.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <PlusIcon className="h-5 w-5" />
                    <span>NUEVO PRODUCTO</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o SKU..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary font-medium text-sm"
                    />
                    <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select 
                    value={categoryFilter} 
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="p-4 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-widest cursor-pointer"
                >
                    <option value="all">TODAS LAS CATEGORÍAS</option>
                    {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 p-6 rounded-4xl shadow-sm border border-black/5 dark:border-white/10 group hover:shadow-2xl transition-all duration-500 animate-slide-up relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest">{product.category}</span>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2 group-hover:text-primary transition-colors">{product.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">SKU: {product.sku}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={`px-3 py-1.5 rounded-xl font-black text-[11px] italic shadow-sm ${product.stock < 5 ? 'bg-rose-500 text-white animate-pulse' : product.stock < 10 ? 'bg-amber-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    STOCK: {product.stock}
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-6 font-medium leading-relaxed">{product.description}</p>
                        
                        <div className="flex justify-between items-center pt-6 border-t border-black/5 dark:border-white/5">
                            <p className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price)}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(product)} className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-primary rounded-2xl transition-all hover:scale-110">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => { if(window.confirm('¿Eliminar producto?')) deleteProduct(product.id); }} className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-rose-500 rounded-2xl transition-all hover:scale-110">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <ProductModal product={selectedProduct} categories={categories} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ProductModal = ({ product, categories, onSave, onClose }: any) => {
    const [formData, setFormData] = useState<Product>(product || { id: '', name: '', description: '', price: 0, category: 'Supplement', stock: 0, sku: '' });
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const modalContent = (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-0 md:p-6 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full h-full md:h-auto md:max-w-xl md:rounded-4xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in flex flex-col border border-white/10">
                <div className="p-8 md:p-10 bg-primary text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <IdentificationIcon className="absolute -right-8 -top-8 w-48 h-48 opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">{product ? "Editar Producto" : "Nuevo Producto"}</h2>
                        <p className="text-primary-foreground/70 text-[9px] font-black uppercase tracking-widest mt-1">SISTEMA CENTRAL DE ABASTECIMIENTO</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 hover:scale-110 active:scale-95">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-8 md:p-10 space-y-8 flex-1 overflow-y-auto bg-white dark:bg-gray-800 custom-scrollbar overscroll-contain">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nombre Comercial</label>
                        <input 
                            type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-inner"
                            placeholder="Ej: Proteína Whey V3"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">SKU / Referencia</label>
                            <input 
                                type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Categoría</label>
                            <select 
                                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-sm shadow-inner appearance-none cursor-pointer"
                            >
                                {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Precio de Venta</label>
                            <input 
                                type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Stock Inicial</label>
                            <input 
                                type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Descripción Detallada</label>
                        <textarea 
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-medium resize-none leading-relaxed shadow-inner min-h-[100px]"
                            placeholder="Beneficios, uso recomendado..."
                        />
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-5 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-3xl font-black uppercase text-xs tracking-widest transition-all border border-black/5">
                        CANCELAR
                    </button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-primary/40 transition-all">
                        {product ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ProductManagement;
