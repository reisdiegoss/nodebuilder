import { prisma } from '../../../../packages/database/index.js';

export class RBACService {
    /**
     * Verifica se um usuário possui uma permissão específica.
     */
    static async hasPermission(userId: string, permissionSlug: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                }
            }
        });

        if (!user || !user.role) return false;

        return user.role.permissions.some(p => p.slug === permissionSlug);
    }

    /**
     * Retorna todas as permissões de um usuário.
     */
    static async getUserPermissions(userId: string): Promise<string[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                }
            }
        });

        if (!user || !user.role) return [];

        return user.role.permissions.map(p => p.slug);
    }

    /**
     * Cria uma nova Role para um Tenant.
     */
    static async createRole(tenantId: string, name: string, permissionsSlugs: string[]) {
        const permissions = await prisma.permission.findMany({
            where: { slug: { in: permissionsSlugs } }
        });

        return prisma.role.create({
            data: {
                name,
                slug: `${tenantId}-${name.toLowerCase().replace(/\s+/g, '-')}`,
                tenantId,
                permissions: {
                    connect: permissions.map(p => ({ id: p.id }))
                }
            }
        });
    }

    /**
     * Seed inicial de permissões (Utility).
     */
    static async seedPermissions() {
        const basePermissions = [
            { name: 'Ver Usuários', slug: 'user:list' },
            { name: 'Criar Usuário', slug: 'user:create' },
            { name: 'Editar Usuário', slug: 'user:update' },
            { name: 'Excluir Usuário', slug: 'user:delete' },
            { name: 'Ver Projetos', slug: 'project:list' },
            { name: 'Admin Total', slug: 'admin:*' },
        ];

        for (const permission of basePermissions) {
            await prisma.permission.upsert({
                where: { slug: permission.slug },
                update: {},
                create: permission
            });
        }
    }
}
