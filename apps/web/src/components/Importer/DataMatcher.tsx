import React, { useState } from 'react';
import { ArrowLeftRight, Save, Database, FileSpreadsheet } from 'lucide-react';

interface MappingItem {
    origin: string;
    target: string;
}

export const DataMatcher: React.FC<{ columns: string[], tableFields: string[] }> = ({ columns, tableFields }) => {
    const [mapping, setMapping] = useState<MappingItem[]>([]);

    const updateMapping = (origin: string, target: string) => {
        setMapping(prev => {
            const exists = prev.find(m => m.target === target);
            if (exists) return prev.map(m => m.target === target ? { origin, target } : m);
            return [...prev, { origin, target }];
        });
    };

    return (
        <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ArrowLeftRight className="text-brand-blue" /> Mapeamento de Dados
                </h3>
                <button
                    onClick={() => console.log('Saving Mapping:', mapping)}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Save className="w-4 h-4" /> Salvar Mapeamento
                </button>
            </div>

            <div className="grid grid-cols-2 gap-8 relative">
                <div className="space-y-4">
                    <div className="text-sm font-semibold text-zinc-500 uppercase flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" /> Campos do Arquivo (Origem)
                    </div>
                    {columns.map(col => (
                        <div key={col} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 cursor-grab active:cursor-grabbing hover:border-brand-blue/50 transition-colors">
                            {col}
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="text-sm font-semibold text-zinc-500 uppercase flex items-center gap-2">
                        <Database className="w-4 h-4" /> Tabela de Destino
                    </div>
                    {tableFields.map(field => (
                        <div key={field} className="flex items-center gap-4">
                            <div className="flex-1 p-3 bg-zinc-800 rounded-lg border border-zinc-700 font-mono text-xs">
                                {field}
                            </div>
                            <select
                                onChange={(e) => updateMapping(e.target.value, field)}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                            >
                                <option value="">Vincular campo...</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
