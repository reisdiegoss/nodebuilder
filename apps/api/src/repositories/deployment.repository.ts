import { prisma } from '../../../../packages/database/index.js';
import type { Deployment } from '@prisma/client';

export class DeploymentRepository {
    /**
     * Registra um novo deploy
     */
    async create(data: { projectId: string, containerId: string, status: string, url: string }): Promise<Deployment> {
        return await prisma.deployment.create({
            data: {
                projectId: data.projectId,
                containerId: data.containerId,
                status: data.status,
                url: data.url,
                port: 0 // Usado no Docker Swarm via Ingress/Overlay (0 = Swarm Managed)
            }
        } as any);
    }

    /**
     * Lista deploys do Tenant
     */
    async findAllByTenant(tenantId: string): Promise<Deployment[]> {
        return await prisma.deployment.findMany({
            where: { project: { tenantId } }
        });
    }

    /**
     * Atualiza o status de um deploy
     */
    async updateStatus(id: string, status: string): Promise<Deployment> {
        return await prisma.deployment.update({
            where: { id },
            data: { status }
        });
    }
}

export const deploymentRepository = new DeploymentRepository();
