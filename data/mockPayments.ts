
import { Payment, PaymentStatus, PaymentMethod } from '../types';
import { MOCK_USERS } from './mockUsers';
import { MOCK_TIERS } from './membershipTiers';
import { MembershipStatus } from '../types';

const generateHistoricalPayments = () => {
    const payments: Payment[] = [];
    const clients = MOCK_USERS.filter(user => user.role === 'CLIENT');

    clients.forEach((client, index) => {
        const tier = MOCK_TIERS.find(t => t.id === client.membership.tierId) || MOCK_TIERS[3];

        // Membresía Mes Actual
        let currentStatus = PaymentStatus.COMPLETED;
        if (client.membership.status === MembershipStatus.PENDING) currentStatus = PaymentStatus.PENDING;
        if (client.membership.status === MembershipStatus.EXPIRED) currentStatus = PaymentStatus.FAILED;

        payments.push({
            id: `p-${client.id}-curr`,
            userId: client.id,
            amount: tier.price,
            date: new Date().toISOString(),
            status: currentStatus,
            tierId: tier.id,
            paymentMethod: index % 4 === 0 ? PaymentMethod.CARD : (index % 3 === 0 ? PaymentMethod.TRANSFER : PaymentMethod.CASH),
            description: `Renovación Membresía ${tier.name}`
        });

        // Historial de 3 meses atrás para los primeros 50 usuarios
        if (index < 50) {
            for (let i = 1; i <= 3; i++) {
                const pastDate = new Date();
                pastDate.setMonth(pastDate.getMonth() - i);
                pastDate.setDate(Math.floor(Math.random() * 5) + 1);
                
                payments.push({
                    id: `p-${client.id}-hist-${i}`,
                    userId: client.id,
                    amount: tier.price,
                    date: pastDate.toISOString(),
                    status: PaymentStatus.COMPLETED,
                    tierId: tier.id,
                    paymentMethod: i % 2 === 0 ? PaymentMethod.CARD : PaymentMethod.TRANSFER,
                    description: `Membresía ${tier.name}`
                });
            }
        }
    });

    // Ventas de Tienda (POS) - 150 registros aleatorios
    const posProducts = [
        { name: 'Proteína Whey ISO (Tarro)', price: 185000 },
        { name: 'Creatina Monohidratada', price: 95000 },
        { name: 'Pre-Workout Explosive', price: 125000 },
        { name: 'Agua Cristal (Botella)', price: 3500 },
        { name: 'Gatorade Manzana', price: 5500 },
        { name: 'Barra Energética Pro', price: 7500 },
        { name: 'Toalla Gym Pro', price: 28000 }
    ];

    for (let i = 0; i < 150; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 4));
        date.setDate(Math.floor(Math.random() * 28) + 1);
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const product = posProducts[Math.floor(Math.random() * posProducts.length)];
        
        payments.push({
            id: `pos-${i}`,
            userId: randomClient.id,
            amount: product.price,
            date: date.toISOString(),
            status: PaymentStatus.COMPLETED,
            tierId: 'POS_SALE',
            description: product.name,
            paymentMethod: Math.random() > 0.4 ? PaymentMethod.CASH : PaymentMethod.CARD
        });
    }

    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_PAYMENTS: Payment[] = generateHistoricalPayments();
