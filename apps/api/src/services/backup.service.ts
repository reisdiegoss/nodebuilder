import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../../../packages/database/index.js';

export class BackupService {
    /**
     * Gera um backup lógico de um projeto (Metadados + Módulos)
     */
    static async backupProject(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { modules: true }
        });

        if (!project) throw new Error('Projeto não encontrado');

        const backupData = {
            timestamp: new Date().toISOString(),
            projectId: project.id,
            name: project.name,
            modules: project.modules,
        };

        const backupDir = path.join(process.cwd(), 'storage', 'backups');
        await fs.mkdir(backupDir, { recursive: true });

        const filename = `backup-${project.id}-${Date.now()}.json`;
        const filePath = path.join(backupDir, filename);

        await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));

        console.log(`📦 [Backup] Projeto ${project.name} salvo em ${filePath}`);
        return { filename, path: filePath };
    }

    /**
     * Rotina para backup de todos os projetos (Fase 5 - Automação)
     */
    static async backupAll() {
        const projects = await prisma.project.findMany();
        for (const p of projects) {
            await this.backupProject(p.id);
        }
    }
}
