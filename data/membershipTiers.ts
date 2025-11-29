
import { MembershipTier } from '../types';

export const MOCK_TIERS: MembershipTier[] = [
    { 
        id: 'tier_day', 
        name: 'Pase Diario', 
        price: 25000, 
        duration: 0.03, // approx 1 day
        features: ['Acceso total por 1 día', 'Sin matrícula', 'Acceso a zonas húmedas'], 
        color: '#94a3b8' // slate-400
    },
    { 
        id: 'tier_week', 
        name: 'Semana Fit', 
        price: 80000, 
        duration: 0.25, // 1 week
        features: ['7 días consecutivos', 'Acceso a clases grupales', 'Casillero diario'], 
        color: '#64748b' // slate-500
    },
    { 
        id: 'tier_student', 
        name: 'Estudiante', 
        price: 90000, 
        duration: 1, 
        features: ['Carnet vigente requerido', 'Horario restringido (9am - 4pm)', 'Acceso a pesas y cardio'], 
        color: '#22d3ee' // cyan-400
    }, 
    { 
        id: 'tier_basic', 
        name: 'Básico Mensual', 
        price: 120000, 
        duration: 1, 
        features: ['Acceso ilimitado', 'Sin cláusula de permanencia', 'Valoración inicial'], 
        color: '#3b82f6' // blue-500
    }, 
    { 
        id: 'tier_basic_year', 
        name: 'Básico Anual', 
        price: 1200000, 
        duration: 12, 
        features: ['Congelación por 15 días', 'Camiseta de regalo', 'Ahorro de 2 meses'], 
        color: '#1d4ed8' // blue-700
    },
    { 
        id: 'tier_premium', 
        name: 'Premium Mensual', 
        price: 180000, 
        duration: 1, 
        features: ['Acceso a sedes nacionales', 'Clases ilimitadas', 'Zona húmeda (Sauna/Turco)', 'Silla de masajes', '1 invitado al mes'], 
        color: '#a855f7' // purple-500
    }, 
    { 
        id: 'tier_premium_qt', 
        name: 'Trimestre Premium', 
        price: 500000, 
        duration: 3, 
        features: ['Valoración nutricional básica', 'Todas las ventajas Premium', 'Descuento en tienda 5%'], 
        color: '#9333ea' // purple-600
    },
    { 
        id: 'tier_premium_year', 
        name: 'Premium Anual', 
        price: 1800000, 
        duration: 12, 
        features: ['Congelación 30 días', 'Kit de bienvenida VIP', '2 valoraciones InBody', 'Pase de invitado semanal'], 
        color: '#7e22ce' // purple-700
    },
    { 
        id: 'tier_duo', 
        name: 'Plan Duo/Pareja', 
        price: 300000, 
        duration: 1, 
        features: ['Precio para 2 personas', 'Acceso Premium para ambos', 'Entrenamiento compartido'], 
        color: '#f43f5e' // rose-500
    }, 
    { 
        id: 'tier_elite', 
        name: 'Elite Personalizado', 
        price: 2500000, 
        duration: 12, 
        features: ['Entrenador Personal 3x semana', 'Nutrición mensual', 'Parqueadero reservado', 'Casillero privado fijo', 'Lavandería de ropa deportiva'], 
        color: '#f59e0b' // amber-500
    }, 
];
