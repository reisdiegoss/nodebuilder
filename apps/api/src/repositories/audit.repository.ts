import { prisma } from '../../../../packages/database/index.js';

export class AuditRepository {
    /**
     * Registra um evento no log do sistema
     * NOTA: Atualmente salva no console, mas pronto para persistência
     */
    static async log(event: string, context: any, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] [${level}] ${event} | Context: ${JSON.stringify(context)}`;

        if (level === 'ERROR') console.error(entry);
        else if (level === 'WARN') console.warn(entry);
        else console.log(entry);

        // Futuro: persistir em tabela de SystemLog no Prisma
    }

    static async getLogs() {
        // Mock de logs recentes para a IDE
        return [
            { timestamp: new Date(), level: 'INFO', event: 'Servidor Iniciado', context: 'SaaS Core' },
            { timestamp: new Date(), level: 'INFO', event: 'Nova Sandbox Criada', context: 'Project: alpha-v1' }
        ];
    }

    static async findByTenant(tenantId: string) {
        return [
            { timestamp: new Date(), event: 'Login Realizado', context: { tenantId } },
            { timestamp: new Date(), event: 'Projeto Lançado', context: { tenantId } }
        ];
    }
}
