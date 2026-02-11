import { PrismaClient } from '@prisma/client';

/**
 * ConnectionManager: Gerencia múltiplas instâncias do Prisma Client (Pool)
 * Suporte a MULTI_DB Dinâmica
 */
export class ConnectionManager {
    private static instances: Map<string, PrismaClient> = new Map();

    /**
     * Obtém uma instância do Prisma baseada no Tenant e configuração
     */
    static async getConnection(tenantId: string, connectionString?: string): Promise<PrismaClient> {
        if (this.instances.has(tenantId)) {
            return this.instances.get(tenantId)!;
        }

        console.log(`🔌 [Multi-DB] Estabelecendo nova conexão para Tenant: ${tenantId}`);

        const client = new PrismaClient({
            datasources: {
                db: { url: connectionString || process.env.DATABASE_URL }
            }
        });

        this.instances.set(tenantId, client);
        return client;
    }

    /**
     * Fecha todas as conexões (Shutdown)
     */
    static async disconnectAll() {
        for (const [id, client] of this.instances) {
            await client.$disconnect();
            console.log(`Disconnected Prisma for ${id}`);
        }
        this.instances.clear();
    }
}
