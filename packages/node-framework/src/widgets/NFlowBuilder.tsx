import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    NodeProps,
    Edge,
    Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, Send, FileText, ChevronRight, Settings } from 'lucide-react';
import { cn } from '../utils';

/**
 * Tipos de Nós Customizados
 */
const TriggerNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-amber-400 rounded-3xl p-4 shadow-xl min-w-[200px]">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-xl">
                <Zap size={18} className="text-amber-600" />
            </div>
            <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Gatilho</p>
                <h4 className="text-sm font-bold text-slate-800">{String(data?.label || 'Sem Label')}</h4>
            </div>
        </div>
        <Handle type="source" position={"bottom" as any} className="w-3 h-3 bg-amber-400 border-2 border-white" />
    </div>
);

const ActionNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-blue-500 rounded-3xl p-4 shadow-xl min-w-[200px]">
        <Handle type="target" position={"top" as any} className="w-3 h-3 bg-blue-500 border-2 border-white" />
        <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl">
                {data?.type === 'WEBHOOK' ? <Send size={18} className="text-blue-600" /> : <FileText size={18} className="text-blue-600" />}
            </div>
            <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ação: {String(data?.type || 'Log')}</p>
                <h4 className="text-sm font-bold text-slate-800">{String(data?.label || 'Executar')}</h4>
            </div>
        </div>
        <Handle type="source" position={"bottom" as any} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
);

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
};

interface NFlowBuilderProps {
    initialNodes?: any[];
    initialEdges?: any[];
    onSave?: (data: { nodes: any[], edges: any[] }) => void;
    className?: string;
}

export const NFlowBuilder: React.FC<NFlowBuilderProps> = ({
    initialNodes = [],
    initialEdges = [],
    onSave,
    className
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as any);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const saveFlow = () => {
        if (onSave) onSave({ nodes, edges });
    };

    return (
        <div className={cn("flex flex-col h-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-200", className)}>
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-black text-slate-900 tracking-tighter">FLOW BUILDER</h2>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Projeto: Automação Loja</p>
                </div>
                <button
                    onClick={saveFlow}
                    className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                    Salvar Automação
                </button>
            </div>

            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    snapToGrid
                    snapGrid={[15, 15]}
                >
                    <Background color="#cbd5e1" gap={20} />
                    <Controls className="bg-white !shadow-xl !border-slate-100 !rounded-xl" />
                    <MiniMap
                        className="!bg-white !border-slate-100 !rounded-3xl !shadow-2xl overflow-hidden"
                        nodeColor={(n: any) => n.type === 'trigger' ? '#fbbf24' : '#3b82f6'}
                    />
                </ReactFlow>

                {/* Sidebar de Elementos (Mock) */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white flex flex-col gap-1">
                        <NodeButton icon={<Zap size={14} />} label="Trigger" color="text-amber-500" />
                        <NodeButton icon={<Send size={14} />} label="Webhook" color="text-blue-500" />
                        <NodeButton icon={<FileText size={14} />} label="Log" color="text-blue-500" />
                        <div className="h-px bg-slate-100 my-1"></div>
                        <NodeButton icon={<Settings size={14} />} label="Ajustes" color="text-slate-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const NodeButton = ({ icon, label, color }: any) => (
    <button className="flex items-center gap-2 px-3 py-2 hover:bg-white rounded-xl transition-all group">
        <div className={cn("p-1.5 rounded-lg bg-slate-50 group-hover:shadow-sm", color)}>
            {icon}
        </div>
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider transition-colors group-hover:text-slate-900">
            {label}
        </span>
    </button>
);
