import type { FastifyRequest, FastifyReply } from 'fastify';
import { RBACService } from '../services/rbac.service.js';

/**
 * RBAC Middleware: Proteção de rota baseada em permissão.
 * @param requiredPermission Opcional. Se fornecido, valida se o usuário tem a permissão.
 */
export const rbac = (requiredPermission?: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Assume que o userId está no cabeçalho para o MVP/IDE
        const userId = (request.headers['x-user-id'] as string);

        if (!userId) {
            // Se não houver usuário e a rota exigir permissão, bloqueia
            if (requiredPermission) {
                return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Usuário não identificado.' });
            }
            return;
        }

        if (requiredPermission) {
            const hasAccess = await RBACService.hasPermission(userId, requiredPermission);
            const isFullAdmin = await RBACService.hasPermission(userId, 'admin:*');

            if (!hasAccess && !isFullAdmin) {
                return reply.status(403).send({
                    error: 'FORBIDDEN',
                    message: `Você não tem a permissão necessária (${requiredPermission}).`
                });
            }
        }
    };
};
