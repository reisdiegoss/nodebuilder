import { prisma } from '../../../../packages/database/index.js';

export class InternalBillingService {
    /**
     * Verifica o status de todos os tenants e bloqueia os inadimplentes.
     * Deve ser rodado via CRON diariamente.
     */
    static async checkSubscribers() {
        const now = new Date();

        // Buscar tenants com data de vencimento passada e que não estão bloqueados
        const overdueTenants = await prisma.tenant.findMany({
            where: {
                nextBillingDate: { lt: now },
                status: { notIn: ['BLOCKED'] }
            }
        });

        for (const tenant of overdueTenants) {
            console.log(`Tenant ${tenant.name} com fatura atrasada. Alterando status para OVERDUE.`);

            await prisma.tenant.update({
                where: { id: tenant.id },
                data: { status: 'OVERDUE' }
            });

            // Se passar de 5 dias do vencimento, bloqueia
            const gracePeriod = new Date(tenant.nextBillingDate!.getTime() + (5 * 24 * 60 * 60 * 1000));
            if (now > gracePeriod) {
                await prisma.tenant.update({
                    where: { id: tenant.id },
                    data: { status: 'BLOCKED' }
                });
            }
        }
    }

    /**
     * Verifica se o Tenant tem acesso ao sistema (Status e Cobrança)
     */
    static async checkTenantAccess(tenantId: string): Promise<{ allowed: boolean, reason?: string }> {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) return { allowed: false, reason: 'TENANT_NOT_FOUND' };

        // Bloquear se estiver INACTIVE ou BLOCKED
        if (['INACTIVE', 'BLOCKED'].includes(tenant.status)) {
            return { allowed: false, reason: `TENANT_STATUS_${tenant.status}` };
        }

        // Se estiver OVERDUE, permite acesso mas com aviso (regra de negócio)
        // No futuro podemos restringir certas funcionalidades aqui.

        return { allowed: true };
    }

    /**
     * Simula a criação de uma cobrança no Asaas (apenas gateway)
     */
    static async createPaymentIntent(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new Error('Tenant não encontrado');

        return {
            billingId: `PAY-${Math.random().toString(36).substr(2, 9)}`,
            pixCode: "00020126360014BR.GOV.BCB.PIX0114+551199999999952040000530398654041.005802BR5913NodeBuilder6009Sao Paulo62070503***6304E2B1",
            amount: 97.00,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
    }
}
