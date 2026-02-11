import { Table } from '../interfaces';
import { ApiRouteGenerator } from './generators/ApiRouteGenerator';
import { BoilerplateGenerator } from './generators/BoilerplateGenerator';

export class Parser {

  /**
   * Gera todos os arquivos do projeto com base nas tabelas.
   */
  generateProject(projectName: string, projectSlug: string, tables: Table[], multiTenantType: 'SINGLE_DB' | 'MULTI_DB' = 'SINGLE_DB') {
    const result: Record<string, string> = {};

    // 1. Pages & Entities & Repositories
    tables.forEach(table => {
      const lowName = table.name.toLowerCase();
      result[`src/pages/${lowName}.page.tsx`] = this.generatePage(table, multiTenantType);
      result[`src/repositories/${lowName}.repository.ts`] = this.generateRepository(table, multiTenantType);
    });

    // 2. Infra Files (Main, Database, Package.json)
    result['src/index.ts'] = BoilerplateGenerator.generateServerMain();
    result['src/infra/database.ts'] = BoilerplateGenerator.generateDatabaseConfig(projectSlug);
    result['package.json'] = this.generatePackageJson(projectName);

    // 3. Runtime Backend (API Autopilot)
    result['src/services/RuntimeCRUDService.ts'] = BoilerplateGenerator.generateRuntimeCRUDService();
    result['src/routes.ts'] = ApiRouteGenerator.generateRoutes(tables);

    return result;
  }

  generatePage(table: Table, tenantType: string): string {
    const className = table.name; // Assume PascalCase

    // Template Industrial V2
    return `import React from 'react';
import { NPage, NForm, NInput, NDataGrid, NUniqueSearch, NRow, NCol } from '@nodebuilder/core';
import { z } from 'zod';

export default class ${className}Page extends NPage {
    private form: NForm;

    constructor() {
        super();
        this.form = new NForm('${table.name}');
        this.form.linkTo('${className}');
        
        this.form.setValidationSchema(z.object({
            ${table.fields.filter(f => !f.isPrimary).map(f => `${f.name}: z.string().min(1, 'Obrigatório')`).join(',\n            ')}
        }));

        ${tenantType === 'SINGLE_DB' ? `this.applyTenantFilter((global as any).tenantId);` : ''}
    }

    render() {
        return (
            <NPage title="${className}" actions={
                <button onClick={() => this.form.save()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Salvar</button>
            }>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold mb-4">Formulário</h3>
                        <div className="space-y-4">
                           ${table.fields.filter(f => !f.isPrimary && f.name !== 'tenantId').map(f => this.renderWidget(f)).join('\n                           ')}
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <NDataGrid 
                            table="${className}"
                            columns={[
                                ${table.fields.map(f => `{ name: '${f.name}', label: '${f.name.toUpperCase()}', sortable: true }`).join(',\n                                ')}
                            ]}
                            actions={{
                                 onEdit: (id) => this.form.load(id),
                                 onDelete: (id) => this.form.delete(id)
                            }}
                        />
                    </div>
                </div>
            </NPage>
        );
    }

    private renderWidget(field: any): string {
        if (field.name.endsWith('_id')) {
            const model = field.name.replace('_id', '');
            return \`<NUniqueSearch label="\${field.name}" targetModel="\${model}" targetEndpoint="/api/v1/\${model.toLowerCase()}" displayField="nome" />\`;
        }
        return \`<NInput label="\${field.name}" name="\${field.name}" />\`;
    }
}
`;
  }

  generateRepository(table: Table, tenantType: string): string {
    return `// Repository gerado automaticamente (deprecated com uso do RuntimeCRUD, mas mantido para customizações)
export class ${table.name}Repository {}`;
  }

  generatePackageJson(name: string) {
    return JSON.stringify({
      name,
      version: "1.0.0",
      scripts: { "dev": "tsx src/index.ts" },
      dependencies: {
        "fastify": "^4.24.3",
        "@fastify/cors": "^8.4.1",
        "@fastify/formbody": "^7.4.0",
        "@prisma/client": "^5.5.2",
        "zod": "^3.22.4",
        "react": "^18.2.0"
      },
      devDependencies: {
        "prisma": "^5.5.2",
        "tsx": "^3.14.0",
        "typescript": "^5.2.2",
        "@types/node": "^20.8.10"
      }
    }, null, 2);
  }
}
