import { prisma } from '../../../../packages/database/index.js';

export class RoutingService {
    /**
     * Resolve um slug de usuário e de projeto para um Tenant ID específico.
     * Ex: /diego/meu-app -> Resolve para o Tenant associado.
     */
    static async resolveTenantByPath(userSlug: string, projectSlug: string) {
        // Primeiro, encontrar o usuário pelo slug (neste MVP, o 'userSlug' pode ser o nome do usuário ou email)
        // Em um sistema real, teríamos um campo 'slug' na tabela User ou Tenant.
        // Vamos assumir que o Tenant tem um slug único que combina usuario-projeto ou apenas projeto.

        const tenant = await prisma.tenant.findUnique({
            where: { slug: `${userSlug}-${projectSlug}` }
        });

        if (!tenant) {
            // Se não encontrar o composto, tenta apenas pelo projectSlug (legado ou simplificado)
            return await prisma.tenant.findUnique({
                where: { slug: projectSlug }
            });
        }

        return tenant;
    }
}
