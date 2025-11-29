
import { EquipmentItem, EquipmentStatus } from '../types';

export const MOCK_EQUIPMENT: EquipmentItem[] = [
    {
        id: 'eq1',
        name: 'Caminadora LifeFitness #1',
        type: 'Cardio',
        location: 'Zona Cardio (Piso 2)',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq2',
        name: 'Elíptica Matrix',
        type: 'Cardio',
        location: 'Zona Cardio (Piso 2)',
        status: EquipmentStatus.IN_REPAIR,
    },
    {
        id: 'eq3',
        name: 'Prensa de Piernas 45°',
        type: 'Strength',
        location: 'Zona de Máquinas',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq4',
        name: 'Set de Mancuernas (2kg - 40kg)',
        type: 'Free Weights',
        location: 'Zona de Peso Libre',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq5',
        name: 'Polea Alta (Lat Pulldown)',
        type: 'Strength',
        location: 'Zona de Máquinas',
        status: EquipmentStatus.OUT_OF_SERVICE,
    },
    {
        id: 'eq6',
        name: 'Banco Plano Olímpico',
        type: 'Free Weights',
        location: 'Zona de Peso Libre',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq7',
        name: 'Smith Machine',
        type: 'Machine',
        location: 'Zona de Pierna',
        status: EquipmentStatus.OPERATIONAL,
    }
];
