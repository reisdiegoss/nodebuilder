import Fastify from 'fastify';
import cors from '@fastify/cors';
import { dockerService } from './services/docker.service.js';
import { MigrationService } from './services/migration.service.js';
import { SmartParser } from './services/smart-parser.js';
import { tenantMiddleware } from './middlewares/tenant.middleware.js';
import { InternalBillingService } from './services/billing.service.js';
import { AuthService } from './services/auth.service.js';
import { OAuthService } from './services/oauth.service.js';
import { userRepository } from './repositories/user.repository.js';
import { projectRepository } from './repositories/project.repository.js';
import { IntrospectionService } from './services/introspection.service.js';
import { moduleRepository } from './repositories/module.repository.js';
import { deploymentRepository } from './repositories/deployment.repository.js';
import { oopEngineService } from './services/oop-engine.service.js';
import { importerService } from './services/importer.service.js';
import { AsaasService } from './services/asaas.service.js';
import { AuditRepository } from './repositories/audit.repository.js';
import { ExportService } from './services/export.service.js';
import { workflowRepository } from './repositories/workflow.repository.js';
import { WorkflowExecutor } from './services/workflow-executor.service.js';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prisma } from '../../../packages/database/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true
});

fastify.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Swagger Configuration
fastify.register(swagger, {
    openapi: {
        info: {
            title: 'NodeBuilder IDE API',
            description: 'API central do NodeBuilder SaaS e Engine de Geração',
            version: '0.5.0'
        },
        servers: [{ url: 'http://localhost:3000' }],
    }
});

fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false
    }
});

