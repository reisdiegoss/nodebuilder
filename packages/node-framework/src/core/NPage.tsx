import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * NPage: O container principal de todas as telas.
 * Gerencia o título, breadcrumbs e a área de conteúdo.
 */

interface NPageProps {
    title: string;
    children: React.ReactNode;
    breadcrumb?: string[];
}

export const NPage: React.FC<NPageProps> = ({ title, children, breadcrumb = [] }) => {
    // CORREÇÃO: Removidos useState e useEffect que não eram utilizados

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Header da Página */}
            <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
                <div className="max-w-7xl mx-auto w-full">

                    {/* Breadcrumb */}
                    <nav className="flex items-center text-xs text-slate-500 mb-2">
                        <div className="flex items-center hover:text-slate-800 transition-colors cursor-pointer">
                            <Home size={12} className="mr-1" />
                            <span>Home</span>
                        </div>
                        {breadcrumb.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <ChevronRight size={12} className="mx-1 text-slate-300" />
                                <span className={index === breadcrumb.length - 1 ? 'font-medium text-slate-800' : 'hover:text-slate-800 cursor-pointer transition-colors'}>
                                    {item}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center">
                            <ChevronRight size={12} className="mx-1 text-slate-300" />
                            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                {title}
                            </span>
                        </div>
                    </nav>

                    {/* Título Principal */}
                    <div className="flex justify-between items-end">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
                    </div>
                </div>
            </header>

            {/* Área de Conteúdo */}
            <main className="flex-1 px-8 py-8">
                <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500 slide-in-from-bottom-2">
                    {children}
                </div>
            </main>

            {/* Footer Simples */}
            <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 mt-auto">
                <p>NodeBuilder Enterprise &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};