import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    Eye, EyeOff, Calendar, ChevronDown, Search, FileUp,
    Table as TableIcon, ChevronLeft, ChevronRight, X,
    Plus, Trash2, Filter, MoreVertical, Edit2, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// --- CONTEXTO DE FORMULÁRIO PARA ERROS ---
const FormContext = createContext<{ errors: Record<string, string> }>({ errors: {} });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- WIDGET HELPER PARA ERROS ---
const FieldError = ({ name }: { name: string }) => {
    const { errors } = useContext(FormContext);
    if (!errors[name]) return null;
    return <span className="text-[10px] text-red-500 font-bold uppercase mt-1 animate-in fade-in slide-in-from-top-1">{errors[name]}</span>;
};

// --- WIDGETS DE INPUT ---

export const NFormContainer = ({ children, errors = {} }: any) => {
    return (
        <FormContext.Provider value={{ errors }}>
            <div className="space-y-4">{children}</div>
        </FormContext.Provider>
    );
};

export const NInput = ({ label, placeholder, value, onChange, type = 'text', name, className }: any) => {
    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {label && <label className="text-sm font-semibold text-zinc-400">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
            />
            <FieldError name={name || label} />
        </div>
    );
};

export const NPassword = ({ label, onChange, name, value }: any) => {
    const [show, setShow] = useState(false);
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-zinc-400">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pr-11 text-zinc-100 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue outline-none transition-all"
                    onChange={(e) => onChange?.(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <FieldError name={name || label} />
        </div>
    );
};

export const NDate = ({ label, onChange, name, value }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-semibold text-zinc-400">{label}</label>
        <div className="relative">
            <input
                type="date"
                value={value}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-11 text-zinc-100 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue outline-none transition-all"
                onChange={(e) => onChange?.(e.target.value)}
            />
            <Calendar className="absolute left-3 top-3 text-zinc-500" size={18} />
        </div>
        <FieldError name={name || label} />
    </div>
);

export const NSelect = ({ label, options, onChange, name, value }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-semibold text-zinc-400">{label}</label>
        <div className="relative">
            <select
                value={value}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 appearance-none text-zinc-100 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue outline-none cursor-pointer transition-all"
                onChange={(e) => onChange?.(e.target.value)}
            >
                <option value="">Selecione...</option>
                {options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-zinc-500 pointer-events-none" size={18} />
        </div>
        <FieldError name={name || label} />
    </div>
);

// --- WIDGETS AVANÇADOS ---

export const NDBSelect = ({ label, table, labelField = 'name', valueField = 'id', onChange }: any) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        fetch(`/api/v1/${table.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                setOptions(data.map((item: any) => ({ label: item[labelField], value: item[valueField] })));
            })
            .catch(err => console.error('Erro NDBSelect:', err));
    }, [table, labelField, valueField]);

    return <NSelect label={label} options={options} onChange={onChange} />;
};

export const NUniqueSearch = ({ label, targetTable, onSelect, value, name }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selection, setSelection] = useState<any>(null);

    return (
        <div className="space-y-1.5 w-full">
            <label className="text-sm font-semibold text-zinc-400">{label}</label>
            <div
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 cursor-pointer hover:border-zinc-700 transition-all group"
            >
                <div className="flex-1 text-zinc-400 italic text-sm group-hover:text-zinc-300">
                    {selection ? (selection.name || selection.id) : (value || `Buscar em ${targetTable}...`)}
                </div>
                <Search size={18} className="text-zinc-500 group-hover:text-brand-blue transition-colors" />
            </div>
            <FieldError name={name || label} />

            <NWindow title={`Selecionar ${targetTable}`} isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <NDataGrid
                    table={targetTable}
                    onRowClick={(row: any) => {
                        setSelection(row);
                        onSelect?.(row);
                        setIsOpen(false);
                    }}
                />
            </NWindow>
        </div>
    );
};

export const NFile = ({ label, onUpload, name }: any) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onUpload?.(file);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-zinc-400">{label}</label>
            <div className="relative group">
                <input
                    type="file"
                    onChange={handleFile}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-zinc-900 group-hover:border-brand-blue/50 transition-all">
                    {preview ? (
                        <img src={preview} className="w-24 h-24 object-cover rounded-xl shadow-lg border border-zinc-700" alt="Preview" />
                    ) : (
                        <FileUp className="text-zinc-500 group-hover:text-brand-blue transition-colors" size={40} />
                    )}
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Upload Arquivo</span>
                </div>
            </div>
            <FieldError name={name || label} />
        </div>
    );
};

// --- DISPLAY WIDGETS ---

export const NDataGrid = ({ title, table, endpoint, columns, onRowClick, actions }: any) => {
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        const fetchRemote = async () => {
            setLoading(true);
            try {
                const sortQuery = sortConfig ? `&sort=${sortConfig.key}&dir=${sortConfig.direction}` : '';
                const url = endpoint || `/api/v1/${table?.toLowerCase()}?page=${page}&limit=${limit}&q=${search}${sortQuery}`;
                const res = await fetch(url);
                const result = await res.json();

                if (result.data && Array.isArray(result.data)) {
                    setData(result.data);
                    setTotal(result.total || result.data.length);
                    setTotalPages(result.totalPages || 1);
                } else if (Array.isArray(result)) {
                    setData(result);
                    setTotal(result.length);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error('DataGrid Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRemote();
    }, [table, endpoint, page, limit, search, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]">
            {/* Header Pro */}
            <div className="p-5 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/40">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-blue/10 rounded-xl border border-brand-blue/20">
                        <TableIcon size={22} className="text-brand-blue" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-white leading-none tracking-tight">{title || table || 'Listagem'}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Tempo Real • {total} Registros
                        </p>
                    </div>
                    {loading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full ml-2" />}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:min-w-[300px]">
                        <Search className="absolute left-3.5 top-2.5 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar em qualquer campo..."
                            value={search}
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-white"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="bg-zinc-900 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-400 outline-none hover:border-zinc-500 transition-all cursor-pointer"
                    >
                        <option value={10}>10 Linhas</option>
                        <option value={20}>20 Linhas</option>
                        <option value={50}>50 Linhas</option>
                    </select>
                </div>
            </div>

            {/* Viewport Industrial */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                    <thead className="bg-zinc-900/80 sticky top-0 z-10 text-zinc-500 uppercase text-[10px] font-black tracking-widest border-b border-zinc-800 backdrop-blur-md">
                        <tr>
                            {columns?.map((col: any) => (
                                <th
                                    key={col.key}
                                    className="px-6 py-5 cursor-pointer hover:bg-zinc-800/10 hover:text-white transition-colors group"
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-2.2">
                                        {col.label}
                                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Filter size={10} className={cn(
                                                "text-zinc-600",
                                                sortConfig?.key === col.key && "text-brand-blue",
                                                sortConfig?.key === col.key && sortConfig?.direction === 'desc' && "rotate-180"
                                            )} />
                                        </div>
                                    </div>
                                </th>
                            ))}
                            {(actions || onRowClick) && <th className="px-6 py-5 text-right font-black">Gerenciar</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {data.length > 0 ? data.map((row: any, i: number) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                onClick={() => onRowClick?.(row)}
                                className={cn(
                                    "hover:bg-brand-blue/[0.03] transition-all group border-l-4 border-transparent active:bg-brand-blue/10",
                                    onRowClick ? "cursor-pointer hover:border-brand-blue shadow-inner" : ""
                                )}
                            >
                                {columns?.map((col: any) => (
                                    <td key={col.key} className="px-6 py-4.5 text-zinc-300 font-medium whitespace-nowrap">
                                        {row[col.key] || <span className="text-zinc-700 italic">vazio</span>}
                                    </td>
                                ))}
                                {(actions || onRowClick) && (
                                    <td className="px-6 py-4.5 text-right">
                                        <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                                            {onRowClick && (
                                                <button onClick={() => onRowClick(row)} className="p-2.5 hover:bg-brand-blue/10 rounded-xl text-zinc-500 hover:text-brand-blue transition-all border border-transparent hover:border-brand-blue/20">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {actions?.map((act: any, idx: number) => (
                                                <button key={idx} onClick={(e) => { e.stopPropagation(); act.handler(row); }} className="p-2.5 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20">
                                                    {act.icon || <Trash2 size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan={100} className="px-6 py-32 text-center">
                                    <div className="flex flex-col items-center gap-4 text-zinc-700">
                                        <div className="p-6 bg-zinc-900/50 rounded-full">
                                            <TableIcon size={48} className="opacity-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Nenhum registro</p>
                                            <p className="text-xs text-zinc-600 italic">Tente mudar os filtros ou cadastrar um novo item.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination MadBuilder Style */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-8">
                <div className="hidden sm:flex items-center gap-4">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                        Exibindo {data.length} de {total} itens
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2.5 hover:bg-zinc-800 disabled:opacity-10 rounded-xl transition-colors text-zinc-400 border border-zinc-800/50"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-1.5">
                        {/* Inteligência de paginação curta */}
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const p = i + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl text-xs font-black transition-all border",
                                        page === p
                                            ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/30"
                                            : "bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:border-zinc-600"
                                    )}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2.5 hover:bg-zinc-800 disabled:opacity-10 rounded-xl transition-colors text-zinc-400 border border-zinc-800/50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- WIDGETS DE AÇÃO E BOTÃO ---

export const NButton = ({ label, icon: Icon, onClick, action, className }: any) => {
    const handleClick = () => {
        if (action) action.execute();
        if (onClick) onClick();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95 hover:opacity-90",
                className
            )}
        >
            {Icon && <Icon size={18} />}
            {label}
        </button>
    );
};

// --- WIDGETS DE LAYOUT E MENSAGEM ---

export const NTabs = ({ tabs }: any) => {
    const [active, setActive] = useState(0);

    return (
        <div className="w-full">
            <div className="flex border-b border-zinc-800 gap-4 mb-6">
                {tabs.map((tab: any, i: number) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={cn(
                            "px-4 py-3 text-sm font-bold transition-all border-b-2",
                            active === i ? "border-brand-blue text-brand-blue" : "border-transparent text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <motion.div
                key={active}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-h-[200px]"
            >
                {tabs[active].content}
            </motion.div>
        </div>
    );
};

export const NWindow = ({ title, isOpen, onClose, children }: any) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
                        <h4 className="font-bold flex items-center gap-2 text-white">{title}</h4>
                        <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors"><X size={22} className="text-zinc-500" /></button>
                    </div>
                    <div className="p-6 max-h-[80vh] overflow-auto">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export const NMessage = {
    info: (msg: string) => alert(`ℹ️ ${msg}`),
    error: (msg: string) => alert(`❌ ${msg}`),
    confirm: (msg: string, callback: Function) => {
        if (window.confirm(msg)) callback();
    }
};

export const NToast = ({ message, type = 'info', duration = 3000 }: any) => {
    console.log(`[Toast] ${type}: ${message}`);
    return null;
};

export const NLabel = ({ text, className }: any) => (
    <span className={cn("text-sm font-bold text-zinc-400 block mb-1.5", className)}>{text}</span>
);

export const NRow = ({ children, className }: any) => (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6 items-start", className)}>{children}</div>
);

export const NCol = ({ children, size = 12, className }: any) => {
    const spanMap: any = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6', 8: 'col-span-8', 12: 'col-span-12' };
    return <div className={cn(`md:${spanMap[size] || 'col-span-12'}`, className)}>{children}</div>;
};