const start = async () => {
    try {
        await fastify.register(cors);

        // Bootstrap: Garantir Tenant Padrão (Industrial 01)
        const defaultTenant = await prisma.tenant.upsert({
            where: { slug: 'default' },
            update: {},
            create: {
                id: 'default-tenant-id',
                name: 'Default Industrial Tenant',
                slug: 'default',
                plan: 'ENTERPRISE',
                status: 'ACTIVE'
            }
        });
        (global as any).defaultTenantId = defaultTenant.id;
        console.log('✅ [Bootstrap] Tenant Industrial Garantido:', defaultTenant.id);

        // Middleware de Tenant
        fastify.addHook('preHandler', tenantMiddleware);

        // Rotas de Saúde
        fastify.get('/health', async () => {
            const dockerInfo = await dockerService.testConnection();
            return {
                status: 'ok',
                docker: dockerInfo
            };
        });

        // Rotas de Módulos (Via Repository)
        fastify.get('/modules', async (request) => {
            return await moduleRepository.findAll();
        });

        fastify.post('/modules', async (request) => {
            const body = request.body as any;
            return await moduleRepository.upsert(body);
        });

        // Rotas de Projetos e Deploy (Via Repository)
        fastify.get('/projects', async (request) => {
            const tenantId = (request as any).tenantId;
            return await projectRepository.findAllByTenant(tenantId);
        });

        fastify.post('/projects', async (request) => {
            const body = request.body as any;
            const tenantId = (request as any).tenantId;
            return await projectRepository.create({ ...body, tenantId });
        });

        // Databases Management (Multi-DB)
        fastify.get('/projects/:id/databases', async (request) => {
            const { id } = request.params as any;
            return await prisma.projectDatabase.findMany({ where: { projectId: id } });
        });

        fastify.post('/projects/:id/databases', async (request) => {
            const { id } = request.params as any;
            const body = request.body as any;
            return await prisma.projectDatabase.create({
                data: { ...body, projectId: id }
            });
        });

        fastify.delete('/databases/:id', async (request) => {
            const { id } = request.params as any;
            return await prisma.projectDatabase.delete({ where: { id } });
        });

        fastify.get('/databases/:id/inspect', async (request) => {
            const { id } = request.params as any;
            return await IntrospectionService.inspect(id);
        });

        fastify.post('/projects/deploy', async (request, reply) => {
            const { projectName } = request.body as any;
            const tenantId = (request as any).tenantId;

            try {
                const service = await dockerService.createSwarmService(projectName, tenantId);

                // MOCK: Em produção salvaríamos o ID do serviço no Deployment
                const deployment = await prisma.deployment.create({
                    data: {
                        projectId: projectName, // MOCK: Deveria ser o UUID do projeto
                        url: `http://localhost:${service.port}`,
                        status: 'RUNNING',
                        tenantId,
                        port: 3000 // Porta padrão para o container
                    }
                });

                return {
                    status: 'success',
                    url: `http://localhost:${service.port}`,
                    serviceId: service.id
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.status(500).send({ error: 'Falha no deploy do projeto' });
            }
        });

        fastify.post('/projects/undeploy', async (request, reply) => {
            const { serviceId } = request.body as any;
            try {
                await dockerService.removeSwarmService(serviceId);
                return { status: 'success' };
            } catch (err) {
                return reply.status(500).send({ error: 'Falha ao remover serviço' });
            }
        });

        // Dashboard de Métricas
        fastify.get('/stats', async (request) => {
            const tenantId = (request as any).tenantId;
            const projects = await projectRepository.findAllByTenant(tenantId);
            const deployments = await prisma.deployment.findMany({ where: { tenantId } });
            const activeDeployments = deployments.filter(d => d.status === 'RUNNING');

            return {
                totalProjects: projects.length,
                activeDeployments: activeDeployments.length,
                totalDeployments: deployments.length,
                usage: {
                    storage: '1.2GB',
                    containers: activeDeployments.length
                }
            };
        });

        // Orquestrador de Lançamento (Launch Wizard)
        fastify.post('/projects/:id/launch', async (request, reply) => {
            const { id } = request.params as any;
            const tenantId = (request as any).tenantId;
            const resolvedTenant = (request as any).resolvedTenant;
            const tenantSlug = resolvedTenant?.slug || 'default';

            // SaaS Guard: Bloquear Launch se o Tenant não estiver Ativo
            if (resolvedTenant && resolvedTenant.status !== 'ACTIVE') {
                return reply.status(402).send({
                    error: 'ACCOUNT_SUSPENDED',
                    message: 'Seu plano está inativo ou com pagamentos pendentes. Por favor, regularize sua conta para lançar projetos.'
                });
            }

            try {
                // 1. Buscar Projeto e Tabelas
                const project = await projectRepository.findById(id);
                if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });

                // MOCK/Body: Tabelas e Configs de Banco
                const { tables, dbType, multiTenantType } = request.body as any;
                const finalDbType = dbType || 'sqlite';

                // 2. Gerar Código
                const smartParser = new SmartParser();
                const files = smartParser.generateProject(project.name, tenantSlug, project.name, tables || [], [], {
                    multiTenantType: multiTenantType || 'SINGLE_DB',
                    dbType: finalDbType
                });

                // 3. Preparar Pasta Física (Bind Mount)
                const storageDir = path.resolve(__dirname, '../../../../storage/projects', id);
                await fs.mkdir(storageDir, { recursive: true });

                for (const [filePath, content] of Object.entries(files)) {
                    const fullPath = path.join(storageDir, filePath);
                    await fs.mkdir(path.dirname(fullPath), { recursive: true });
                    await fs.writeFile(fullPath, content);
                }

                // 4. Criar Container/Serviço (Montando a pasta física)
                const service = await dockerService.createSwarmService(project.name, tenantId, finalDbType, storageDir);

                return {
                    status: 'success',
                    url: `http://localhost:${service.port}`,
                    serviceId: service.id,
                    storagePath: storageDir
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.status(500).send({ error: 'Falha no Launch do projeto' });
            }
        });

        fastify.get('/migrations/status', async (request) => {
            const migrationService = new MigrationService();
            return await migrationService.getStatus();
        });

        fastify.post('/docker/cleanup', async () => {
            const services = await dockerService.listSwarmServices();
            for (const s of services) {
                await dockerService.removeSwarmService(s.ID!);
            }
            return { status: 'cleaned', count: services.length };
        });

        // EXPORT INTEGRATION
        fastify.get('/projects/:id/export', async (request, reply) => {
            const { id } = request.params as any;
            const project = await projectRepository.findById(id);
            if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });

            const smartParser = new SmartParser();
            const files = smartParser.generateProject(project.name, 'default', project.name, []);

            const exportService = new ExportService();
            const zipBuffer = await exportService.exportToZip(files);

            reply.header('Content-Type', 'application/zip');
            reply.header('Content-Disposition', `attachment; filename=${project.name}.zip`);
            return zipBuffer;
        });

        // IMPORTER INTEGRATION
        fastify.post('/import/sql', async (request, reply) => {
            const data = await request.file();
            if (!data) return reply.status(400).send({ error: 'Arquivo SQL não enviado' });

            const content = await data.toBuffer();
            const tables = await importerService.parseSQL(content);

            return { tables };
        });

        fastify.post('/import/json', async (request) => {
            const body = request.body as any;
            return importerService.parseJSON(body);
        });

        fastify.post('/import/erd', async (request, reply) => {
            const { tables, userId, projectId } = request.body as any;
            const result = await importerService.bulkImportERD(projectId, tables);
            return result;
        });

        // BILLING INTEGRATION
        fastify.get('/billing/usage', async (request) => {
            const tenantId = (request as any).tenantId;
            return await InternalBillingService.getTenantUsage(tenantId);
        });

        // WORKFLOW INTEGRATION
        fastify.get('/workflows', async (request) => {
            const tenantId = (request as any).tenantId;
            return await workflowRepository.findAllByTenant(tenantId);
        });

        fastify.post('/workflows', async (request) => {
            const body = request.body as any;
            const tenantId = (request as any).tenantId;
            return await workflowRepository.create({ ...body, tenantId });
        });

        fastify.get('/workflows/:id', async (request) => {
            return await workflowRepository.findById((request.params as any).id);
        });

        fastify.put('/workflows/:id', async (request) => {
            return await workflowRepository.update((request.params as any).id, request.body as any);
        });

        fastify.post('/workflows/:id/execute', async (request) => {
            return await WorkflowExecutor.executeWorkflow((request.params as any).id, request.body as any);
        });

        // AUTH INTEGRATION
        fastify.post('/auth/login', async (request, reply) => {
            const { email, password } = request.body as any;
            try {
                const user = await AuthService.login(email, password);
                return { status: 'success', user };
            } catch (err) {
                return reply.status(401).send({ error: (err as any).message });
            }
        });

        fastify.post('/auth/register', async (request, reply) => {
            const body = request.body as any;
            try {
                const result = await AuthService.signup(body);
                return { status: 'success', ...result };
            } catch (err) {
                return reply.status(400).send({ error: (err as any).message });
            }
        });

        fastify.get('/auth/google/url', async () => {
            return await OAuthService.getGoogleAuthUrl();
        });

        // ASAAS INTEGRATION
        fastify.post('/webhooks/asaas', async (request) => {
            return await AsaasService.handleWebhook(request.body as any);
        });

        // AUDIT INTEGRATION
        fastify.get('/audit', async (request) => {
            const tenantId = (request as any).tenantId;
            return await AuditRepository.findByTenant(tenantId);
        });

        // PORT LIMITS INTEGRATION
        fastify.get('/ports/next', async () => {
            return { port: await dockerService.getNextAvailablePort() };
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 [Industrial 01] NodeBuilder API Online na porta 3000');
    } catch (err) {
        console.error('❌ Erro no boot da API:', err);
        process.exit(1);
    }
};

start();
