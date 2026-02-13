import { prisma } from '../../../../packages/database/index.js';
import type { Project } from '@prisma/client';

export class ProjectRepository {
    /**
     * Lista todos os projetos de um Tenant (Isolamento via Prisma Extension)
     */
    async findAllByTenant(tenantId: string): Promise<Project[]> {
        return await prisma.project.findMany({
            where: { tenantId },
            include: { databases: true, modules: true }
        });
    }

    /**
     * Busca um projeto específico
     */
    async findById(id: string): Promise<Project | null> {
        return await prisma.project.findUnique({
            where: { id },
            include: { databases: true, modules: true }
        });
    }

    /**
     * Cria um novo projeto com banco de dados primário
     */
    async create(data: {
        name: string,
        description?: string,
        tenantId: string,
        databaseType?: string,
        multiTenantType?: 'SINGLE_DB' | 'MULTI_DB'
    }): Promise<Project> {
        return await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                tenantId: data.tenantId,
                multiTenantType: data.multiTenantType || 'SINGLE_DB',
                databases: {
                    create: {
                        name: 'Primário',
                        type: data.databaseType || 'postgresql',
                        isPrimary: true
                    }
                }
            } as any,
            include: { databases: true }
        });
    }

    async findAllGlobal(): Promise<Project[]> {
        return await (prisma.project as any).findMany({
            include: { tenant: true }
        });
    }

    async delete(id: string): Promise<void> {
        await (prisma.project as any).delete({ where: { id } });
    }
}

export const projectRepository = new ProjectRepository();
