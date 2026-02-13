import { prisma } from '../../../../packages/database/index.js';
import knex from 'knex';

export interface DatabaseMetadata {
    tables: {
        name: string;
        columns: {
            name: string;
            type: string;
            isPrimary: boolean;
        }[];
    }[];
}

export class IntrospectionService {
    /**
     * Realiza a engenharia reversa de um banco de dados externo.
     */
    static async inspect(databaseId: string): Promise<DatabaseMetadata> {
        const dbConfig = await prisma.projectDatabase.findUnique({
            where: { id: databaseId }
        });

        if (!dbConfig) throw new Error('Database configuration not found');

        const client = knex({
            client: dbConfig.type === 'postgresql' ? 'pg' : 'mysql2',
            connection: {
                host: dbConfig.host || 'localhost',
                port: dbConfig.port || (dbConfig.type === 'postgresql' ? 5432 : 3306),
                user: dbConfig.username || '',
                password: dbConfig.password || '',
                database: dbConfig.database || ''
            }
        });

        try {
            const tables = await this.getTables(client, dbConfig.type);
            const metadata: DatabaseMetadata = { tables: [] };

            for (const tableName of tables) {
                const columns = await this.getColumns(client, tableName);
                metadata.tables.push({
                    name: tableName,
                    columns: columns
                });
            }

            return metadata;
        } finally {
            await client.destroy();
        }
    }

    private static async getTables(client: any, type: string): Promise<string[]> {
        if (type === 'postgresql') {
            const res = await client.raw(`
                SELECT tablename 
                FROM pg_catalog.pg_tables 
                WHERE schemaname = 'public'
            `);
            return res.rows.map((r: any) => r.tablename);
        } else {
            const res = await client.raw('SHOW TABLES');
            return res[0].map((r: any) => Object.values(r)[0]);
        }
    }

    private static async getColumns(client: any, tableName: string): Promise<any[]> {
        const info = await client(tableName).columnInfo();
        return Object.keys(info).map(name => ({
            name,
            type: info[name].type,
            isPrimary: false // MOCK: Em uma versão Pro Max, leríamos as PKs do information_schema
        }));
    }
}
