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
     * Gera o RuntimeCRUDService para injeção no container
     */
    static generateRuntimeCRUDService() {
        return `import { PrismaClient } from '@prisma/client';

/**
 * RuntimeCRUDService
 * Este arquivo é injetado dentro do container do cliente.
 * Ele serve como o "Backend Genérico" para alimentar o NDataGrid e NUniqueSearch.
 */
export class RuntimeCRUDService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Processa requisições do NDataGrid (Paginação, Busca, Sort)
   */
  async handleList(model: string, query: any, tenantId: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || '';
    const sortField = query.sort || 'createdAt';
    const sortDir = query.dir || 'desc';

    // 1. Definição de Filtros (Busca Global + Tenant)
    const where: any = {
      tenantId: tenantId, // Segurança Multi-tenant forçada
    };

    if (search) {
       // Busca genérica simples - Expandir conforme necessidade
    }

    // 2. Consulta ao Banco
    // @ts-ignore - O model é dinâmico
    const delegate = this.prisma[model];
    
    if (!delegate) throw new Error(\`Model \${model} não encontrado no Prisma.\`);

    try {
        const [total, data] = await Promise.all([
          delegate.count({ where }),
          delegate.findMany({
            where,
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { [sortField]: sortDir }
          })
        ]);
    
        // 3. Retorno no formato padrão do NDataGrid
        return {
          data,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        };
    } catch (e) {
        console.error("RuntimeCRUD Error:", e);
        return { data: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  /**
   * Processa buscas do NUniqueSearch (Autocomplete)
   */
  async handleLookup(model: string, search: string, tenantId: string) {
     // @ts-ignore
    const delegate = this.prisma[model];
    if (!delegate) return [];

    try {
        return await delegate.findMany({
          where: {
            tenantId: tenantId,
            // OR: [{ nome: { contains: search, mode: 'insensitive' } }] // Depende do campo existir
          },
          take: 20
        });
    } catch (e) {
        return [];
    }
  }
}
`;
    }

    /**
     * Gera o servidor principal Fastify com middleware de Tenant
     */
    static generateServerMain() {
        return `import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { prisma } from './infra/database';
import { appRoutes } from './routes';

const app = Fastify({ logger: true });

app.register(cors);
app.register(formbody);

// Global currentTenantId para uso nos Repositories
(global as any).currentTenantId = process.env.TENANT_ID || 'default';

app.get('/health', async () => ({ status: 'ok', tenant: (global as any).currentTenantId }));

// Registro dinâmico das rotas geradas
app.register(appRoutes);

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('✅ Server running on http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
`;
    }
}
