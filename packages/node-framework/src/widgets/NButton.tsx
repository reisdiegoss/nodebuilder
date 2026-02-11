import React from 'react';
import { cn } from '../utils';

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
