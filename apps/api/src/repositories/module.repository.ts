import { prisma } from '../../../../packages/database/index.js';
import type { Module } from '@prisma/client';

export class ModuleRepository {
    /**
     * Lista módulos de um projeto
     */
    async findByProject(projectId: string): Promise<Module[]> {
        return await prisma.module.findMany({
            where: { projectId }
        });
    }

    /**
     * Lista todos os módulos do Tenant (Isolamento via Extension)
     */
    async findAll(): Promise<Module[]> {
        return await prisma.module.findMany();
    }

    /**
     * Cria ou atualiza um módulo
     */
    async upsert(data: { id?: string, name: string, type: string, schema: any, projectId: string }): Promise<Module> {
        if (data.id) {
            return await prisma.module.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    type: data.type,
                    schema: data.schema
                }
            });
        }

        return await prisma.module.create({
            data: {
                name: data.name,
                type: data.type,
                schema: data.schema,
                projectId: data.projectId
            }
        });
    }
}

export const moduleRepository = new ModuleRepository();
