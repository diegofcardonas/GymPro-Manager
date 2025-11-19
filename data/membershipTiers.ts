
import { MembershipTier } from '../types';

export const MOCK_TIERS: MembershipTier[] = [
    { id: 'tier1', name: 'Básico', price: 90000, duration: 1, features: ['Acceso al Gimnasio', 'Casillero'], color: '#3b82f6' }, // blue-500
    { id: 'tier2', name: 'Premium', price: 160000, duration: 1, features: ['Acceso al Gimnasio', 'Casillero', 'Clases Grupales', 'Sauna'], color: '#a855f7' }, // purple-500
    { id: 'tier3', name: 'VIP', price: 250000, duration: 1, features: ['Todo lo de Premium', 'Sesión con Entrenador (1/mes)', 'Servicio de Toallas', 'Descuento en Batidos'], color: '#f59e0b' }, // amber-500
];
