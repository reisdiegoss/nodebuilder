import React, { useState, useEffect } from 'react';
import {
    Eye, EyeOff, Calendar, ChevronDown, Search, FileUp,
    Table as TableIcon, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- WIDGETS DE INPUT ---

export const NInput = ({ label, placeholder, type = 'text', onChange, className }: any) => (
    <div className={cn("space-y-1.5 w-full", className)}>
        {label && <label className="text-sm font-semibold text-zinc-400">{label}</label>}
        <input
            type={type}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all hover:border-zinc-700 placeholder:text-zinc-600"
        />
    </div>
);

export const NPassword = ({ label, onChange }: any) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5 w-full relative">
            <label className="text-sm font-semibold text-zinc-400">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pr-11 text-white focus:ring-2 focus:ring-brand-blue outline-none"
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
        </div>
    );
};

export const NDate = ({ label, onChange }: any) => (
    <div className="space-y-1.5 w-full">
        <label className="text-sm font-semibold text-zinc-400">{label}</label>
        <div className="relative">
            <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-11 text-white focus:ring-2 focus:ring-brand-blue outline-none"
                onChange={(e) => {
                    const val = e.target.value; // YYYY-MM-DD
                    onChange?.(val);
                }}
            />
            <Calendar className="absolute left-3 top-3 text-zinc-500" size={18} />
        </div>
    </div>
);

export const NSelect = ({ label, options, onChange }: any) => (
    <div className="space-y-1.5 w-full">
        <label className="text-sm font-semibold text-zinc-400">{label}</label>
        <div className="relative">
            <select
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 appearance-none text-white focus:ring-2 focus:ring-brand-blue outline-none cursor-pointer"
                onChange={(e) => onChange?.(e.target.value)}
            >
                <option value="">Selecione...</option>
                {options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-zinc-500 pointer-events-none" size={18} />
        </div>
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

export const NUniqueSearch = ({ label, targetTable, onSelect, error }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selection, setSelection] = useState<any>(null);

    return (
        <div className="space-y-1.5 w-full">
            <label className="text-sm font-semibold text-zinc-400">{label}</label>
            <div
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex items-center gap-2 bg-zinc-900 border rounded-xl px-4 py-2.5 cursor-pointer hover:border-zinc-700 transition-all group",
                    error ? "border-red-500/50" : "border-zinc-800"
                )}
            >
                <div className="flex-1 text-zinc-400 italic text-sm group-hover:text-zinc-300">
                    {selection ? selection.name || selection.id : `Buscar em ${targetTable}...`}
                </div>
                <Search size={18} className="text-zinc-500 group-hover:text-brand-blue transition-colors" />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

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

export const NFile = ({ label, onUpload }: any) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onUpload?.(file);
        }
    };

    return (
        <div className="space-y-1.5 w-full">
            <label className="text-sm font-semibold text-zinc-400">{label}</label>
            <div className="relative group">
                <input
                    type="file"
                    onChange={handleFile}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-zinc-900 group-hover:border-brand-blue/50 transition-all">
                    {preview ? (
                        <img src={preview} className="w-24 h-24 object-cover rounded-xl shadow-lg" alt="Preview" />
                    ) : (
                        <FileUp className="text-zinc-500 group-hover:text-brand-blue transition-colors" size={40} />
                    )}
                    <span className="text-xs text-zinc-500 font-medium">Arraste registros ou clique para upload</span>
                </div>
            </div>
        </div>
    );
};

// --- DISPLAY WIDGETS ---

export const NDataGrid = ({ title, table, endpoint, columns, onRowClick, actions }: any) => {
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRemote = async () => {
            setLoading(true);
            try {
                const url = endpoint || `/api/v1/${table?.toLowerCase()}?page=${page}&q=${search}`;
                const res = await fetch(url);
                const result = await res.json();

                // Suporte a formato paginado ou array simples
                if (result.data && Array.isArray(result.data)) {
                    setData(result.data);
                    setTotalPages(result.totalPages || 1);
                } else if (Array.isArray(result)) {
                    setData(result);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error('DataGrid Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRemote();
    }, [table, endpoint, page, search]);

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header com Busca */}
            <div className="p-5 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40">
                <h4 className="font-bold text-lg flex items-center gap-2">
                    <TableIcon size={20} className="text-brand-blue" /> {title || table || 'Listagem'}
                    {loading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full" />}
                </h4>
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={search}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de Dados */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-zinc-800/60 text-zinc-500 uppercase text-[10px] font-black tracking-widest border-b border-zinc-800">
                        <tr>
                            {columns?.map((col: any) => (
                                <th key={col.key} className="px-6 py-4">{col.label}</th>
                            ))}
                            {actions && <th className="px-6 py-4 text-right">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {data.length > 0 ? data.map((row: any, i: number) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => onRowClick?.(row)}
                                className={cn(
                                    "hover:bg-brand-blue/5 transition-all group",
                                    onRowClick ? "cursor-pointer" : ""
                                )}
                            >
                                {columns?.map((col: any) => (
                                    <td key={col.key} className="px-6 py-4 text-zinc-300 font-medium whitespace-nowrap">
                                        {row[col.key] || '-'}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {actions.map((act: any, idx: number) => (
                                            <button key={idx} onClick={(e) => { e.stopPropagation(); act.handler(row); }} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all">
                                                {act.icon}
                                            </button>
                                        ))}
                                    </td>
                                )}
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan={100} className="px-6 py-10 text-center text-zinc-600 italic">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/20 flex items-center justify-between px-6">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Total: {data.length} Itens</span>
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 hover:bg-zinc-800 disabled:opacity-30 rounded-lg transition-colors text-zinc-400"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-black text-brand-blue px-3">{page}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 hover:bg-zinc-800 disabled:opacity-30 rounded-lg transition-colors text-zinc-400"
                    >
                        <ChevronRight size={18} />
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
