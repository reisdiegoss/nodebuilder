/**
 * ApiRouteGenerator
 * Responsável por criar o arquivo 'routes.ts' dentro do projeto gerado.
 * Ele expõe os endpoints que os widgets visuais vão consumir.
 */
export class ApiRouteGenerator {

    public static generateRoutes(modules: any[]): string {
        const imports = `
import { FastifyInstance } from 'fastify';
import { RuntimeCRUDService } from './services/RuntimeCRUDService';
import { prisma } from './infra/database';
`;

        let routes = `
export async function appRoutes(app: FastifyInstance) {
  const runtime = new RuntimeCRUDService(prisma);
`;

        // Para cada tabela/módulo desenhado, cria as rotas CRUD
        modules.forEach(mod => {
            const modelName = mod.name.toLowerCase(); // ex: 'clientes'
            const modelCapitalized = mod.name; // Presumindo que o nome da tabela venha Capitalized do ERD, senão precisaríamos tratar

            routes += `
  // Rotas para o módulo: ${mod.name}
  
  // 1. Listagem para NDataGrid
  app.get('/api/v1/${modelName}', async (req: any, reply) => {
    // Fallback seguro: se não houver tenant no request (dev mode), usa o global
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    const result = await runtime.handleList('${modelName}', req.query, tenantId);
    return result;
  });

  // 2. Lookup para NUniqueSearch
  app.get('/api/v1/${modelName}/lookup', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    const result = await runtime.handleLookup('${modelName}', req.query.search, tenantId);
    return result;
  });

  // 3. Salvar (Create) para NForm
  app.post('/api/v1/${modelName}', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    const data = { ...req.body, tenantId: tenantId };
    
    // Garantia de Create
    if (data.id) delete data.id;

    // @ts-ignore
    const result = await prisma.${modelName}.create({ data });
    return result;
  });

  // 4. Atualizar (Update) para NForm
  app.put('/api/v1/${modelName}/:id', async (req: any, reply) => {
    const tenantId = req.user?.tenantId || (global as any).currentTenantId;
    const data = { ...req.body, tenantId: tenantId };
    
    // Remove ID do body para não conflitar com where
    if (data.id) delete data.id;

    // @ts-ignore
    const result = await prisma.${modelName}.update({ 
        where: { id: req.params.id }, 
        data 
    });
    return result;
  });
      
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
