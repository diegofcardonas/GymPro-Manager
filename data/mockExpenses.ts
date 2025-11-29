
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

// Monthly burn approx ~40M COP. Revenue projected > 80M COP.
export const MOCK_EXPENSES: Expense[] = [
    // Current Month
    generateExpense('e1', 'Rent', 12000000, 0, 1, 'Alquiler Sede Principal + Bodega'),
    generateExpense('e2', 'Salaries', 22000000, 0, 5, 'Nómina Entrenadores y Staff'),
    generateExpense('e3', 'Utilities', 3500000, 0, 10, 'Servicios Públicos (Luz, Agua, Gas)'),
    generateExpense('e4', 'Maintenance', 1500000, 0, 15, 'Mantenimiento Preventivo Equipos'),
    generateExpense('e5', 'Marketing', 2000000, 0, 20, 'Campaña Meta Ads y Google'),
    generateExpense('e5b', 'Other', 500000, 0, 25, 'Insumos de Aseo y Cafetería'),
    
    // Month -1
    generateExpense('e6', 'Rent', 12000000, 1, 1, 'Alquiler Sede Principal'),
    generateExpense('e7', 'Salaries', 21500000, 1, 5, 'Nómina Staff'),
    generateExpense('e8', 'Utilities', 3200000, 1, 10, 'Servicios Públicos'),
    generateExpense('e9', 'Equipment', 8000000, 1, 12, 'Compra 2 Caminadoras Nuevas'), // One-off expense
    generateExpense('e9b', 'Marketing', 2000000, 1, 15, 'Marketing Digital'),
    
    // Month -2
    generateExpense('e10', 'Rent', 12000000, 2, 1, 'Alquiler Sede Principal'),
    generateExpense('e11', 'Salaries', 21500000, 2, 5, 'Nómina Staff'),
    generateExpense('e12', 'Utilities', 3100000, 2, 10, 'Servicios Públicos'),
    generateExpense('e13', 'Marketing', 2500000, 2, 18, 'Promoción Vacacional'),

    // Month -3
    generateExpense('e14', 'Rent', 11500000, 3, 1, 'Alquiler Sede Principal'),
    generateExpense('e15', 'Salaries', 20000000, 3, 5, 'Nómina Staff'),
    generateExpense('e16', 'Utilities', 3000000, 3, 10, 'Servicios Públicos'),
    generateExpense('e17', 'Maintenance', 2000000, 3, 22, 'Pintura Fachada'),
    
    // Month -4
    generateExpense('e18', 'Rent', 11500000, 4, 1, 'Alquiler Sede Principal'),
    generateExpense('e19', 'Salaries', 20000000, 4, 5, 'Nómina Staff'),
    generateExpense('e20', 'Utilities', 2800000, 4, 10, 'Servicios Públicos'),
    
    // Month -5
    generateExpense('e21', 'Rent', 11500000, 5, 1, 'Alquiler Sede Principal'),
    generateExpense('e22', 'Salaries', 19500000, 5, 5, 'Nómina Staff'),
    generateExpense('e23', 'Utilities', 2800000, 5, 10, 'Servicios Públicos'),
];
