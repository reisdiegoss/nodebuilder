import { useState } from 'react';
import { Plus, Trash2, Key, Type, Hash, Code, X, Download } from 'lucide-react';
import { parser } from '../../../../packages/engine/src/parser.js';

interface Field {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    isPrimary: boolean;
}

interface Table {
    id: string;
    name: string;
    fields: Field[];
    x: number;
    y: number;
}

export const ERDModeler = () => {
    const [tables, setTables] = useState<Table[]>([
        {
            id: '1',
            name: 'User',
            x: 100,
            y: 100,
            fields: [
                { id: 'f1', name: 'id', type: 'string', isPrimary: true },
                { id: 'f2', name: 'email', type: 'string', isPrimary: false },
            ]
        }
    ]);

    const [isSaving, setIsSaving] = useState(false);
    const [previewCode, setPreviewCode] = useState<string | null>(null);
    const [showExport, setShowExport] = useState(false);
    const [migrations, setMigrations] = useState<{ sql: string; prismaSchema: string } | null>(null);

    const generatePreview = () => {
        const code = parser.parseToTSX({
            name: tables[0]?.name || 'App',
            type: 'PAGE',
            fields: tables[0]?.fields.map(f => ({ name: f.name, type: f.type, label: f.name })) || []
        });
        setPreviewCode(code);
    };

    const generateSqlMigration = (tables: Table[]): string => {
        let sql = '';
        tables.forEach(table => {
            sql += `CREATE TABLE ${table.name} (\n`;
            const fieldsSql = table.fields.map(field => {
                let type = '';
                switch (field.type) {
                    case 'string': type = 'VARCHAR(255)'; break;
                    case 'number': type = 'INT'; break;
                    case 'boolean': type = 'BOOLEAN'; break;
                    case 'date': type = 'DATETIME'; break;
                }
                const primaryKey = field.isPrimary ? ' PRIMARY KEY' : '';
                return `    ${field.name} ${type}${primaryKey}`;
            }).join(',\n');
            sql += fieldsSql;
            sql += '\n);\n\n';
        });
        return sql;
    };

    const generatePrismaSchema = (tables: Table[]): string => {
        let prismaSchema = '';
        tables.forEach(table => {
            prismaSchema += `model ${table.name} {\n`;
            const fieldsPrisma = table.fields.map(field => {
                let type = '';
                switch (field.type) {
                    case 'string': type = 'String'; break;
                    case 'number': type = 'Int'; break;
                    case 'boolean': type = 'Boolean'; break;
                    case 'date': type = 'DateTime'; break;
                }
                const primaryKey = field.isPrimary ? ' @id' : '';
                return `  ${field.name} ${type}${primaryKey}`;
            }).join('\n');
            prismaSchema += fieldsPrisma;
            prismaSchema += '\n}\n\n';
        });
        return prismaSchema;
    };

    const handleGenerateMigration = () => {
        const sql = generateSqlMigration(tables);
        const prisma = generatePrismaSchema(tables);
        setMigrations({ sql, prismaSchema: prisma });
        setShowExport(true);
    };

    const saveSchema = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:3000/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: tables[0]?.name || 'DatabaseSchema',
                    type: 'PAGE',
                    schema: tables,
                    projectId: 'default-project'
                })
            });
            if (response.ok) {
                alert('Schema salvo com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const addTable = () => {
        const newTable: Table = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'NovaTabela',
            x: 200,
            y: 200,
            fields: [{ id: Math.random().toString(36).substr(2, 9), name: 'id', type: 'string', isPrimary: true }]
        };
        setTables([...tables, newTable]);
    };

    const addField = (tableId: string) => {
        setTables(tables.map(t => {
            if (t.id === tableId) {
                return {
                    ...t,
                    fields: [...t.fields, { id: Math.random().toString(36).substr(2, 9), name: 'novo_campo', type: 'string', isPrimary: false }]
                };
            }
            return t;
        }));
    };

    const removeTable = (tableId: string) => {
        setTables(tables.filter(t => t.id !== tableId));
    };

    const removeField = (tableId: string, fieldId: string) => {
        setTables(tables.map(t => {
            if (t.id === tableId) {
                return {
                    ...t,
                    fields: t.fields.filter(f => f.id !== fieldId)
                };
            }
            return t;
        }));
    };

    return (
        <div className="w-full h-full bg-zinc-950 relative overflow-hidden p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Modelador ERD</h1>
                    <p className="text-zinc-500 text-sm">Desenhe seu banco de dados visualmente</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={generatePreview}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                        <Code size={18} />
                        <span>Ver Código</span>
                    </button>
                    <button
                        onClick={handleGenerateMigration}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                        <Download size={18} />
                        <span>Exportar Migração</span>
                    </button>
                    <button
                        disabled={isSaving}
                        onClick={saveSchema}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Schema'}
                    </button>
                    <button
                        onClick={addTable}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                    >
                        <Plus size={18} />
                        <span>Adicionar Tabela</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-8">
                {tables.map(table => (
                    <div key={table.id} className="w-64 glass-card overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-zinc-900/80 p-3 border-b border-zinc-800 flex justify-between items-center">
                            <input
                                value={table.name}
                                onChange={(e) => setTables(tables.map(t => t.id === table.id ? { ...t, name: e.target.value } : t))}
                                className="bg-transparent font-bold text-sm focus:outline-none focus:text-blue-400 w-full text-white"
                            />
                            <Trash2
                                size={14}
                                onClick={() => removeTable(table.id)}
                                className="text-zinc-600 hover:text-red-500 cursor-pointer transition-colors"
                            />
                        </div>

                        <div className="p-3 space-y-2">
                            {table.fields.map(field => (
                                <div key={field.id} className="flex items-center gap-2 group">
                                    {field.isPrimary ? <Key size={12} className="text-yellow-500" /> : <div className="w-3" />}
                                    <input
                                        value={field.name}
                                        onChange={(e) => setTables(tables.map(t => t.id === table.id ? {
                                            ...t,
                                            fields: t.fields.map(f => f.id === field.id ? { ...f, name: e.target.value } : f)
                                        } : t))}
                                        className="bg-transparent text-xs text-zinc-300 flex-1 focus:outline-none focus:text-white"
                                    />
                                    <select
                                        value={field.type}
                                        onChange={(e) => setTables(tables.map(t => t.id === table.id ? {
                                            ...t,
                                            fields: t.fields.map(f => f.id === field.id ? { ...f, type: e.target.value as any } : f)
                                        } : t))}
                                        className="bg-transparent text-[10px] text-zinc-500 focus:outline-none appearance-none"
                                    >
                                        <option value="string">string</option>
                                        <option value="number">number</option>
                                        <option value="boolean">bool</option>
                                        <option value="date">date</option>
                                    </select>
                                    <Trash2
                                        size={10}
                                        onClick={() => removeField(table.id, field.id)}
                                        className="text-zinc-700 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                                    />
                                </div>
                            ))}

                            <button
                                onClick={() => addField(table.id)}
                                className="w-full py-1 mt-2 text-[10px] text-zinc-500 hover:text-blue-400 border border-dashed border-zinc-800 rounded flex items-center justify-center gap-1 transition-colors"
                            >
                                <Plus size={10} />
                                <span>Novo Campo</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Preview de Código */}
            {previewCode && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
                    <div className="w-full max-w-4xl h-full bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden shadow-black/50">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <h3 className="font-bold flex items-center gap-2 text-white">
                                <Code className="text-blue-500" />
                                Código React Gerado
                            </h3>
                            <button
                                onClick={() => setPreviewCode(null)}
                                className="p-1 hover:bg-zinc-800 rounded transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 font-mono text-sm bg-zinc-950">
                            <pre className="text-blue-400">
                                {previewCode}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Exportação */}
            {showExport && migrations && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-8 z-50">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Download className="text-blue-500" />
                                Exportar Schema / Migração
                            </h3>
                            <button onClick={() => setShowExport(false)} className="text-zinc-500 hover:text-white">Fechar</button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">SQL Migration</p>
                                <pre className="bg-black p-4 rounded-lg text-xs text-blue-400 overflow-auto border border-zinc-800">
                                    {migrations.sql}
                                </pre>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Prisma Schema (Models)</p>
                                <pre className="bg-black p-4 rounded-lg text-xs text-green-400 overflow-auto border border-zinc-800">
                                    {migrations.prismaSchema}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
