
import { Payment, PaymentStatus, PaymentMethod } from '../types';
import { MOCK_USERS } from './mockUsers';
import { MOCK_TIERS } from './membershipTiers';
import { MembershipStatus } from '../types';

const generateHistoricalPayments = () => {
    const payments: Payment[] = [];
    const clients = MOCK_USERS.filter(user => user.role === 'CLIENT');

    clients.forEach((client, index) => {
        const tier = MOCK_TIERS.find(t => t.id === client.membership.tierId);
        if (!tier) return;

        // Current payment (based on status)
        let currentStatus = PaymentStatus.COMPLETED;
        if (client.membership.status === MembershipStatus.PENDING) currentStatus = PaymentStatus.PENDING;
        if (client.membership.status === MembershipStatus.EXPIRED) currentStatus = PaymentStatus.FAILED;

        payments.push({
            id: `p-${client.id}-current`,
            userId: client.id,
            amount: tier.price,
            date: new Date().toISOString(), // Today
            status: currentStatus,
            tierId: tier.id,
            paymentMethod: PaymentMethod.CARD
        });

        // Historical payments (simulate last 3 months if active)
        if (client.membership.status === MembershipStatus.ACTIVE) {
            for (let i = 1; i <= 3; i++) {
                const pastDate = new Date();
                pastDate.setMonth(pastDate.getMonth() - i);
                // Randomize day slightly
                pastDate.setDate(Math.max(1, pastDate.getDate() - Math.floor(Math.random() * 5)));
                
                payments.push({
                    id: `p-${client.id}-hist-${i}`,
                    userId: client.id,
                    amount: tier.price,
                    date: pastDate.toISOString(),
                    status: PaymentStatus.COMPLETED,
                    tierId: tier.id,
                    paymentMethod: i % 2 === 0 ? PaymentMethod.TRANSFER : PaymentMethod.CASH
                });
            }
        }
    });

    // Add some random POS sales
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random day in last month
        payments.push({
            id: `pos-${i}`,
            userId: clients[Math.floor(Math.random() * clients.length)].id,
            amount: Math.floor(Math.random() * 50000) + 5000, // Random amount 5k - 55k
            date: date.toISOString(),
            status: PaymentStatus.COMPLETED,
            tierId: 'POS_SALE',
            description: 'Compra en Tienda (Agua/Snack)',
            paymentMethod: PaymentMethod.CASH
        });
    }

    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_PAYMENTS: Payment[] = generateHistoricalPayments();
