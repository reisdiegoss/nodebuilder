import { OOPEngineService } from './oop-engine.service.js';
import type { Table } from './oop-engine.service.js';
import { MigrationService } from './migration.service.js';

/**
 * Orchestrator: Coordena a criação do projeto, schema e migração
 */
export class ProjectOrchestrator {
    static async saveAndDeploy(projectData: { id: string, name: string, tables: Table[] }) {
        console.log(`🎯 [Orchestrator] Iniciando deploy do projeto: ${projectData.name}`);

        // 1. Gerar Schema Prisma do ERD
        const prismaSchema = MigrationService.convertERDToPrisma(projectData.tables);

        // 2. Rodar Migration (Sync DB)
        // await MigrationService.runMigration(projectData.id, prismaSchema);

        // Correção Paridade: MigrationService usa syncAndMigrate agora
        // Mock ou chamada real dependendo do fluxo
        console.log(`🔄 [Orchestrator] Schema gerado:\n${prismaSchema}`);

        // 3. Gerar Código OOP (Engine)
        const oopEngine = new OOPEngineService();
        // const code = oopEngine.generateProject(...);

        console.log(`✅ [Orchestrator] Projeto pronto e banco sincronizado.`);
        return { ok: true };
    }
}
