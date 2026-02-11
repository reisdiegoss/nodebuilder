import type { ERDTable } from './migration.service';

export class SwaggerService {
    /**
     * Gera um Swagger JSON dinâmico baseado nos modelos e webhooks do projeto
     */
    static async generateProjectSwagger(projectId: string, erdTables: ERDTable[], webhooks: any[]) {
        const swagger: any = {
            openapi: '3.0.0',
            info: {
                title: `API do Projeto: ${projectId}`,
                description: 'Interface REST gerada automaticamente pelo NodeBuilder.',
                version: '1.5.0'
            },
            paths: {},
            components: {
                schemas: {},
                securitySchemes: {
                    RestKey: { type: 'apiKey', in: 'header', name: 'x-rest-key' }
                }
            },
            security: [{ RestKey: [] }]
        };

        erdTables.forEach(table => {
            const path = `/v1/${table.name.toLowerCase()}`;
            const className = table.name;

            swagger.paths[path] = {
                get: {
                    summary: `Listar ${className}`,
                    tags: [className],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'q', in: 'query', description: 'Busca rápida', schema: { type: 'string' } }
                    ],
                    responses: { 200: { description: 'OK' } }
                },
                post: {
                    summary: `Criar ${className}`,
                    tags: [className],
                    requestBody: { content: { 'application/json': { schema: { $ref: `#/components/schemas/${className}` } } } },
                    responses: { 201: { description: 'Criado' } }
                }
            };

            swagger.paths[`${path}/{id}`] = {
                get: { tags: [className], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] },
                put: { tags: [className], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] },
                delete: { tags: [className], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }
            };

            // Schema dinâmico
            swagger.components.schemas[className] = {
                type: 'object',
                properties: table.fields.reduce((acc: any, f: any) => {
                    acc[f.name] = { type: f.type === 'number' ? 'integer' : 'string' };
                    return acc;
                }, {})
            };
        });

        return swagger;
    }
}
