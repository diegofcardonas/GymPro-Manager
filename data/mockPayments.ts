
import { Payment, PaymentStatus, PaymentMethod } from '../types';
import { MOCK_USERS } from './mockUsers';
import { MOCK_TIERS } from './membershipTiers';
import { MembershipStatus } from '../types';

const generateHistoricalPayments = () => {
    const payments: Payment[] = [];
    const clients = MOCK_USERS.filter(user => user.role === 'CLIENT');

    clients.forEach((client, index) => {
        const tier = MOCK_TIERS.find(t => t.id === client.membership.tierId) || MOCK_TIERS[3]; // Default to basic if undefined

        // Determine current month status
        let currentStatus = PaymentStatus.COMPLETED;
        if (client.membership.status === MembershipStatus.PENDING) currentStatus = PaymentStatus.PENDING;
        if (client.membership.status === MembershipStatus.EXPIRED) currentStatus = PaymentStatus.FAILED;

        // Current Month Payment
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

        // Historical payments (Last 5 months for everyone to make charts look busy)
        // In a real app, check joinDate, but for demo, we want full charts.
        if (client.membership.status === MembershipStatus.ACTIVE || client.membership.status === MembershipStatus.EXPIRED) {
            for (let i = 1; i <= 5; i++) {
                const pastDate = new Date();
                pastDate.setMonth(pastDate.getMonth() - i);
                pastDate.setDate(Math.max(1, pastDate.getDate() - Math.floor(Math.random() * 15))); // Spread dates
                
                // Add some randomness to payment success history
                const histStatus = Math.random() > 0.05 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

                payments.push({
                    id: `p-${client.id}-hist-${i}`,
                    userId: client.id,
                    amount: tier.price,
                    date: pastDate.toISOString(),
                    status: histStatus,
                    tierId: tier.id,
                    paymentMethod: Math.random() > 0.6 ? PaymentMethod.CARD : PaymentMethod.TRANSFER,
                    description: `Membresía ${tier.name}`
                });
            }
        }
    });

    // Add POS sales (high volume)
    for (let i = 0; i < 150; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 6)); // Spread over 6 months
        date.setDate(Math.floor(Math.random() * 28) + 1);
        
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        
        payments.push({
            id: `pos-${i}`,
            userId: randomClient.id,
            amount: Math.floor(Math.random() * 45000) + 5000, // 5k - 50k
            date: date.toISOString(),
            status: PaymentStatus.COMPLETED,
            tierId: 'POS_SALE',
            description: 'Venta Tienda / Cafetería',
            paymentMethod: Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.CARD
        });
    }

    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_PAYMENTS: Payment[] = generateHistoricalPayments();
