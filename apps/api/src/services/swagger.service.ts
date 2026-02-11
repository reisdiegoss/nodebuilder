export class SwaggerService {
    /**
     * Gera um Swagger JSON dinâmico baseado nos modelos e webhooks do projeto
     */
    static async generateProjectSwagger(projectId: string, modules: any[], webhooks: any[]) {
        const swagger: any = {
            openapi: '3.0.0',
            info: { title: `Project ${projectId} API`, version: '1.0.0' },
            paths: {},
            components: { schemas: {} }
        };

        // Adicionar rotas de CRUD (Modules & Tables)
        modules.forEach(m => {
            const path = `/${m.name.toLowerCase()}`;
            swagger.paths[path] = {
                get: {
                    summary: `Listar todos os ${m.name}`,
                    tags: [m.name],
                    responses: { 200: { description: 'Lista de dados retornada com sucesso' } }
                },
                post: {
                    summary: `Criar novo ${m.name}`,
                    tags: [m.name],
                    responses: { 201: { description: 'Registro criado' } }
                }
            };

            // Suporte a Id Único
            swagger.paths[`${path}/{id}`] = {
                get: { tags: [m.name], parameters: [{ name: 'id', in: 'path', required: true }] },
                put: { tags: [m.name], parameters: [{ name: 'id', in: 'path', required: true }] },
                delete: { tags: [m.name], parameters: [{ name: 'id', in: 'path', required: true }] }
            };
        });

        // Adicionar rotas de Webhooks
        webhooks.forEach(w => {
            const path = `/webhooks/${w.url}`;
            swagger.paths[path] = {
                post: { tags: ['Webhooks'], responses: { 200: { description: 'Recebido' } } }
            };
        });

        return swagger;
    }
}
