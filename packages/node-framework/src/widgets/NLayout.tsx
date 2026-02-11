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

// NPage removido em favor de @nodebuilder/core/NPage
// export const NPage = ...
