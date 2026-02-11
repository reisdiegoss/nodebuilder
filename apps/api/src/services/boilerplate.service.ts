import { OOPEngineService, Table, Field, WebhookDefinition } from './oop-engine.service';
import { SmartParser } from './smart-parser';

/**
 * BoilerplateService: Gerencia as estruturas básicas dos projetos gerados
 */
export class BoilerplateService {
    /**
     * Gera o arquivo src/infra/database.ts com suporte a Triggers e Multi-tenancy
     */
    static generateDatabaseConfig(projectId: string, tenantId: string) {
        return `import { PrismaClient } from '@prisma/client';
import { createTriggerExtension } from '../../../../apps/api/src/services/trigger.interceptor';

const baseClient = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

// Injeção de Inteligência de Runtime (Captura de Eventos)
export const prisma = baseClient.$extends(createTriggerExtension('${projectId}'));

export default prisma;
`;
    }

    /**
     * Gera o servidor principal Fastify com middleware de Tenant
     */
    static generateServerMain() {
        return `import Fastify from 'fastify';
import { prisma } from './infra/database';

const app = Fastify({ logger: true });

// Global currentTenantId para uso nos Repositories
(global as any).currentTenantId = process.env.TENANT_ID || 'default';

app.get('/health', async () => ({ status: 'ok', tenant: (global as any).currentTenantId }));

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
`;
    }
}
