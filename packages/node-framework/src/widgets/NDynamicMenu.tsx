import React, { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronDown,
    LayoutDashboard, Users, Database, Settings,
    Menu as MenuIcon, X
} from 'lucide-react';
import { cn } from '../utils';

interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    path?: string;
    children: MenuItem[];
}

interface NDynamicMenuProps {
    items?: MenuItem[];
    onNavigate?: (path: string) => void;
    currentPath?: string;
    className?: string;
}

const IconMap: Record<string, any> = {
    LayoutDashboard,
    Users,
    Database,
    Settings
};

export const NDynamicMenu: React.FC<NDynamicMenuProps> = ({
    items = [],
    onNavigate,
    currentPath,
    className
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderItem = (item: MenuItem, level: number = 0) => {
        const Icon = item.icon ? IconMap[item.icon] : null;
        const isExpanded = expanded[item.id];
        const isActive = currentPath === item.path;
        const hasChildren = item.children && item.children.length > 0;

        return (
            <div key={item.id} className="flex flex-col">
                <div
                    onClick={() => {
                        if (hasChildren) {
                            toggle(item.id);
                        } else if (item.path && onNavigate) {
                            onNavigate(item.path);
                        }
                    }}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                        isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-slate-500 hover:bg-slate-50 hover:border-slate-100",
                        level > 0 && "ml-4 text-xs"
                    )}
                >
                    {Icon && <Icon size={isActive ? 18 : 16} className={isActive ? "text-white" : "text-slate-400"} />}
                    <span className={cn("flex-1 font-bold tracking-tight uppercase", isActive ? "opacity-100" : "opacity-80")}>
                        {item.label}
                    </span>
                    {hasChildren && (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-1 flex flex-col gap-1">
                        {item.children.map(child => renderItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className={cn("flex flex-col gap-2 p-4 w-72 h-screen bg-white border-r border-slate-100", className)}>
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                    <Database className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tighter leading-tight">NODEBUILDER</h1>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Enterprise Suite</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {items.map(item => renderItem(item))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2 py-4 bg-slate-50 rounded-3xl">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                        DR
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate uppercase">Diego Reis</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Super Admin</p>
                    </div>
                </div>
            </div>
        </nav>
    );
};
