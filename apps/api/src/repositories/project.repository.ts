import { prisma } from '../../../../packages/database/index.js';
import type { Project } from '@prisma/client';

export class ProjectRepository {
    /**
     * Lista todos os projetos de um Tenant (Isolamento via Prisma Extension)
     */
    async findAllByTenant(tenantId: string): Promise<Project[]> {
        return await prisma.project.findMany({
            where: { tenantId }
        });
    }

    /**
     * Busca um projeto específico
     */
    async findById(id: string): Promise<Project | null> {
        return await prisma.project.findUnique({
            where: { id }
        });
    }

    /**
     * Cria um novo projeto
     */
    async create(data: {
        name: string,
        description?: string,
        tenantId: string,
        multiTenantType?: 'SINGLE_DB' | 'MULTI_DB',
        restKey?: string,
        installToken?: string
    }): Promise<Project> {
        return await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                tenantId: data.tenantId,
                multiTenantType: data.multiTenantType || 'SINGLE_DB',
                restKey: data.restKey,
                installToken: data.installToken
            } as any
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
