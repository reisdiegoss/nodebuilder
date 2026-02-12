import { prisma } from '../../../../packages/database/index.js';

export interface MenuItemNode {
    id: string;
    label: string;
    icon?: string | null;
    path?: string | null;
    children: MenuItemNode[];
}

export class MenuService {
    /**
     * Busca a árvore de menu filtrada pelas permissões do usuário.
     */
    static async getMenuForUser(userId: string, tenantId: string): Promise<MenuItemNode[]> {
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

        const userPermissions = user.role.permissions.map(p => p.slug);

        // Busca todos os itens de menu do tenant
        const allItems = await prisma.menuItem.findMany({
            where: { tenantId },
            orderBy: { order: 'asc' },
            include: {
                roles: true
            }
        });

        // Filtra itens por permissão e role
        const filteredItems = allItems.filter(item => {
            // Se o item não exige permissão, exibe
            if (!item.requiredPermission) return true;

            // Se o usuário tem a permissão necessária
            return userPermissions.includes(item.requiredPermission) || userPermissions.includes('admin:*');
        });

        return this.buildTree(filteredItems);
    }

    /**
     * Constrói a estrutura de árvore (recursivo).
     */
    private static buildTree(items: any[], parentId: string | null = null): MenuItemNode[] {
        return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                path: item.path,
                children: this.buildTree(items, item.id)
            }));
    }

    /**
     * Seed de menus básicos para novos tenants.
     */
    static async seedDefaultMenus(tenantId: string, roleId: string) {
        const menus = [
            { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', order: 1 },
            { label: 'Cadastros', icon: 'Database', order: 2 },
            { label: 'Configurações', icon: 'Settings', path: '/settings', order: 3 },
        ];

        for (const m of menus) {
            await prisma.menuItem.create({
                data: {
                    ...m,
                    tenantId,
                    roles: { connect: { id: roleId } }
                }
            });
        }
    }
}
