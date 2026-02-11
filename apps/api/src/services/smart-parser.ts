import { OOPEngineService } from './oop-engine.service';
import { BoilerplateService } from './boilerplate.service';
import { ApiRouteGenerator } from './api-route-generator';
import type { Table, Field, WebhookDefinition } from './oop-engine.service';

/**
 * Refatoração Integral do Motor de Geração (Parser 2.0)
 * Focado em @nodebuilder/core e Multi-tenancy
 */
export class SmartParser extends OOPEngineService {
    // Sobrescrevendo para usar o novo padrão consolidado
    generateProject(projectName: string, userSlug: string, projectSlug: string, tables: Table[], webhooks: WebhookDefinition[] = [], options: { multiTenantType: 'SINGLE_DB' | 'MULTI_DB' } = { multiTenantType: 'SINGLE_DB' }) {
        const result: Record<string, string> = {};

        tables.forEach(table => {
            const lowName = table.name.toLowerCase();
            result[`src/pages/${lowName}.page.tsx`] = this.generateModernNPage(table, options.multiTenantType);
            result[`src/entities/${lowName}.entity.ts`] = this.generateEntity(table);
            result[`src/repositories/${lowName}.repository.ts`] = this.generateModernRepository(table, options.multiTenantType);
        });

        webhooks.forEach(hook => {
            result[`src/webhooks/${hook.name.toLowerCase()}.webhook.ts`] = this.generateWebhookHandler(hook.name);
        });

        // InfraestruturaConsolidada
        result['src/infra/database.ts'] = BoilerplateService.generateDatabaseConfig(projectSlug, userSlug);
        result['src/index.ts'] = BoilerplateService.generateServerMain();
        result['package.json'] = this.generatePackageJson(projectName);

        // Runtime Backend (API Generator)
        result['src/services/RuntimeCRUDService.ts'] = BoilerplateService.generateRuntimeCRUDService();
        result['src/routes.ts'] = ApiRouteGenerator.generateRoutes(tables);

        return result;
    }

    public generateModernNPage(table: Table, projectConfig: any): string {
        const className = this.capitalize(table.name);
        // Suporte a diferentes formatos de config
        const isSingleDb = projectConfig?.multiTenantType === 'SINGLE_DB' || projectConfig === 'SINGLE_DB';

        return `import React from 'react';
import { NPage, NForm, NInput, NDataGrid, NUniqueSearch, NRow, NCol } from '@nodebuilder/core';
import { z } from 'zod';

export default class ${className}Page extends NPage {
    private form: NForm;

    constructor() {
        super();
        this.form = new NForm('${table.name}_form');
        this.form.linkTo('${className}');
        
        // Validação MadBuilder Pro
        this.form.setValidationSchema(z.object({
            ${table.fields.filter(f => !f.isPrimary).map(f => `${f.name}: z.string().min(1, 'Campo obrigatório')`).join(',\n            ')}
        }));

        ${isSingleDb ? `// Injeção de Segurança Multi-tenant Nativa\n        this.applyTenantFilter(session.tenantId);` : ''}
    }

