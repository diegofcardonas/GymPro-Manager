
import { EquipmentItem, EquipmentStatus } from '../types';

export const MOCK_EQUIPMENT: EquipmentItem[] = [
    {
        id: 'eq1',
        name: 'Caminadora Pro #1',
        type: 'Cardio',
        location: 'Zona Cardio',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq2',
        name: 'Elíptica Matrix',
        type: 'Cardio',
        location: 'Zona Cardio',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq3',
        name: 'Prensa de Piernas 45°',
        type: 'Strength',
        location: 'Zona de Máquinas',
        status: EquipmentStatus.IN_REPAIR,
    },
    {
        id: 'eq4',
        name: 'Estante de Mancuernas (5-50kg)',
        type: 'Free Weights',
        location: 'Zona de Pesas',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq5',
        name: 'Jaula de Potencia #1',
        type: 'Strength',
        location: 'Zona de Pesas',
        status: EquipmentStatus.OPERATIONAL,
    },
    {
        id: 'eq6',
        name: 'Polea Alta (Lat Pulldown)',
        type: 'Strength',
        location: 'Zona de Máquinas',
        status: EquipmentStatus.OUT_OF_SERVICE,
    },
];
