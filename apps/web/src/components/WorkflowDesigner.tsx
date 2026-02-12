import React, { useState } from 'react';
import { NFlowBuilder } from '@nodebuilder/core';
import { Save, Play, Plus } from 'lucide-react';

export const WorkflowDesigner: React.FC = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carregar fluxos existentes (Mock do projeto atual por enquanto)
    React.useEffect(() => {
        const loadWorkflows = async () => {
            try {
                const res = await fetch('http://localhost:3000/workflows?projectId=default');
                const data = await res.json();
                if (data.length > 0 && data[0].config) {
                    const config = data[0].config as any;
                    setNodes(config.nodes || []);
                    setEdges(config.edges || []);
                }
            } catch (err) {
                console.error('Erro ao carregar workflows:', err);
            }
        };
        loadWorkflows();
    }, []);

    /**
     * Converte o grafo visual em uma lista linear de passos para o backend.
     */
    const graphToSteps = (nodes: any[], edges: any[]) => {
        const steps: any[] = [];
        const triggerNode = nodes.find(n => n.type === 'trigger');
        if (!triggerNode) return [];

        let currentNode = triggerNode;
        let order = 0;

        // Caminhando pelo grafo seguindo as arestas (simplificado: seguindo a primeira conexão de cada nó)
        while (currentNode) {
            const edge = edges.find(e => e.source === currentNode.id);
            if (!edge) break;

            const nextNode = nodes.find(n => n.id === edge.target);
            if (!nextNode || nextNode.type === 'trigger') break;

            steps.push({
                type: nextNode.data.type || (nextNode.id.includes('webhook') ? 'WEBHOOK' : 'LOG'),
                config: nextNode.data.config || {},
                order: order++
            });

            currentNode = nextNode;
            // Evitar loops infinitos se o usuário conectar o nó nele mesmo
            if (steps.length > 50) break;
        }

        return steps;
    };

    const handleSave = async (flow: any) => {
        setLoading(true);
        const steps = graphToSteps(flow.nodes, flow.edges);

        try {
            await fetch('http://localhost:3000/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Automação Central 2026',
                    targetModel: 'Pedido',
                    triggerEvent: 'ON_CREATE',
                    projectId: 'default',
                    tenantId: 'system',
                    config: flow, // Grafo visual
                    steps: steps  // Lista linear de execução
                })
            });
            alert('Automação salva e passos gerados com sucesso!');
        } catch (err) {
            alert('Erro ao salvar no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header do Designer */}
            <div className="h-14 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-500/10 p-1.5 rounded-lg">
                        <Play size={16} className="text-amber-500" />
                    </div>
                    <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">Workflow: Automação de Pedidos</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all border border-zinc-700">
                        <Plus size={14} />
                        Novo Passo
                    </button>
                    <button
                        onClick={() => handleSave({ nodes, edges })}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loading ? 'Salvando...' : 'Salvar Versão'}
                    </button>
                </div>
            </div>

            {/* Area do Flow */}
            <div className="flex-1 p-6">
                <NFlowBuilder
                    initialNodes={nodes}
                    initialEdges={edges}
                    onSave={handleSave}
                    className="h-full rounded-2xl border-zinc-800 bg-zinc-900/20"
                />
            </div>
        </div>
    );
};
