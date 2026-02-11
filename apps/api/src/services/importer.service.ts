import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import stringSimilarity from 'string-similarity';
import { knex, Knex } from 'knex';

export class ImporterService {
    /**
     * Analisa um arquivo e retorna os cabeçalhos e uma amostra de dados
     */
    async analyzeFile(buffer: Buffer, fileType: 'csv' | 'xlsx') {
        let headers: string[] = [];
        let rows: any[] = [];

        if (fileType === 'xlsx') {
            const workbook = XLSX.read(buffer);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            headers = data[0].map(h => String(h));
            rows = data.slice(1, 6); // Amostra de 5 linhas
        } else {
            const records = parse(buffer, { columns: true, skip_empty_lines: true });
            headers = Object.keys(records[0] as any);
            rows = records.slice(0, 5);
        }

        return { headers, sample: rows };
    }

    /**
     * Conecta a um banco externo e retorna schemas/amostra
     */
    async analyzeExternalDb(connectionString: string, type: 'mysql' | 'postgres', tableName: string) {
        const db = knex({
            client: type === 'mysql' ? 'mysql2' : 'pg',
            connection: connectionString
        });

        try {
            const sample = await db(tableName).select('*').limit(5);
            const columns = Object.keys(sample[0] || {});
            await db.destroy();
            return { headers: columns, sample };
        } catch (error) {
            await db.destroy();
            throw error;
        }
    }

    /**
     * Normaliza strings para melhor matching
     */
    private normalize(str: string): string {
        const synonyms: Record<string, string> = {
            'telefone': 'phone',
            'celular': 'phone',
            'nome': 'name',
            'email': 'email',
            'criado': 'createdAt',
            'cadastro': 'createdAt'
        };

        const normalized = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        for (const [key, value] of Object.entries(synonyms)) {
            if (normalized.includes(key)) return value;
        }
        return normalized;
    }

    /**
     * Sugere mapeamento entre colunas e campos do banco
     */
    getMappingSuggestions(fileHeaders: string[], schemaFields: string[]) {
        const suggestions: Record<string, string> = {};
        fileHeaders.forEach(header => {
            const normalizedHeader = this.normalize(header);
            const matches = stringSimilarity.findBestMatch(normalizedHeader, schemaFields.map(f => f.toLowerCase()));
            if (matches.bestMatch.rating > 0.3) {
                const originalField = schemaFields.find(f => f.toLowerCase() === matches.bestMatch.target);
                if (originalField) suggestions[header] = originalField;
            }
        });
        return suggestions;
    }

    /**
     * Executa a importação (Arquivo ou Banco)
     */
    async processImport(buffer: Buffer | null, fileType: 'csv' | 'xlsx' | 'sql', mapping: Record<string, string>, repository: any, dbConfig?: { connection: string, type: 'mysql' | 'postgres', table: string }) {
        let rows: any[] = [];

        if (fileType === 'sql' && dbConfig) {
            const db = knex({
                client: dbConfig.type === 'mysql' ? 'mysql2' : 'pg',
                connection: dbConfig.connection
            });
            rows = await db(dbConfig.table).select('*');
            await db.destroy();
        } else if (buffer) {
            if (fileType === 'xlsx') {
                const workbook = XLSX.read(buffer);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(sheet);
            } else {
                rows = parse(buffer, { columns: true, skip_empty_lines: true });
            }
        }

        const dataToInsert = rows.map(row => {
            const item: any = {};
            Object.entries(mapping).forEach(([sourceCol, dbField]) => {
                item[dbField] = row[sourceCol];
            });
            return item;
        });

        const results = [];
        for (const item of dataToInsert) {
            results.push(await repository.create(item));
        }

        return { count: results.length };
    }
}

export const importerService = new ImporterService();
