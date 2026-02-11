import React from 'react';
import { cn } from '../utils';

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
