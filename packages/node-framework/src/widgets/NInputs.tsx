import React, { useState } from 'react';
import { Eye, EyeOff, Calendar, FileUp, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { FieldError } from './NFormContainer';

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
