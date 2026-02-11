import type { Table } from '../interfaces';

export class ApiRouteGenerator {
  public static generateRoutes(tables: Table[]): string {
    const imports = `
import { FastifyInstance } from 'fastify';
import { RuntimeCRUDService } from './services/RuntimeCRUDService';
import { prisma } from './infra/database';
`;

    let routes = `
export async function appRoutes(app: FastifyInstance) {
  const runtime = new RuntimeCRUDService(prisma);
`;

    tables.forEach((table: Table) => {
      const modelName = table.name.toLowerCase();

      routes += `
  // --- ${table.name} ---

  // List (GET)
  app.get('/api/v1/${modelName}', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    return await runtime.handleList('${modelName}', req.query, tenantId);
  });

  // Lookup (GET)
  app.get('/api/v1/${modelName}/lookup', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    return await runtime.handleLookup('${modelName}', req.query.search, tenantId);
  });

  // Create (POST)
  app.post('/api/v1/${modelName}', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    const data = { ...req.body, tenantId };
    if (data.id) delete data.id;
    // @ts-ignore
    return await prisma.${modelName}.create({ data });
  });

  // Update (PUT)
  app.put('/api/v1/${modelName}/:id', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    const data = { ...req.body, tenantId }; // TenantId imutável geralmente, mas garantindo contexto
    delete data.id; // Nunca alterar ID
    // @ts-ignore
    return await prisma.${modelName}.update({ where: { id: req.params.id }, data });
  });

  // Delete (DELETE)
  app.delete('/api/v1/${modelName}/:id', async (req: any, reply) => {
    // @ts-ignore
    await prisma.${modelName}.delete({ where: { id: req.params.id } });
    return { success: true };
  });
`;
    });

    routes += `\n}`;
    return imports + routes;
  }
}
