import { prisma } from '../../../../packages/database/index.js';

export interface AsaasEvent {
    event: 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'PAYMENT_DELETED';
    payment: {
        id: string;
        customer: string;
        status: string;
        amount: number;
    }
}

export class AsaasService {
    /**
     * Processa eventos recebidos do Asaas
     */
    static async handleWebhook(payload: AsaasEvent) {
        console.log('🔔 [Asaas Webhook] Evento Recebido:', payload.event);

        const asaasCustomerId = payload.payment.customer;

        switch (payload.event) {
            case 'PAYMENT_RECEIVED':
                await this.updateTenantStatus(asaasCustomerId, 'ACTIVE');
                break;
            case 'PAYMENT_OVERDUE':
                await this.updateTenantStatus(asaasCustomerId, 'OVERDUE');
                break;
            case 'PAYMENT_DELETED':
                // Lógica opcional
                break;
        }
    }

    private static async updateTenantStatus(asaasCustomerId: string, status: 'ACTIVE' | 'OVERDUE' | 'BLOCKED') {
        const tenant = await prisma.tenant.findUnique({
            where: { asaasCustomerId } as any
        });

        if (tenant) {
            await prisma.tenant.update({
                where: { id: tenant.id },
                data: {
                    status,
                    lastPaymentDate: new Date()
                } as any
            });
            console.log(`✅ [SaaS] Tenant ${tenant.name} atualizado para ${status}`);
        } else {
            console.warn(`⚠️ [SaaS] Cliente Asaas ${asaasCustomerId} não encontrado na base local.`);
        }
    }
}
