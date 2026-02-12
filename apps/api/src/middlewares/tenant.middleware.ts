import type { FastifyRequest, FastifyReply } from 'fastify';
import { RoutingService } from '../services/routing.service.js';
import { InternalBillingService } from '../services/billing.service.js';

export const tenantMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (request.headers['x-tenant-id'] as string);

    // Roteamento por Path: /usuario/projeto
    const urlParts = request.url.split('/').filter(p => p !== '');

    if (urlParts.length >= 2 && !request.url.startsWith('/health') && !request.url.startsWith('/billing') && !request.url.startsWith('/admin') && !request.url.startsWith('/auth')) {
        const userSlug = urlParts[0];
        const projectSlug = urlParts[1];

        const tenant = await RoutingService.resolveTenantByPath(userSlug, projectSlug);
        if (tenant) {
            // Enforcement: Bloquear se não tiver acesso
            const access = await InternalBillingService.checkTenantAccess(tenant.id);
            if (!access.allowed) {
                return reply.status(403).send({ error: 'ACCESS_DENIED', reason: access.reason });
            }

            (request as any).resolvedTenant = tenant;
            (request as any).tenantId = tenant.id;
            (global as any).currentTenantId = tenant.id;
            return;
        }
    }

    const finalTenantId = tenantId || 'default-tenant-id';
    (request as any).tenantId = finalTenantId;
    (global as any).currentTenantId = finalTenantId;
}
