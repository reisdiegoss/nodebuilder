export interface Table {
    name: string;
    fields: Field[];
}

export interface Field {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'file';
    widget?: 'NInput' | 'NPassword' | 'NDataGrid' | 'NDate' | 'NSelect' | 'NDBSelect' | 'NUniqueSearch' | 'NFile';
    isPrimary?: boolean;
    isNullable?: boolean;
    db_field?: string; // Mapeamento para persistência automática
}

export interface WebhookDefinition {
    name: string;
    path: string;
    description: string;
}

export class OOPEngineService {
    /**
     * Gera o código completo de um projeto baseado no novo @nodebuilder/core
     */
    generateProject(projectName: string, userSlug: string, projectSlug: string, tables: Table[], webhooks: WebhookDefinition[] = [], options: { multiTenantType: 'SINGLE_DB' | 'MULTI_DB' } = { multiTenantType: 'SINGLE_DB' }) {
        const result: Record<string, string> = {};

        tables.forEach(table => {
            const lowName = table.name.toLowerCase();
            result[`src/pages/${lowName}.page.tsx`] = this.generateNPage(table, options.multiTenantType);
            result[`src/entities/${lowName}.entity.ts`] = this.generateEntity(table);
            result[`src/repositories/${lowName}.repository.ts`] = this.generateRepository(table, options.multiTenantType);
        });

        webhooks.forEach(hook => {
            result[`src/webhooks/${hook.name.toLowerCase()}.webhook.ts`] = this.generateWebhookHandler(hook.name);
        });

        result['src/index.ts'] = this.generateMainFile(projectName, userSlug, projectSlug, tables, webhooks);
        result['package.json'] = this.generatePackageJson(projectName);

        return result;
    }

    private generateNPage(table: Table, tenantType: string): string {
        const className = this.capitalize(table.name);
        const low = table.name.toLowerCase();

        return `import React from 'react';
import { NPage, NForm, NDataGrid, ${this.getRequiredWidgets(table)} } from '@nodebuilder/core';

export default class ${className}Page extends NPage {
    private form = new NForm('${className}');

    onLoad() {
        console.log('Página ${className} carregada');
        this.form.linkTo('${className}');
    }

    render() {
        return (
            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Cadastro de ${className}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${table.fields.filter(f => f.widget !== 'NDataGrid').map(f => this.renderWidget(f)).join('\n                        ')}
                    </div>
                    <button 
                        onClick={() => this.form.save()} 
                        className="mt-6 bg-brand-blue px-6 py-2 rounded-lg font-bold hover:opacity-90"
                    >
                        Salvar ${className}
                    </button>
                </section>

                <section>
                    <NDataGrid 
                        title="Lista de ${className}"
                        columns={[
                            ${table.fields.map(f => `{ label: '${f.name}', key: '${f.name}' }`).join(',\n                            ')}
                        ]}
                        data={[]} // Conectado via Repository no runtime
                    />
                </section>
            </div>
        );
    }
}
`;
    }

    private renderWidget(field: Field): string {
        const widget = field.widget || 'NInput';
        const dbFieldAttr = field.db_field ? ` db_field="${field.db_field}"` : '';
        const onChangeAttr = ` onChange={(val) => this.form.setData({ ${field.name}: val })} `;

        return `<${widget} label="${field.name}"${dbFieldAttr}${onChangeAttr}/>`;
    }

    private getRequiredWidgets(table: Table): string {
        const widgets = new Set(table.fields.map(f => f.widget || 'NInput'));
        return Array.from(widgets).join(', ');
    }

    private generateRepository(table: Table, tenantType: string): string {
        const className = this.capitalize(table.name);
        const tenantFilter = tenantType === 'SINGLE_DB' ? `where: { tenantId: (global as any).currentTenantId }` : '';

        return `import { prisma } from '../infra/database';

export class ${className}Repository {
    async findAll() {
        return await prisma.${table.name.toLowerCase()}.findMany({ ${tenantFilter} });
    }

    async create(data: any) {
        const payload = { ...data };
        ${tenantType === 'SINGLE_DB' ? "payload.tenantId = (global as any).currentTenantId;" : ""}
        return await prisma.${table.name.toLowerCase()}.create({ data: payload });
    }
}
`;
    }

    protected generateEntity(table: Table): string {
        const className = this.capitalize(table.name);
        let fields = table.fields.map(f => `    ${f.name}${f.isNullable ? '?' : ''}: ${this.mapType(f.type)};`).join('\n');
        return `export class ${className} {\n${fields}\n    constructor(data: any) { Object.assign(this, data); }\n}`;
    }

    private generateMainFile(name: string, user: string, project: string, tables: Table[], webhooks: WebhookDefinition[]): string {
        return `// Server Integrado com @nodebuilder/core\nimport Fastify from 'fastify';\nconst server = Fastify();\nserver.listen({ port: 3000 });`;
    }

    protected generatePackageJson(n: string) {
        return JSON.stringify({
            name: n,
            dependencies: {
                "@nodebuilder/core": "link:../../packages/node-framework",
                "fastify": "^4.26.0",
                "@prisma/client": "^5.10.0"
            }
        }, null, 2);
    }

    protected generateWebhookHandler(n: string) { return `export class ${n}Webhook {}`; }
    protected capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
    protected mapType(t: string): string {
        const m: any = { string: 'string', number: 'number', boolean: 'boolean', date: 'Date', file: 'string' };
        return m[t] || 'any';
    }
}
export const oopEngineService = new OOPEngineService();
