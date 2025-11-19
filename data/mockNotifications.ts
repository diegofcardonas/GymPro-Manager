
import { Notification, NotificationType } from '../types';

export const MOCK_NOTIFICATIONS: Notification[] = [
    // Admin Notifications (User ID: 1)
    {
        id: 'n1',
        userId: '1',
        title: 'Nuevo Registro de Cliente',
        message: 'Una nueva cliente, Jessica Díaz, se ha registrado.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        isRead: false,
        type: NotificationType.SUCCESS,
        linkTo: '/users',
    },
    {
        id: 'n2',
        userId: '1',
        title: 'Membresía a punto de vencer',
        message: 'La membresía de Miguel Brown vence en 2 días.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: false,
        type: NotificationType.WARNING,
        linkTo: '/users',
    },
    {
        id: 'n3',
        userId: '1',
        title: 'Actualización del Sistema',
        message: 'Se ha lanzado una nueva versión del panel de control.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        isRead: true,
        type: NotificationType.INFO,
    },

    // Client Notifications (User ID: 2 - Samantha Williams)
    {
        id: 'n4',
        userId: '2',
        title: 'Rutina Actualizada',
        message: 'Tu entrenador, Carlos Vives, ha actualizado tu rutina de entrenamiento.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        isRead: false,
        type: NotificationType.INFO,
        linkTo: '/routine',
    },
    {
        id: 'n5',
        userId: '2',
        title: 'Nueva Nota de Progreso',
        message: 'Tu entrenador ha añadido una nueva nota sobre tu progreso.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        isRead: true,
        type: NotificationType.SUCCESS,
    },

    // Trainer Notifications (User ID: t1 - Chris Validator)
    {
        id: 'n6',
        userId: 't1',
        title: 'Nuevo Cliente Asignado',
        message: 'Se te ha asignado una nueva cliente: Samantha López.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        isRead: false,
        type: NotificationType.SUCCESS,
        linkTo: '/clients',
    },
    {
        id: 'n7',
        userId: 't1',
        title: 'Membresía de Cliente Vencida',
        message: 'La membresía de tu cliente Jaime Rodríguez ha vencido.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        isRead: true,
        type: NotificationType.ALERT,
    },
];
