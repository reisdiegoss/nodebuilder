import React, { ReactNode } from 'react';

/**
 * NPage: Classe base para todas as páginas do NodeBuilder
 */
export abstract class NPage {
    protected components: ReactNode[] = [];

    /**
     * Ciclo de vida: Carregamento inicial da página
     */
    abstract onLoad?(): void;

    /**
     * Ciclo de vida: Exibição da página (foco)
     */
    abstract onShow?(): void;

    /**
     * Adiciona um componente à árvore de renderização
     */
    add(component: ReactNode) {
        this.components.push(component);
    }

    /**
     * Helpers de Layout (NRow/NCol)
     */
    addRow(content: ReactNode) {
        this.add(<div className="grid grid-cols-1 md:grid-cols-12 gap-6">{content}</div>);
    }

    /**
     * Renderiza a página completa
     */
    render() {
        return (
            <div className="p-6 space-y-6 min-h-screen bg-zinc-950 text-white animate-in slide-in-from-bottom-4 duration-500">
                {this.components}
            </div>
        );
    }
}
