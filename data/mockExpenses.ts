
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
    // Current Month
    generateExpense('e1', 'Rent', 8500000, 0, 1, 'Alquiler Local Principal'),
    generateExpense('e2', 'Salaries', 15000000, 0, 5, 'Nómina Personal Planta'),
    generateExpense('e3', 'Utilities', 2300000, 0, 10, 'Servicios Públicos (Agua/Luz)'),
    generateExpense('e4', 'Maintenance', 800000, 0, 15, 'Mantenimiento Caminadoras'),
    generateExpense('e5', 'Marketing', 1200000, 0, 20, 'Campaña Redes Sociales'),
    
    // Month -1
    generateExpense('e6', 'Rent', 8500000, 1, 1, 'Alquiler Local Principal'),
    generateExpense('e7', 'Salaries', 15000000, 1, 5, 'Nómina Personal Planta'),
    generateExpense('e8', 'Utilities', 2100000, 1, 10, 'Servicios Públicos'),
    generateExpense('e9', 'Equipment', 4500000, 1, 12, 'Compra Mancuernas Nuevas'),
    
    // Month -2
    generateExpense('e10', 'Rent', 8500000, 2, 1, 'Alquiler Local Principal'),
    generateExpense('e11', 'Salaries', 14500000, 2, 5, 'Nómina Personal Planta'),
    generateExpense('e12', 'Utilities', 2000000, 2, 10, 'Servicios Públicos'),
    generateExpense('e13', 'Marketing', 2000000, 2, 18, 'Promoción de Verano'),

    // Month -3
    generateExpense('e14', 'Rent', 8000000, 3, 1, 'Alquiler Local Principal'),
    generateExpense('e15', 'Salaries', 14500000, 3, 5, 'Nómina Personal Planta'),
    generateExpense('e16', 'Utilities', 1900000, 3, 10, 'Servicios Públicos'),
    generateExpense('e17', 'Maintenance', 1500000, 3, 22, 'Pintura Fachada'),
];
