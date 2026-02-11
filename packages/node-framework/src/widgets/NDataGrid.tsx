import React, { useState, useEffect } from 'react';
import {
    Search, Table as TableIcon, ChevronLeft, ChevronRight,
    Filter, Edit2, Trash2, ArrowUpDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils'; // Assumindo utils ou definindo inline se n existir

interface Column {
    name: string;
    label: string;
    sortable?: boolean;
}

interface NDataGridProps {
    title?: string;
    table?: string;
    endpoint?: string;
    columns: Column[];
    actions?: {
        onEdit?: (id: string) => void;
        onDelete?: (id: string) => void;
    };
    onRowClick?: (row: any) => void;
    pageSize?: number;
}

export const NDataGrid: React.FC<NDataGridProps> = ({
    endpoint,
    columns,
    actions,
    pageSize = 10,
    table,
    title
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ field: 'id', direction: 'desc' });

    useEffect(() => {
        fetchData();
    }, [page, search, sort, endpoint, table]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = `?page=${page}&limit=${pageSize}&search=${search}&sort=${sort.field}&dir=${sort.direction}`;
            const target = endpoint || `/api/v1/${table?.toLowerCase()}`;
            const response = await fetch(`${target}${query}`);
            const result = await response.json();
            setData(result.data || result || []);
        } catch (error) {
            console.error('DataGrid Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 tracking-tight">{title || table || 'Listagem'}</h3>
                    {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.name}
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => setSort({ field: col.name, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        {col.sortable !== false && <ArrowUpDown size={12} className="opacity-50" />}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right">Controle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && data.length === 0 ? (
                            [...Array(pageSize)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={columns.length + 1} className="px-6 py-4 bg-slate-50/30 h-12"></td>
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((item: any, i: number) => (
                                <tr key={item.id || i} className="hover:bg-blue-50/20 transition-colors group">
                                    {columns.map((col) => (
                                        <td key={col.name} className="px-6 py-4 text-slate-600 font-medium">
                                            {item[col.name] || '-'}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 flex justify-end gap-1">
                                        {actions?.onEdit && (
                                            <button onClick={() => actions.onEdit!(item.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {actions?.onDelete && (
                                            <button onClick={() => actions.onDelete!(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 italic">Nenhum dado disponível.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Página {page}</span>
                <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-30 shadow-sm"><ChevronLeft size={16} /></button>
                    <button onClick={() => setPage(page + 1)} className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm"><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
};
