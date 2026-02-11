import { PrismaClient } from '@prisma/client'

const basePrisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
})

/**
 * Extensão do Prisma para Isolamento Automático de Dados (SaaS)
 * Garante que todas as operações find/update/delete filtrem por tenantId.
 */
export const prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const tenantId = (global as any).currentTenantId;

                // Não aplicamos o filtro ao modelo 'Tenant' ou se no contexto global não houver tenantId
                if (model !== 'Tenant' && tenantId) {
                    const readOperations = ['findFirst', 'findMany', 'findUnique', 'findUniqueOrThrow', 'count', 'aggregate', 'groupBy'];
                    const writeOperations = ['update', 'updateMany', 'delete', 'deleteMany'];

                    if (readOperations.includes(operation) || writeOperations.includes(operation)) {
                        const modelArgs = args as any;
                        modelArgs.where = {
                            ...modelArgs.where,
                            tenantId: tenantId
                        };
                    }
                }

                return query(args);
            },
        },
    },
})

export * from '@prisma/client'
