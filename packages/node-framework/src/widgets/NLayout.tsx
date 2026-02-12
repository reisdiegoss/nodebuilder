import React from 'react';
import { cn } from '../utils';
import { NDynamicMenu } from './NDynamicMenu';

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

export const NLayout: React.FC<{ children: React.ReactNode, menuItems?: any[] }> = ({ children, menuItems }) => {
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <NDynamicMenu items={menuItems} />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

// NPage removido em favor de @nodebuilder/core/NPage
// export const NPage = ...
