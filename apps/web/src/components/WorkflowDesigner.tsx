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
     * Algoritmo graphToSteps: Converte o grafo visual em uma lista linear para a Engine.
     */
    const graphToSteps = (nodes: any[], edges: any[]) => {
        // Encontra o nó raiz (trigger)
        const rootNode = nodes.find(n => n.type === 'trigger');
        if (!rootNode) return [];

        const steps: any[] = [];
        let currentNodeId: string | undefined = rootNode.id;
        let order = 0;

        // Traversal sequencial
        while (currentNodeId) {
            if (currentNodeId !== rootNode.id) {
                const node = nodes.find(n => n.id === currentNodeId);
                if (node) {
                    steps.push({
                        type: node.data?.type || (node.id.includes('cond') ? 'CONDITION' : 'LOG'),
                        config: node.data?.config || {},
                        order: order++
                    });
                }
            }

            const nextEdge = edges.find(e => e.source === currentNodeId);
            currentNodeId = nextEdge ? nextEdge.target : undefined;
            if (steps.length > 50) break; // Trava de segurança
        }

        return steps;
    };

    const handleSave = async (flow: any) => {
        setLoading(true);
        const compiledSteps = graphToSteps(flow.nodes, flow.edges);

        try {
            await fetch('http://localhost:3000/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Automação Enterprise Pro Max',
                    targetModel: 'Pedido',
                    triggerEvent: 'ON_CREATE',
                    projectId: 'default',
                    tenantId: 'system',
                    config: flow, // Grafo visual
                    steps: compiledSteps // Fila linear compilada
                })
            });
            alert('Workflow compilado e persistido com sucesso na Engine!');
        } catch (err) {
            alert('Erro ao salvar no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e2227]">
            {/* Header do Designer Pro Max */}
            <div className="h-14 border-b border-white/10 bg-[#21252b] flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                        <Play size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-tight">Fluxo de Automação Pro Max</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Engine de Execução Ativa</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all border border-zinc-700">
                        <Plus size={14} />
                        Novo Componente
                    </button>
                    <button
                        onClick={() => handleSave({ nodes, edges })}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loading ? 'COMPILANDO...' : 'SALVAR E COMPILAR'}
                    </button>
                </div>
            </div>

            {/* Area do Flow */}
            <div className="flex-1 p-6 relative">
                <NFlowBuilder
                    initialNodes={nodes}
                    initialEdges={edges}
                    onSave={handleSave}
                    className="h-full rounded-2xl border-white/5 bg-[#181a1f]"
                />
            </div>
        </div>
    );
};
