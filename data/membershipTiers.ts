
import { MembershipTier } from '../types';

export const MOCK_TIERS: MembershipTier[] = [
    { 
        id: 'tier1', 
        name: 'Básico', 
        price: 90000, 
        duration: 1, 
        features: ['Acceso a Sala de Pesas', 'Casillero Diario', 'Duchas'], 
        color: '#3b82f6' // blue-500
    }, 
    { 
        id: 'tier2', 
        name: 'Premium', 
        price: 160000, 
        duration: 1, 
        features: ['Todo lo del Plan Básico', 'Clases Grupales Ilimitadas', 'Acceso a Zonas Húmedas (Sauna)', '1 Invitado al mes'], 
        color: '#a855f7' // purple-500
    }, 
    { 
        id: 'tier3', 
        name: 'VIP', 
        price: 250000, 
        duration: 3, 
        features: ['Todo lo del Plan Premium', 'Valoración Nutricional Mensual', 'Parqueadero Privado', 'Toalla y Kit de Aseo', 'Descuento en Tienda'], 
        color: '#f59e0b' // amber-500
    }, 
];
