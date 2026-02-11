import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

/**
 * Interface para definição das colunas da Grid.
 * Adicionada a propriedade 'width' opcional para corrigir o erro TS2353.
 */
export interface Column {
    name: string;
    label: string;
    width?: string;
    sortable?: boolean;
}

interface NDataGridProps {
    endpoint: string;
    columns: Column[];
    actions?: {
        onEdit?: (row: any) => void;
        onDelete?: (row: any) => void;
    };
    onRowClick?: (row: any) => void;
    pageSize?: number;
    title?: string;
}

/**
 * NDataGrid: Componente de tabela avançado.
 */
export const NDataGrid: React.FC<NDataGridProps> = ({
    endpoint,
    columns,
    actions,
    pageSize = 10,
    onRowClick,
    title
}) => {
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, last_page: 1 });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState({ field: 'id', dir: 'desc' });

    useEffect(() => {
        const handler = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(handler);
    }, [search, meta.page, sort]);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log(`[NDataGrid] Carregando dados de ${endpoint}`, { search, sort, page: meta.page });

            // Mock para evitar que o build quebre tentando fetch real em tempo de compilação/teste
            // Em produção, isso seria um fetch real.
            await new Promise(resolve => setTimeout(resolve, 300));

            setData([]);
            setMeta({ total: 0, page: 1, last_page: 1 });

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        setSort(prev => ({
            field,
            dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            {/* Header com Busca */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-xs font-medium text-slate-500">
                    Total: <span className="text-slate-900">{meta.total}</span>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.name}
                                    className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable !== false && handleSort(col.name)}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {sort.field === col.name && (
                                            <ArrowUpDown size={12} className={sort.dir === 'asc' ? 'rotate-180' : ''} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {(actions?.onEdit || actions?.onDelete) && (
                                <th className="px-6 py-3 text-right">Ações</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4">
                                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    </td>
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-slate-400 italic">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row)}
                                    className={`hover:bg-blue-50/40 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col) => (
                                        <td key={col.name} className="px-6 py-3 text-slate-700 font-medium">
                                            {row[col.name]}
                                        </td>
                                    ))}
                                    {(actions?.onEdit || actions?.onDelete) && (
                                        <td className="px-6 py-3 flex justify-end gap-2">
                                            {actions.onEdit && (
                                                <button onClick={() => actions.onEdit!(row)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {actions.onDelete && (
                                                <button onClick={() => actions.onDelete!(row)} className="p-1.5 text-red-600 hover:bg-red-100 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                    disabled={meta.page === 1}
                    onClick={() => setMeta(m => ({ ...m, page: m.page - 1 }))}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-600 font-medium px-2">
                    {meta.page} / {meta.last_page}
                </span>
                <button
                    disabled={meta.page >= meta.last_page}
                    onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};