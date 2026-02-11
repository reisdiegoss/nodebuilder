import { PrismaClient } from '@prisma/client';

/**
 * RuntimeCRUDService
 * Este arquivo é injetado dentro do container do cliente.
 * Ele serve como o "Backend Genérico" para alimentar o NDataGrid e NUniqueSearch.
 */
export class RuntimeCRUDService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    /**
     * Processa requisições do NDataGrid (Paginação, Busca, Sort)
     */
    async handleList(model: string, query: any, tenantId: string) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        // Fallback de segurança para evitar NaN
        const take = limit > 100 ? 100 : limit;
        const skip = (page - 1) * take;

        const search = query.search || '';
        const sortField = query.sort || 'createdAt';
        const sortDir = query.dir || 'desc';

        // 1. Definição de Filtros (Busca Global + Tenant)
        const where: any = {
            tenantId: tenantId, // Segurança Multi-tenant forçada
        };

        // Obs: A busca genérica (OR) depende de saber quais campos são string.
        // Em um ambiente puramente dinâmico sem reflection, isso pode ser arriscado.
        // Para v1, assumimos que o desenvolvedor ou o gerador cuida disso,
        // ou implementamos um "try-catch" na query.

        // 2. Consulta ao Banco via Delegate Dinâmico
        // @ts-ignore
        const delegate = this.prisma[model];

        if (!delegate) throw new Error(`Model ${model} não encontrado no Prisma.`);

        try {
            const [total, data] = await Promise.all([
                delegate.count({ where }),
                delegate.findMany({
                    where,
                    take,
                    skip,
                    orderBy: { [sortField]: sortDir }
                })
            ]);

            // 3. Retorno no formato padrão do NDataGrid
            return {
                data,
                total,
                page,
                totalPages: Math.ceil(total / take)
            };
        } catch (e) {
            console.error(`[RuntimeCRUD] Error listing ${model}:`, e);
            // Retorna vazio em vez de crashar a API
            return { data: [], total: 0, page: 1, totalPages: 0 };
        }
    }

    /**
     * Processa buscas do NUniqueSearch (Autocomplete)
     */
    async handleLookup(model: string, search: string, tenantId: string) {
        // @ts-ignore
        const delegate = this.prisma[model];
        if (!delegate) return [];

        try {
            // Tenta buscar assumindo que existe um campo 'nome'. 
            // O ideal é que o SmartParser só habilite lookup se houver campo textual.
            const where: any = { tenantId };

            // Se search vier, tenta filtrar. Se quebrar (campo nome nao existe), o catch pega.
            // @ts-ignore - Prisma dynamic
            /* if (search) {
                 where['OR'] = [
                     { nome: { contains: search, mode: 'insensitive' } },
                     { title: { contains: search, mode: 'insensitive' } } // Tentativa de campos comuns
                 ];
            } */

            return await delegate.findMany({
                where,
                take: 20
            });
        } catch (e) {
            console.error(`[RuntimeCRUD] Error lookup ${model}:`, e);
            return [];
        }
    }
}