    render() {
        return (
            <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
                <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">${table.name}</h1>
                        <p className="text-slate-400 text-sm font-medium">Gestão industrial de registros</p>
                    </div>
                    <button onClick={() => this.form.save()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200">
                        Salvar Registro
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                        <header className="border-b border-slate-100 pb-4">
                            <h3 className="text-slate-800 font-bold text-sm">Formulário</h3>
                        </header>
                        
                        <div className="space-y-4">
                            ${table.fields.filter(f => !f.isPrimary).map(f => this.renderIndustrialWidget(f)).join('\n                            ')}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <NDataGrid 
                            table="${className}"
                            columns={[
                                ${table.fields.map(f => `{ name: '${f.name}', label: '${f.name.toUpperCase()}', sortable: true }`).join(',\n                                ')}
                            ]}
                            pageSize={10}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private renderIndustrialWidget(field: any): string {
        // FK Detection MadBuilder
        if (field.name.endsWith('_id')) {
            const model = field.name.replace('_id', '');
            return \`<NUniqueSearch 
                                label="\${field.name.toUpperCase()}" 
                                targetModel="\${model}" 
                                targetEndpoint="/api/v1/\${model.toLowerCase()}" 
                                displayField="nome" 
                            />\`;
        }
        return \`<NInput label="\${field.name.toUpperCase()}" name="\${field.name}" />\`;
    }

    public static convertERDToPrisma(tables: any[]): string {
        let schema = \`// NodeBuilder Generated Schema\\ndatasource db {\\n  provider = "postgresql"\\n  url      = env("DATABASE_URL")\\n}\\n\\ngenerator client {\\n  provider = "prisma-client-js"\\n}\\n\\n\`;

        tables.forEach(table => {
            const className = SmartParser.prototype.capitalize(table.name);
            schema += \`model \${className} {\\n\`;

            table.fields.forEach((field: any) => {
                let type = SmartParser.mapType(field.type);
                let decorators = '';

                if (field.isPrimary) {
                    decorators += ' @id @default(uuid())';
                }

                if (field.isNullable && !field.isPrimary) {
                    type += '?';
                }

                if (field.name.endsWith('_id') && !field.isPrimary) {
                    const relationName = field.name.replace('_id', '');
                    const targetModel = SmartParser.prototype.capitalize(relationName);
                    schema += \`  \${field.name} String\${field.isNullable ? '?' : ''}\\n\`;
                    schema += \`  \${relationName} \${targetModel}\${field.isNullable ? '?' : ''} @relation(fields: [\${field.name}], references: [id])\\n\`;
                    return;
                }

                schema += \`  \${field.name} \${type}\${decorators}\\n\`;
            });

            schema += \`  tenantId String\\n\`;
            schema += \`  createdAt DateTime @default(now())\\n\`;
            schema += \`  updatedAt DateTime @updatedAt\\n\\n\`;
            schema += \`  @@index([tenantId])\\n\`;
            schema += \`}\${'\\n'}\`;
        });

        return schema;
    }

    private static mapType(type: string): string {
        switch (type?.toLowerCase()) {
            case 'string': case 'varchar': return 'String';
            case 'int': case 'number': case 'integer': return 'Int';
            case 'boolean': return 'Boolean';
            case 'date': case 'datetime': return 'DateTime';
            case 'float': return 'Float';
            default: return 'String';
        }
    }

    private generateModernRepository(table: Table, tenantType: string): string {
        const className = this.capitalize(table.name);
        const low = table.name.toLowerCase();
        const tenantVariable = \`(global as any).currentTenantId\`;

        return \`import { prisma } from '../infra/database';

export class \${className}Repository {
    async findAll(page = 1, limit = 20, search = '', sort?: string, dir?: 'asc' | 'desc') {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        
        const where: any = {
            \${tenantType === 'SINGLE_DB' ? \`tenantId: \${tenantVariable},\` : ''}
            ...(search ? { 
                OR: [
                    \${table.fields.filter(f => f.type === 'string').map(f => \`{ \${f.name}: { contains: search, mode: 'insensitive' } }\`).join(',\\n                    ')}
                ]
            } : {})
        };

        const [data, total] = await Promise.all([
            prisma.\${low}.findMany({
                where,
                take,
                skip,
                orderBy: sort ? { [sort]: dir || 'asc' } : { createdAt: 'desc' },
                include: {
                    \${table.fields.filter(f => f.name.endsWith('_id')).map(f => \`\${f.name.replace('_id', '')}: true\`).join(',\\n                    ')}
                }
            }),
            prisma.\${low}.count({ where })
        ]);

        return { data, total, totalPages: Math.ceil(total / take), page };
    }

    async findById(id: string) {
        return await prisma.\${low}.findFirst({
            where: { 
                id,
                \${tenantType === 'SINGLE_DB' ? \`tenantId: \${tenantVariable}\` : ''}
            }
        });
    }

    async create(data: any) {
        const payload = { ...data };
        \${tenantType === 'SINGLE_DB' ? \`payload.tenantId = \${tenantVariable};\` : ""}
        return await prisma.\${low}.create({ data: payload });
    }

    async update(id: string, data: any) {
        return await prisma.\${low}.updateMany({
            where: { id, \${tenantType === 'SINGLE_DB' ? \`tenantId: \${tenantVariable}\` : ''} },
            data
        });
    }

    async delete(id: string) {
        return await prisma.\${low}.deleteMany({
            where: { id, \${tenantType === 'SINGLE_DB' ? \`tenantId: \${tenantVariable}\` : ''} }
        });
    }
}
\`;
    }
}
