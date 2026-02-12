import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface NSelectOption {
    label: string;
    value: any;
}

export interface NSelectProps {
    options: NSelectOption[];
    value?: any | any[];
    onChange?: (value: any) => void;
    placeholder?: string;
    label?: string;
    searchable?: boolean;
    multiple?: boolean;
    error?: string;
    className?: string;
}

export const NSelect: React.FC<NSelectProps> = ({
    options = [],
    value,
    onChange,
    placeholder = 'Selecione uma opção',
    label,
    searchable = true,
    multiple = false,
    error,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: NSelectOption) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const isSelected = currentValues.includes(option.value);
            const newValue = isSelected
                ? currentValues.filter(v => v !== option.value)
                : [...currentValues, option.value];
            onChange?.(newValue);
        } else {
            onChange?.(option.value);
            setIsOpen(false);
        }
    };

    const removeValue = (val: any) => {
        if (multiple && Array.isArray(value)) {
            onChange?.(value.filter(v => v !== val));
        }
    };

    const selectedOptions = multiple
        ? options.filter(opt => Array.isArray(value) && value.includes(opt.value))
        : options.find(opt => opt.value === value);

    const displayValue = () => {
        if (multiple) {
            if (!Array.isArray(value) || value.length === 0) return placeholder;
            return (
                <div className="flex flex-wrap gap-1">
                    {(selectedOptions as NSelectOption[]).map(opt => (
                        <span key={opt.value} className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            {opt.label}
                            <button onClick={(e) => { e.stopPropagation(); removeValue(opt.value); }}>
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            );
        }
        return (selectedOptions as NSelectOption)?.label || placeholder;
    };

    return (
        <div className={cn('space-y-1.5', className)} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-full bg-[#181a1f] border rounded-xl px-4 py-2.5 text-xs text-left flex items-center justify-between transition-all outline-none',
                        isOpen ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-white/10 hover:border-white/20',
                        error ? 'border-red-500/50' : ''
                    )}
                >
                    <div className={cn(
                        'truncate flex-1',
                        (!value || (Array.isArray(value) && value.length === 0)) ? 'text-slate-500' : 'text-white font-medium'
                    )}>
                        {displayValue()}
                    </div>
                    <ChevronDown size={14} className={cn('text-slate-500 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-2 w-full z-50 bg-[#1e2227] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchable && (
                            <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                                <div className="relative">
                                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#181a1f] border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto p-1 py-2 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = multiple
                                        ? (Array.isArray(value) && value.includes(opt.value))
                                        : value === opt.value;

                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(opt)}
                                            className={cn(
                                                'w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group',
                                                isSelected ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            )}
                                        >
                                            {opt.label}
                                            {isSelected && <Check size={12} />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-xs text-slate-500 font-medium italic">Nenhum resultado encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <span className="text-[10px] text-red-500 font-bold uppercase mt-1 animate-in fade-in slide-in-from-top-1 ml-1 leading-none inline-block">
                    {error}
                </span>
            )}
        </div>
    );
};
