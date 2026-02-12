import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface NCardProps {
    children: React.ReactNode;
    title?: string;
    actions?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
}

export const NCard: React.FC<NCardProps> = ({
    children,
    title,
    actions,
    className,
    headerClassName,
    bodyClassName
}) => {
    return (
        <div className={cn(
            'bg-[#21252b] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 transition-all hover:border-white/20',
            className
        )}>
            {(title || actions) && (
                <div className={cn(
                    'px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]',
                    headerClassName
                )}>
                    {title && <h3 className="text-sm font-bold text-white uppercase tracking-tight">{title}</h3>}
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={cn('p-6', bodyClassName)}>
                {children}
            </div>
        </div>
    );
};

export interface NStatisticProps {
    label: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    className?: string;
}

export const NStatistic: React.FC<NStatisticProps> = ({
    label,
    value,
    description,
    icon,
    variant = 'default',
    className
}) => {
    const variantColors = {
        default: 'text-white',
        success: 'text-emerald-400',
        warning: 'text-amber-400',
        error: 'text-rose-400',
        info: 'text-blue-400',
    };

    return (
        <NCard className={cn('hover:scale-[1.02] transition-transform duration-300', className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                    <h2 className={cn('text-3xl font-black tracking-tighter', variantColors[variant])}>
                        {value}
                    </h2>
                    {description && (
                        <p className="text-[10px] text-slate-400 font-medium">
                            {description}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={cn(
                        'p-2.5 rounded-xl bg-white/5 border border-white/5',
                        variantColors[variant]
                    )}>
                        {icon}
                    </div>
                )}
            </div>
        </NCard>
    );
};
