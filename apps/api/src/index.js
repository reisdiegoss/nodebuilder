import Fastify from 'fastify';
import cors from '@fastify/cors';
import { dockerService } from './services/docker.service.js';
import { prisma } from '../../../packages/database/index.js';
const fastify = Fastify({
    logger: true
});
fastify.register(cors);
// Rota de Healthcheck
fastify.get('/health', async (request, reply) => {
    const dockerInfo = await dockerService.testConnection();
    return {
        status: 'ok',
        service: 'NodeBuilder API',
        docker: dockerInfo
    };
});
// Listar Projetos
fastify.get('/projects', async () => {
    return await prisma.project.findMany({
        include: { modules: true }
    });
});
// Salvar/Atualizar Módulo (Página/Tabela)
fastify.post('/modules', async (request, reply) => {
    const { name, type, schema, projectId } = request.body;
    const module = await prisma.module.create({
        data: {
            name,
            type,
            schema,
            projectId
        }
    });
    return module;
});
const start = async () => {
    try {
        // Garantir que existe um Tenant e Projeto inicial para testes
        const tenant = await prisma.tenant.upsert({
            where: { slug: 'default' },
            update: {},
            create: { name: 'Default Tenant', slug: 'default' }
        });
        await prisma.project.upsert({
            where: { id: 'default-project' },
            update: {},
            create: {
                id: 'default-project',
                name: 'My First App',
                tenantId: tenant.id
            }
        });
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Server pronto em http://localhost:3000');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map