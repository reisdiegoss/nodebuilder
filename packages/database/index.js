import { PrismaClient } from '@prisma/client';
const basePrisma = new PrismaClient();
export const prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                // Multi-tenancy filtering: Skip if model is Tenant or if no where clause
                // In a real production system, we would inject the tenantId here from a global context (AsyncLocalStorage)
                return query(args);
            },
        },
    },
});
export * from '@prisma/client';
//# sourceMappingURL=index.js.map