
import { Expense } from '../types';

const generateExpense = (id: string, category: string, amount: number, monthOffset: number, day: number, desc: string): Expense => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    date.setDate(day);
    return {
        id,
        category,
        amount,
        date: date.toISOString(),
        description: desc,
        registeredBy: '1' // Admin
    };
};

export const MOCK_EXPENSES: Expense[] = [
    // Mes Actual (Gastos fijos y variables reales)
    generateExpense('e1', 'Rent', 15500000, 0, 1, 'Arriendo Local Sede Principal (1200m2)'),
    generateExpense('e2', 'Salaries', 28450000, 0, 5, 'Nómina: 5 Entrenadores, 2 Recepcionistas, 1 Personal Aseo'),
    generateExpense('e3', 'Utilities', 4800000, 0, 10, 'Servicios Públicos (Energía Comercial, Acueducto, Fibra Óptica 1Gbps)'),
    generateExpense('e4', 'Maintenance', 2300000, 0, 15, 'Mantenimiento Preventivo de Poleas y Lubricación de Caminadoras'),
    generateExpense('e5', 'Marketing', 3500000, 0, 18, 'Pauta Digital Meta Ads + Diseño de Piezas para Redes'),
    generateExpense('e6', 'Other', 1200000, 0, 22, 'Insumos de Limpieza y Papelería'),
    generateExpense('e7', 'Equipment', 950000, 0, 25, 'Compra de Discos de 5kg y 10kg (Renovación)'),

    // Mes Anterior -1
    generateExpense('e8', 'Rent', 15500000, 1, 1, 'Arriendo Local'),
    generateExpense('e9', 'Salaries', 27800000, 1, 5, 'Nómina Total'),
    generateExpense('e10', 'Utilities', 5100000, 1, 10, 'Servicios (Pico de Verano - Aire Acondicionado)'),
    generateExpense('e11', 'Equipment', 12400000, 1, 12, 'Compra de 2 Máquinas de Remo Concept2'),
    generateExpense('e12', 'Marketing', 3000000, 1, 20, 'Campaña de Fidelización'),

    // Mes Anterior -2
    generateExpense('e13', 'Rent', 15500000, 2, 1, 'Arriendo Local'),
    generateExpense('e14', 'Salaries', 27500000, 2, 5, 'Nómina Staff'),
    generateExpense('e15', 'Utilities', 4600000, 2, 10, 'Servicios Públicos'),
    generateExpense('e16', 'Maintenance', 1800000, 2, 15, 'Reparación de Tapizado Bancos Planos'),
    generateExpense('e17', 'Marketing', 4500000, 2, 20, 'Campaña Especial de Apertura de Año'),
];
