import React from 'react';
import { cn } from '../index.js';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => {
    const buttonVariants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        outline: 'bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800',
        ghost: 'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white',
    };

    return (
        <button
            className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all active:scale-95",
                buttonVariants[variant],
                className
            )}
            {...props}
        />
    );
};
