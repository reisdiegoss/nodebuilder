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

        fastify.post('/projects/deploy', async (request, reply) => {
            const { projectName } = request.body as any;
            const tenantId = (request as any).tenantId;

            try {
                const service = await dockerService.createSwarmService(projectName, tenantId);

                // MOCK: Em produção salvaríamos o ID do serviço no Deployment
                await prisma.deployment.create({
                    data: {
                        projectId: projectName, // MOCK: Deveria ser o UUID do projeto
                        containerId: service.id,
                        status: 'RUNNING',
                        url: `http://nodebuilder.com/${(request as any).resolvedTenant?.slug || 'default'}/${projectName}`
                    }
                } as any);

                return service;
            } catch (err) {
                fastify.log.error(err);
                return reply.status(500).send({ error: 'Falha ao orquestrar Swarm Service' });
            }
        });

        fastify.post('/projects/undeploy', async (request) => {
            const { serviceId } = request.body as any;
            return await dockerService.removeSwarmService(serviceId);
        });

        // A Ponte de Ouro: ERD -> Banco Real
        fastify.post('/migrations/sync', async (request, reply) => {
            const { projectId, containerId, tables } = request.body as any;

            try {
                // 1. Gerar Schema
                const prismaSchema = MigrationService.convertERDToPrisma(tables);

                // 2. Sincronizar com Container
                if (containerId) {
                    await dockerService.syncFiles(containerId, [
                        { path: 'prisma/schema.prisma', content: prismaSchema }
                    ]);

                    // 3. Notificar o usuário (Hot Update pronto)
                    fastify.log.info(`Banco de Dados do Projeto ${projectId} atualizado.`);
                }

                return { success: true, schema: prismaSchema };
            } catch (err) {
                fastify.log.error(err);
                return reply.status(500).send({ error: 'Erro ao sincronizar banco de dados' });
            }
        });

        // Rotas da Enterprise Engine (Smart Parser 2.0)
        fastify.post('/engine/generate/oop', async (request) => {
            const { projectName, userSlug, projectSlug, tables, webhooks } = request.body as any;
            const smartParser = new SmartParser();
            return smartParser.generateProject(projectName, userSlug, projectSlug, tables, webhooks);
        });

        // SaaS/IDE: Experiência do Cliente
        fastify.get('/admin/projects/:id/files', async () => {
            // Mock de estrutura de arquivos
            return [
                { name: 'src', type: 'dir', children: [{ name: 'entities', type: 'dir' }] },
                { name: 'package.json', type: 'file' }
            ];
        });

        fastify.post('/admin/projects/export', async (request, reply) => {
            const { projectName, files } = request.body as any;
            const zipResult = await ExportService.generateZip(projectName, files);
            return reply.send(zipResult);
        });

        // Rotas do Importador Inteligente
        fastify.post('/importer/analyze', async (request, reply) => {
            const data = await request.file();
            if (!data) return reply.status(400).send({ error: 'Nenhum arquivo enviado' });

            const buffer = await data.toBuffer();
            const type = data.filename.endsWith('.csv') ? 'csv' : 'xlsx';

            return await importerService.analyzeFile(buffer, type);
        });

        fastify.post('/importer/suggest', async (request) => {
            const { fileHeaders, schemaFields } = request.body as any;
            return importerService.getMappingSuggestions(fileHeaders, schemaFields);
        });

        fastify.post('/importer/confirm', async (request, reply) => {
            const { fileBase64, fileType, mapping, targetModel } = request.body as any;
            const buffer = Buffer.from(fileBase64, 'base64');

            // Mapear o repositório correto dinamicamente para o MVP
            const repositories: Record<string, any> = {
                'user': userRepository,
                'project': projectRepository
            };

            const repo = repositories[targetModel.toLowerCase()];
            if (!repo) return reply.status(400).send({ error: 'Modelo não suportado para importação' });

            return await importerService.processImport(buffer, fileType, mapping, repo);
        });

        // Rotas de Faturamento (Interno)
        fastify.post('/billing/check', async () => {
            await InternalBillingService.checkSubscribers();
            return { status: 'success', message: 'Verificação de assinaturas concluída.' };
        });

        fastify.post('/billing/pay', async (request) => {
            const { tenantId } = request.body as any;
            return await InternalBillingService.createPaymentIntent(tenantId);
        });

        // Rotas de Workflows (Low-Code Automation)
        fastify.get('/workflows', async (request) => {
            const projectId = (request.query as any).projectId;
            return await workflowRepository.findAllByProject(projectId);
        });

        fastify.get('/workflows/:id', async (request) => {
            const { id } = request.params as any;
            return await workflowRepository.findById(id);
        });

        fastify.post('/workflows', async (request) => {
            const body = request.body as any;
            return await workflowRepository.upsert(body);
        });

        fastify.delete('/workflows/:id', async (request) => {
            const { id } = request.params as any;
            return await workflowRepository.delete(id);
        });

        fastify.post('/workflows/hooks/:id', async (request) => {
            const { id } = request.params as any;
            const payload = request.body || {};
            await WorkflowExecutor.executeWorkflow(id, payload);
            return { status: 'Workflow triggered' };
        });

        // Rotas de Autenticação
        fastify.post('/auth/signup', async (request) => {
            const body = request.body as any;
            return await AuthService.signup(body);
        });

        fastify.post('/auth/login', async (request) => {
            const { email, password } = request.body as any;
            return await AuthService.login(email, password);
        });

        fastify.post('/auth/oauth/firebase', async (request) => {
            const { idToken } = request.body as any;
            return await OAuthService.handleFirebaseSession(idToken);
        });

        // Inicialização
        // SaaS: Recebimento de Webhooks Asaas
        fastify.post('/billing/webhooks/asaas', async (request, reply) => {
            const payload = request.body as any;
            await AsaasService.handleWebhook(payload);
            return reply.send({ received: true });
        });

        // SaaS: Auditoria de Logs
        fastify.get('/admin/logs', async () => {
            return await AuditRepository.getLogs();
        });

        // SaaS: Gestão Global de Projetos (CRUD c/ POO)
        fastify.get('/admin/projects', async () => {
            return await projectRepository.findAllGlobal();
        });

        fastify.delete('/admin/projects/:id', async (request) => {
            const { id } = request.params as any;
            return await projectRepository.delete(id);
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Server pronto em http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
