import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';

export class ExportService {
    /**
     * Gera um ZIP de um projeto fictício (simulando a exportação do código gerado)
     */
    static async generateZip(projectName: string, files: Record<string, string>) {
        const zip = new AdmZip();

        // Adicionar arquivos ao ZIP
        for (const [filePath, content] of Object.entries(files)) {
            zip.addFile(filePath, Buffer.from(content, 'utf8'));
        }

        const tempPath = path.join(process.cwd(), 'temp_exports');
        await fs.mkdir(tempPath, { recursive: true });

        const zipName = `${projectName.toLowerCase()}-${Date.now()}.zip`;
        const zipPath = path.join(tempPath, zipName);

        zip.writeZip(zipPath);

        return {
            filename: zipName,
            path: zipPath
        };
    }

    /**
     * Limpa exportações antigas (> 10 min)
     */
    static async startCleanupWorker() {
        console.log('🧹 [Export] Iniciando Worker de Limpeza...');
        setInterval(async () => {
            const tempPath = path.join(process.cwd(), 'temp_exports');
            try {
                const files = await fs.readdir(tempPath);
                const now = Date.now();
                const TEN_MINUTES = 10 * 60 * 1000;

                for (const file of files) {
                    const filePath = path.join(tempPath, file);
                    const stats = await fs.stat(filePath);
                    if (now - stats.ctimeMs > TEN_MINUTES) {
                        await fs.unlink(filePath);
                        console.log(`Deleted old export: ${file}`);
                    }
                }
            } catch (err) {
                // Silently ignore if dir doesn't exist
            }
        }, 60000); // Roda a cada minuto
    }

    static async exportToZip(projectName: string, files: Record<string, string>) {
        return await this.generateZip(projectName, files);
    }
}
