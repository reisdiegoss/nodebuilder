export class BoilerplateGenerator {
    static generateDatabaseConfig(projectSlug: string) {
        return `import { PrismaClient } from '@prisma/client';
import { createTriggerExtension } from '../../../../apps/api/src/services/trigger.interceptor';

const baseClient = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

// Injeção de Inteligência de Runtime
export const prisma = baseClient.$extends(createTriggerExtension('${projectSlug}'));
export default prisma;
`;
    }

    static generateServerMain() {
        return `import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { appRoutes } from './routes';

const app = Fastify({ logger: true });

app.register(cors);
app.register(formbody);

(global as any).currentTenantId = process.env.TENANT_ID || 'default';

app.get('/health', async () => ({ status: 'ok', tenant: (global as any).currentTenantId }));

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

    static generateRuntimeCRUDService() {
        return `import { PrismaClient } from '@prisma/client';

export class RuntimeCRUDService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async handleList(model: string, query: any, tenantId: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const take = limit > 100 ? 100 : limit;
    const skip = (page - 1) * take;
    const search = query.search || '';
    const sortField = query.sort || 'createdAt';
    const sortDir = query.dir || 'desc';

    const where: any = { tenantId };

    try {
        // @ts-ignore
        const delegate = this.prisma[model];
        if (!delegate) throw new Error(\`Model \${model} Not Found\`);

        const [total, data] = await Promise.all([
          delegate.count({ where }),
          delegate.findMany({
            where,
            take,
            skip,
            orderBy: { [sortField]: sortDir }
          })
        ]);
    
        return { data, total, page, totalPages: Math.ceil(total / take) };
    } catch (e) {
        console.error(e);
        return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async handleLookup(model: string, search: string, tenantId: string) {
    try {
        // @ts-ignore
        const delegate = this.prisma[model];
        if (!delegate) return [];
        return await delegate.findMany({ where: { tenantId }, take: 20 });
    } catch (e) {
        console.error(e);
        return [];
    }
  }
}
`;
    }
}
