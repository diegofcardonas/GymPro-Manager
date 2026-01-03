
import { Payment, PaymentStatus, PaymentMethod } from '../types';
import { MOCK_USERS } from './mockUsers';
import { MOCK_TIERS } from './membershipTiers';
import { MembershipStatus } from '../types';

const generateHistoricalPayments = () => {
    const payments: Payment[] = [];
    const clients = MOCK_USERS.filter(user => user.role === 'CLIENT');

    clients.forEach((client, index) => {
        const tier = MOCK_TIERS.find(t => t.id === client.membership.tierId) || MOCK_TIERS[3];

        // Current Month
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
            paymentMethod: index % 3 === 0 ? PaymentMethod.CARD : (index % 2 === 0 ? PaymentMethod.TRANSFER : PaymentMethod.CASH),
            description: `Membresía ${tier.name}`
        });

        // Past 4 months
        for (let i = 1; i <= 4; i++) {
            const pastDate = new Date();
            pastDate.setMonth(pastDate.getMonth() - i);
            pastDate.setDate(Math.floor(Math.random() * 28) + 1);
            
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
    });

    // POS sales
    for (let i = 0; i < 200; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
        date.setDate(Math.floor(Math.random() * 28) + 1);
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        
        payments.push({
            id: `pos-${i}`,
            userId: randomClient.id,
            amount: Math.floor(Math.random() * 35000) + 5000,
            date: date.toISOString(),
            status: PaymentStatus.COMPLETED,
            tierId: 'POS_SALE',
            description: i % 5 === 0 ? 'Proteína ISO' : (i % 2 === 0 ? 'Agua Mineral' : 'Barra Energética'),
            paymentMethod: Math.random() > 0.4 ? PaymentMethod.CASH : PaymentMethod.CARD
        });
    }

    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_PAYMENTS: Payment[] = generateHistoricalPayments();
