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

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
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
`;
    }

    private renderModernWidget(field: Field): string {
        const widget = this.autoMapWidget(field);
        const onChangeAttr = ` onChange={(val) => this.form.setData({ ${field.name}: val })} `;
        return `<${widget} label="${field.name}"${onChangeAttr}/>`;
    }

    private autoMapWidget(field: Field): string {
        if (field.widget) return field.widget;
        if (field.type === 'date') return 'NDate';
        if (field.type === 'file') return 'NFile';
        if (field.name.toLowerCase().includes('senha')) return 'NPassword';
        if (field.name.endsWith('_id')) return 'NUniqueSearch';
        return 'NInput';
    }

    private mapZodType(type: string): string {
        const m: any = { string: 'string()', number: 'number()', boolean: 'boolean()', date: 'date()', file: 'string()' };
        return m[type] || 'any()';
    }

    private getRequiredWidgets(table: Table): string {
        const widgets = new Set(table.fields.map(f => this.autoMapWidget(f)));
        return Array.from(widgets).join(', ');
    }

    private generateModernRepository(table: Table, tenantType: string): string {
        const className = this.capitalize(table.name);
        const low = table.name.toLowerCase();

        const tenantFilter = tenantType === 'SINGLE_DB'
            ? `, where: { tenantId: (global as any).currentTenantId }`
            : '';

        return `import { prisma } from '../infra/database';

export class ${className}Repository {
    async findAll() {
        return await prisma.${low}.findMany({
            ${tenantFilter ? tenantFilter.replace(', ', '') : ''}
        });
    }

    async create(data: any) {
        const payload = { ...data };
        ${tenantType === 'SINGLE_DB' ? "payload.tenantId = (global as any).currentTenantId;" : ""}
        return await prisma.${low}.create({ data: payload });
    }
}
`;
    }

    private generateModernMainFile(n: string, u: string, p: string, t: Table[], w: WebhookDefinition[]): string {
        return `// Server Enterprise NodeBuilder 2.0\nimport Fastify from 'fastify';\nconst server = Fastify();\nserver.listen({ port: 3000 });`;
    }
}
