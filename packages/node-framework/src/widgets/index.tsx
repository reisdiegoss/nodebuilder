import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    Eye, EyeOff, Calendar, ChevronDown, Search, FileUp,
    Table as TableIcon, ChevronLeft, ChevronRight, X,
    Plus, Trash2, Filter, MoreVertical, Edit2, Download,
    ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// --- UTILITÁRIOS ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- CONTEXTO DE FORMULÁRIO PARA ERROS ---
const FormContext = createContext<{ errors: Record<string, string> }>({ errors: {} });

export const NFormContainer: React.FC<any> = ({ children, errors = {} }) => {
    return (
        <FormContext.Provider value={{ errors }}>
            <div className="space-y-4">{children}</div>
        </FormContext.Provider>
    );
};

const FieldError = ({ name }: { name: string }) => {
    const { errors } = useContext(FormContext);
    if (!errors[name]) return null;
    return <span className="text-[10px] text-red-500 font-bold uppercase mt-1 animate-in fade-in slide-in-from-top-1">{errors[name]}</span>;
};

// --- WIDGETS DE INPUT BASE ---

export const NInput = ({ label, placeholder, value, onChange, type = 'text', name, className }: any) => {
    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {label && <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
            <FieldError name={name || label} />
        </div>
    );
};

export const NPassword = ({ label, value, onChange, name }: any) => {
    const [show, setShow] = useState(false);
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <FieldError name={name} />
        </div>
    );
};

export const NDate = ({ label, value, onChange, name }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>
        <div className="relative">
            <input
                type="date"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-11 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
            <Calendar className="absolute left-3.5 top-3 text-slate-400" size={18} />
        </div>
        <FieldError name={name} />
    </div>
);

// --- WIDGETS ENTERPRISE (INDUSTRIAL PARITY) ---

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

export const NUniqueSearch: React.FC<any> = ({
    label,
    targetModel,
    targetEndpoint,
    displayField,
    onSelect,
    value,
    placeholder = "Clique para selecionar..."
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');

    const handleSelection = (item: any) => {
        const labelValue = item[displayField] || item.id;
        setSelectedLabel(labelValue);
        onSelect?.(item.id, labelValue);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>
            <div className="relative group" onClick={() => setIsModalOpen(true)}>
                <input
                    type="text"
                    readOnly
                    placeholder={placeholder}
                    value={selectedLabel || value || ''}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer shadow-sm"
                />
                <Search className="absolute right-3.5 top-3 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-700">Vincular {targetModel}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><X size={24} /></button>
                            </div>
                            <div className="p-6 flex-1 overflow-auto">
                                <NDataGrid
                                    endpoint={targetEndpoint}
                                    columns={[
                                        { name: 'id', label: 'ID' },
                                        { name: displayField, label: 'Identificador', sortable: true }
                                    ]}
                                    pageSize={5}
                                    onRowClick={handleSelection}
                                    actions={{ onEdit: (id) => handleSelection({ id, [displayField]: `Selecionado ${id}` }) }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- WIDGETS DE LAYOUT E COMPLEMENTARES ---

export const NRow = ({ children, className }: any) => <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", className)}>{children}</div>;
export const NCol = ({ span = 12, children }: any) => <div className={cn(`md:col-span-${span}`)}>{children}</div>;
export const NCard = ({ title, children, className }: any) => (
    <div className={cn("bg-white border border-slate-200 rounded-3xl p-6 shadow-sm", className)}>
        {title && <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            {title}
        </h3>}
        {children}
    </div>
);

export const NButton = ({ label, onClick, variant = 'primary', fullWidth, icon: Icon, className }: any) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm",
            variant === 'primary' ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            fullWidth ? "w-full" : "",
            className
        )}
    >
        {Icon && <Icon size={18} />}
        {label}
    </button>
);

export const NCheckbox = ({ label, onChange, value, name }: any) => (
    <div className="flex items-center gap-3 w-full p-1 group cursor-pointer" onClick={() => onChange?.(!value)}>
        <div
            className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                value ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200" : "border-slate-200 bg-white group-hover:border-slate-400"
            )}
        >
            {value && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><X size={14} className="text-white" /></motion.div>}
        </div>
        <label className="text-sm font-semibold text-slate-600 cursor-pointer">{label}</label>
        <FieldError name={name} />
    </div>
);

export const NFile = ({ label, onChange, value, name }: any) => {
    const [dragging, setDragging] = useState(false);
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer shadow-sm",
                    dragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/30 hover:border-slate-300"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); onChange?.(e.dataTransfer.files[0]); }}
            >
                <div className="p-3 bg-white border border-slate-100 rounded-full text-blue-500 shadow-sm">
                    <FileUp size={24} />
                </div>
                <div className="text-center">
                    <span className="text-sm font-bold text-slate-700 block">{value ? value.name : 'Clique ou arraste um arquivo'}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Limite: 10MB • PNG, JPG, PDF</span>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange?.(e.target.files?.[0])} />
            </div>
            <FieldError name={name} />
        </div>
    );
};

export const NPage = ({ title, children, actions }: any) => (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">NodeBuilder Framework • Industrial</p>
            </div>
            <div className="flex gap-3">
                {actions}
            </div>
        </header>
        <main>{children}</main>
    </div>
);
