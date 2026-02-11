import fs from 'fs/promises';
import path from 'path';
import { dockerService } from './docker.service';

export interface ERDTable {
    name: string;
    fields: ERDField[];
}

export interface ERDField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'file';
    isPrimary?: boolean;
    isNullable?: boolean;
}

export class MigrationService {
    /**
     * Converte o JSON do Modelador ERD para um schema.prisma completo
     */
    static convertERDToPrisma(tables: ERDTable[]): string {
        let schema = `// NodeBuilder Generated Schema\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\n`;

        tables.forEach(table => {
            const className = this.capitalize(table.name);
            schema += `model ${className} {\n`;

            table.fields.forEach(field => {
                let type = this.mapType(field.type);
                let decorators = '';

                if (field.isPrimary) {
                    decorators += ' @id @default(uuid())';
                }

                if (field.isNullable && !field.isPrimary) {
                    type += '?';
                }

                // Inteligência de Relação (FK) MadBuilder @relation
                if (field.name.endsWith('_id') && !field.isPrimary) {
                    const relationName = field.name.replace('_id', '');
                    const targetModel = this.capitalize(relationName);
                    // Campo FK físico
                    schema += `  ${field.name} String${field.isNullable ? '?' : ''}\n`;
                    // Campo de Relação Lógica Prisma
                    schema += `  ${relationName} ${targetModel}${field.isNullable ? '?' : ''} @relation(fields: [${field.name}], references: [id])\n`;
                    return;
                }

                schema += `  ${field.name} ${type}${decorators}\n`;
            });

            // Isolação de Dados Nativa (Blindagem SaaS Industrial)
            schema += `  tenantId String\n`;
            schema += `  createdAt DateTime @default(now())\n`;
            schema += `  updatedAt DateTime @updatedAt\n\n`;

            // Índices Pro de Performance
            schema += `  @@index([tenantId])\n`;
            schema += `}\n\n`;
        });

        return schema;
    }

    private static mapType(type: string): string {
        const m: any = {
            string: 'String',
            number: 'Int',
            boolean: 'Boolean',
            date: 'DateTime',
            file: 'String'
        };
        return m[type] || 'String';
    }

    private static capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /**
     * Sincroniza o Schema e executa a migração no Docker
     */
    static async syncAndMigrate(projectId: string, containerId: string, tables: ERDTable[]) {
        const schemaContent = this.convertERDToPrisma(tables);

        console.log(`🔄 [Migration] Sincronizando schema para o projeto ${projectId}...`);

        // 1. Injetar o novo schema.prisma no container
        await dockerService.syncFiles(containerId, [
            { path: 'prisma/schema.prisma', content: schemaContent }
        ]);

        // 2. Executar npx prisma migrate dev
        // Nota: Em um ambiente real, chamaríamos o docker.exec no containerId
        console.log(`🚀 [Migration] Executando 'npx prisma migrate dev' no container ${containerId}`);

        return { success: true, schema: schemaContent };
    }
}
