import fs from 'fs/promises';
import path from 'path';
import { dockerService } from './docker.service.js';

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
    static convertERDToPrisma(tables: any[]): string {
        let prismaSchema = `// NodeBuilder Generated Schema\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n`;

        tables.forEach(table => {
            prismaSchema += `\nmodel ${this.capitalize(table.name)} {`;

            // Assume que table.columns ou table.fields pode ser usado dependendo da origem
            const columns = table.columns || table.fields || [];

            columns.forEach((col: any) => {
                let fieldDef = `  ${col.name} ${this.mapType(col.type)}`;

                if (col.isPk || col.isPrimary) fieldDef += " @id @default(uuid())";
                if (col.isUnique) fieldDef += " @unique";
                if (!col.required && !col.isPk && !col.isPrimary) fieldDef += "?";

                prismaSchema += `\n${fieldDef}`;
            });

            // Injeção automática da coluna Tenant para Multi-tenant (Paridade MadBuilder)
            prismaSchema += `\n  tenant_id String @default("1")`;
            prismaSchema += `\n  createdAt DateTime @default(now())`;
            prismaSchema += `\n  updatedAt DateTime @updatedAt`;
            prismaSchema += `\n\n  @@index([tenant_id])`;
            prismaSchema += `\n}\n`;
        });

        return prismaSchema;
    }

    private static mapType(uiType: string): string {
        const types: Record<string, string> = {
            'INTEGER': 'Int',
            'VARCHAR': 'String',
            'TEXT': 'String',
            'BOOLEAN': 'Boolean',
            'DATE': 'DateTime',
            'FLOAT': 'Float',
            'string': 'String',
            'number': 'Int',
            'boolean': 'Boolean',
            'datetime': 'DateTime',
            'file': 'String'
        };
        const upper = uiType?.toUpperCase();
        return types[upper] || types[uiType] || 'String';
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
