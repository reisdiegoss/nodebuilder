import { OOPEngineService, Table } from './oop-engine.service';
import { MigrationService } from './migration.service';

/**
 * Orchestrator: Coordena a criação do projeto, schema e migração
 */
export class ProjectOrchestrator {
    static async saveAndDeploy(projectData: { id: string, name: string, tables: Table[] }) {
        console.log(`🎯 [Orchestrator] Iniciando deploy do projeto: ${projectData.name}`);

        // 1. Gerar Schema Prisma do ERD
        const prismaSchema = MigrationService.convertERDToPrisma(projectData.tables);

        // 2. Rodar Migration (Sync DB)
        await MigrationService.runMigration(projectData.id, prismaSchema);

        // 3. Gerar Código OOP (Engine)
        // const oopEngine = new OOPEngineService();
        // const code = oopEngine.generateProject(...);

        console.log(`✅ [Orchestrator] Projeto pronto e banco sincronizado.`);
        return { ok: true };
    }
}
