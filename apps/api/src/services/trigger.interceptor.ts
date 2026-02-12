import { PrismaClient } from '@prisma/client';
import { TriggerSystem } from './trigger.system.js';

/**
 * TriggerInterceptor: Implementado via Prisma Extension (Moderno)
 * Captura eventos de escrita em tempo real nos projetos gerados.
 */
export const createTriggerExtension = (projectId: string) => {
    return {
        name: 'trigger-interceptor',
        query: {
            $allModels: {
                async create({ model, args, query }: any) {
                    const result = await query(args);
                    await TriggerSystem.notifyEvent(projectId, 'ON_CREATE', result);
                    return result;
                },
                async update({ model, args, query }: any) {
                    const result = await query(args);
                    await TriggerSystem.notifyEvent(projectId, 'ON_UPDATE', result);
                    return result;
                },
                async delete({ model, args, query }: any) {
                    const result = await query(args);
                    await TriggerSystem.notifyEvent(projectId, 'ON_DELETE', result);
                    return result;
                }
            }
        }
    };
};

/**
 * ConnectionManager Atualizado para suportar Extensões
 */
export class ConnectionManager {
    private static instances: Map<string, any> = new Map();

    static async getConnection(projectId: string, tenantId: string, connectionString?: string) {
        const cacheKey = `${projectId}-${tenantId}`;

        if (this.instances.has(cacheKey)) {
            return this.instances.get(cacheKey);
        }

        const baseClient = new PrismaClient({
            datasources: { db: { url: connectionString || process.env.DATABASE_URL } }
        });

        // Injeta o Interceptador de Triggers na instância
        const extendedClient = baseClient.$extends(createTriggerExtension(projectId));

        this.instances.set(cacheKey, extendedClient);
        return extendedClient;
    }
}
