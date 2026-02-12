import React, { useState } from 'react';
import { NFlowBuilder } from '@nodebuilder/core';
import { Save, Play, Plus, X, Globe, MessageSquare, Terminal } from 'lucide-react';

export const WorkflowDesigner: React.FC = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // Carregar fluxos existentes
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
        const rootNode = nodes.find(n => n.type === 'trigger');
        if (!rootNode) return [];

        const steps: any[] = [];
        let currentNodeId: string | undefined = rootNode.id;
        let order = 0;

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
            if (steps.length > 50) break;
        }

        return steps;
    };

    const handleSave = async (flow: any) => {
        setLoading(true);
        const compiledSteps = graphToSteps(nodes, edges);

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
                    config: { nodes, edges }, // Grafo visual
                    steps: compiledSteps // Fila linear compilada
                })
            });
            alert('Workflow salvo com sucesso!');
        } catch (err) {
            alert('Erro ao salvar no servidor.');
        } finally {
            setLoading(false);
        }
    };

    const updateNodeConfig = (nodeId: string, newConfig: any) => {
        setNodes((nds: any) => nds.map((node: any) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        config: { ...node.data.config, ...newConfig }
                    }
                };
            }
            return node;
        }));
    };

    return (
        <div className="flex flex-col h-full bg-[#1e2227] overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-white/10 bg-[#21252b] flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                        <Play size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-tight">Fluxo de Automação Pro Max</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Engine Ativa</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave({ nodes, edges })}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loading ? 'SALVANDO...' : 'SALVAR E COMPILAR'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Canvas Flow */}
                <div className="flex-1 p-4 relative overflow-hidden">
                    <NFlowBuilder
                        initialNodes={nodes}
                        initialEdges={edges}
                        onNodeClick={(node) => setSelectedNode(node)}
                        className="h-full rounded-2xl border-white/5 bg-[#181a1f]"
                    />
                </div>

                {/* Sidebar de Propriedades */}
                {selectedNode && (
                    <div className="w-80 bg-[#21252b] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Terminal size={14} className="text-blue-400" />
                                <span className="text-xs font-black text-white uppercase tracking-wider">Propriedades</span>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Identificação do Nó */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tipo do Componente</p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <h3 className="text-white font-bold text-sm">{selectedNode.data?.label || selectedNode.type}</h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {selectedNode.id}</p>
                                </div>
                            </div>

                            {/* Configurações Dinâmicas */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configurações</p>

                                {selectedNode.data?.type === 'WEBHOOK' ? (
                                    <div className="space-y-4">
                                        <PropertyInput
                                            label="URL do Endpoint"
                                            icon={<Globe size={12} />}
                                            value={selectedNode.data.config?.url || ''}
                                            onChange={(val: string) => updateNodeConfig(selectedNode.id, { url: val })}
                                            placeholder="https://api.exemplo.com/webhook"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1.5 focus-within:text-blue-400 transition-colors">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Método</label>
                                                <select
                                                    value={selectedNode.data.config?.method || 'POST'}
                                                    onChange={(e) => updateNodeConfig(selectedNode.id, { method: e.target.value })}
                                                    className="w-full bg-[#181a1f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none appearance-none"
                                                >
                                                    <option>GET</option>
                                                    <option>POST</option>
                                                    <option>PUT</option>
                                                    <option>DELETE</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <PropertyInput
                                            label="Mensagem de Log"
                                            icon={<MessageSquare size={12} />}
                                            value={selectedNode.data.config?.message || ''}
                                            onChange={(val: string) => updateNodeConfig(selectedNode.id, { message: val })}
                                            placeholder="Ex: Pedido {{data.id}} processado"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-white/5 space-y-2">
                            <p className="text-[9px] text-slate-400 leading-relaxed">
                                Use <code className="text-blue-400">{"{{variable}}"}</code> para injetar dados dinâmicos do contexto de execução.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PropertyInput = ({ label, icon, value, onChange, placeholder }: any) => (
    <div className="space-y-1.5 focus-within:text-blue-400 transition-colors">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                {icon}
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#181a1f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
            />
        </div>
    </div>
);
