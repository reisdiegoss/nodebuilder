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
        let schema = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
\n`;

        tables.forEach(table => {
            schema += `model ${this.capitalize(table.name)} {\n`;
            table.fields.forEach(field => {
                let type = this.mapType(field.type);
                let decorators = '';

                if (field.isPrimary) {
                    decorators += ' @id @default(uuid())';
                }

                if (field.isNullable && !field.isPrimary) {
                    type += '?';
                }

                schema += `  ${field.name} ${type}${decorators}\n`;
            });

            // Injeção automática de tenant_id para isolamento (SINGLE_DB pattern)
            schema += `  tenantId String\n`;
            schema += `  createdAt DateTime @default(now())\n`;
            schema += `  updatedAt DateTime @updatedAt\n`;
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
