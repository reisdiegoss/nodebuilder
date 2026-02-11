import { OOPEngineService } from './oop-engine.service';
import { BoilerplateService } from './boilerplate.service';
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

        return result;
    }

    private generateModernNPage(table: Table, tenantType: string): string {
        const className = this.capitalize(table.name);
        const low = table.name.toLowerCase();

        return `import React from 'react';
import { NPage, NForm, NDataGrid, ${this.getRequiredWidgets(table)} } from '@nodebuilder/core';
import { z } from 'zod';

export default class ${className}Page extends NPage {
    private form = new NForm('${className}');

    private schema = z.object({
        ${table.fields.map(f => `${f.name}: z.${this.mapZodType(f.type)}${f.isNullable ? '.optional()' : ''}`).join(',\n        ')}
    });

    onLoad() {
        this.form.linkTo('${className}', this.schema);
    }

    render() {
        return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">${className}</h1>
                        <p className="text-zinc-500">Gestão inteligente de ${low} com isolamento SaaS.</p>
                    </div>
                    <button 
                        onClick={() => this.form.save()} 
                        className="bg-brand-blue text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Salvar Registro
                    </button>
                </header>

                <div className="grid grid-cols-1 xl:col-span-4 gap-8">
                    <div className="xl:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                        <header className="flex justify-between items-center mb-2">
                            <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Formulário</h3>
                        </header>
                        ${table.fields.filter(f => f.widget !== 'NDataGrid').map(f => this.renderModernWidget(f)).join('\n                        ')}
                    </div>

                    <div className="xl:col-span-3 space-y-6">
                        <NDataGrid 
                            table="${className}"
                            columns={[
                                ${table.fields.map(f => `{ label: '${f.name}', key: '${f.name}' }`).join(',\n                                ')}
                            ]}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

    // Helper method for Prisma type mapping, assuming it's needed for convertERDToPrisma
    // This method is not present in the original code, so it's added as a placeholder.
    private static mapType(type: string): string {
        switch (type.toLowerCase()) {
            case 'string': return 'String';
            case 'number': return 'Int'; // Assuming integer for number, could be Float/Decimal
            case 'boolean': return 'Boolean';
            case 'date': return 'DateTime';
            case 'uuid': return 'String'; // Prisma uses String for UUID
            default: return 'String';
        }
    }

    static convertERDToPrisma(tables: ERDTable[]): string {
        let schema = `// NodeBuilder Generated Schema\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\n`;

        tables.forEach(table => {
            const className = SmartParser.prototype.capitalize(table.name); // Use prototype for static context
            schema += `model ${className} {\n`;

            table.fields.forEach(field => {
                let type = SmartParser.mapType(field.type); // Use the static helper
                let decorators = '';

                if (field.isPrimary) {
                    decorators += ' @id @default(uuid())';
                }

                if (field.isNullable && !field.isPrimary) {
                    type += '?';
                }

                // Inteligência de Relação (FK) MadBuilder
                if (field.name.endsWith('_id') && !field.isPrimary) {
                    const relationName = field.name.replace('_id', '');
                    const targetModel = SmartParser.prototype.capitalize(relationName); // Use prototype for static context
                    // Campo FK físico
                    schema += `  ${field.name} String${field.isNullable ? '?' : ''}\n`;
                    // Campo de Relação Lógica
                    schema += `  ${relationName} ${targetModel}${field.isNullable ? '?' : ''} @relation(fields: [${field.name}], references: [id])\n`;
                    return;
                }

                schema += `  ${field.name} ${type}${decorators}\n`;
            });

            // Isolação de Dados Nativa (Blindagem SaaS)
            schema += `  tenantId String\n`;
            schema += `  createdAt DateTime @default(now())\n`;
            schema += `  updatedAt DateTime @updatedAt\n\n`;

            // Índices Pro
            schema += `  @@index([tenantId])\n`;
            schema += `}\n\n`;
        });

        return schema;
    }

    private renderModernWidget(field: Field): string {
        const widget = this.autoMapWidget(field);
        let extraProps = '';

        if (widget === 'NUniqueSearch') {
            // Inteligência MadBuilder: se terminar em _id, busca na tabela pluralizada
            const targetTable = field.name.endsWith('_id')
                ? field.name.replace('_id', 's')
                : field.name;
            extraProps = ` targetTable="${targetTable}" value={this.form.getData('${field.name}')} onSelect={(val) => this.form.setData({ ${field.name}: val.id })} `;
        } else {
            extraProps = ` value={this.form.getData('${field.name}')} onChange={(val) => this.form.setData({ ${field.name}: val })} `;
        }

        return `<${widget} label="${field.label || field.name}" name="${field.name}"${extraProps}/>`;
    }

    private autoMapWidget(field: Field): string {
        if (field.widget) return field.widget;
        const name = field.name.toLowerCase();
        const type = field.type.toLowerCase();

        if (type === 'date' || name.includes('data')) return 'NDate';
        if (type === 'file' || name.includes('arquivo') || name.includes('imagem')) return 'NFile';
        if (name.includes('senha') || name.includes('password')) return 'NPassword';
        if (name.endsWith('_id')) return 'NUniqueSearch';
        if (type === 'boolean') return 'NCheckbox';
        if (type === 'number') return 'NInput';
        return 'NInput';
    }

    private generateModernRepository(table: Table, tenantType: string): string {
        const className = this.capitalize(table.name);
        const low = table.name.toLowerCase();

        // Injeção de Segurança Industrial: Tenant interceptor total
        const tenantVariable = `(global as any).currentTenantId`;

        return `import { prisma } from '../infra/database';

export class ${className}Repository {
    async findAll(page = 1, limit = 20, search = '', sort?: string, dir?: 'asc' | 'desc') {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        
        const where: any = {
            ${tenantType === 'SINGLE_DB' ? `tenantId: ${tenantVariable},` : ''}
            ...(search ? { 
                OR: [
                    ${table.fields.filter(f => f.type === 'string').map(f => `{ ${f.name}: { contains: search, mode: 'insensitive' } }`).join(',\n                    ')}
                ]
            } : {})
        };

        const [data, total] = await Promise.all([
            prisma.${low}.findMany({
                where,
                take,
                skip,
                orderBy: sort ? { [sort]: dir || 'asc' } : { createdAt: 'desc' },
                include: {
                    ${table.fields.filter(f => f.name.endsWith('_id')).map(f => f.name.replace('_id', ': true')).join(',\n                    ')}
                }
            }),
            prisma.${low}.count({ where })
        ]);

        return { data, total, totalPages: Math.ceil(total / take), page };
    }

    async findById(id: string) {
        return await prisma.${low}.findFirst({
            where: { 
                id,
                ${tenantType === 'SINGLE_DB' ? `tenantId: ${tenantVariable}` : ''}
            },
            include: {
                ${table.fields.filter(f => f.name.endsWith('_id')).map(f => f.name.replace('_id', ': true')).join(',\n                ')}
            }
        });
    }

    async create(data: any) {
        const payload = { ...data };
        if (!payload.id) payload.id = undefined;
        ${tenantType === 'SINGLE_DB' ? `payload.tenantId = ${tenantVariable};` : ""}
        return await prisma.${low}.create({ data: payload });
    }

    async update(id: string, data: any) {
        const where = { 
            id,
            ${tenantType === 'SINGLE_DB' ? `tenantId: ${tenantVariable}` : ''}
        };
        return await prisma.${low}.updateMany({ where, data });
    }

    async delete(id: string) {
        const where = { 
            id,
            ${tenantType === 'SINGLE_DB' ? `tenantId: ${tenantVariable}` : ''}
        };
        return await prisma.${low}.deleteMany({ where });
    }
}
`;
    }

    private generateModernMainFile(n: string, u: string, p: string, t: Table[], w: WebhookDefinition[]): string {
        return `// Server Enterprise NodeBuilder 2.0\nimport Fastify from 'fastify';\nconst server = Fastify();\nserver.listen({ port: 3000 });`;
    }
}
