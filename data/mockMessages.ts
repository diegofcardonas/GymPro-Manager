
import { Message } from '../types';

export const MOCK_MESSAGES: Message[] = [
    // Conversation between Samantha Williams (client '2') and Chris Validator (trainer 't1')
    {
        id: 'm1',
        conversationId: '2-t1',
        senderId: 't1',
        receiverId: '2',
        text: '¡Hola Samantha! Gran trabajo en tu último entrenamiento. ¿Cómo sentiste el aumento de peso en el press de banca?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        isRead: true,
    },
    {
        id: 'm2',
        conversationId: '2-t1',
        senderId: '2',
        receiverId: 't1',
        text: '¡Gracias, Carlos! Fue un reto, pero logré completar todas las series. Definitivamente me dolía el pecho al día siguiente.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
    },
    {
        id: 'm3',
        conversationId: '2-t1',
        senderId: 't1',
        receiverId: '2',
        text: '¡Esa es una buena señal! Sigue con el buen trabajo. Avísame si necesitas algún ajuste en tu rutina.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: false,
    },

    // Conversation between Michael Brown (client '3') and Diana Prince (trainer 't2')
    {
        id: 'm4',
        conversationId: '3-t2',
        senderId: '3',
        receiverId: 't2',
        text: 'Hola Daniela, tenía una pregunta sobre la técnica del peso muerto. ¿Podemos revisarlo rápidamente antes de mi próxima sesión?',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
    },
    {
        id: 'm5',
        conversationId: '3-t2',
        senderId: 't2',
        receiverId: '3',
        text: 'Por supuesto, Miguel. Hagámoslo. Búscame en el piso 10 minutos antes de tu hora de entrenamiento programada.',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
        isRead: true,
    },
];
