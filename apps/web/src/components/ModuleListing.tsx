import { useState, useEffect } from 'react';
import { FileCode, Layout, Boxes, Search, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../../../../packages/ui/components/Button.js';

export const ModuleListing = () => {
    const [modules, setModules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const response = await fetch('http://localhost:3000/modules');
            const data = await response.json();
            setModules(data);
        } catch (error) {
            console.error('Erro ao buscar módulos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Boxes className="text-blue-500" />
                    Gerenciamento de Módulos
                </h1>
                <p className="text-zinc-500">Visualize e gerencie páginas e componentes gerados pelo motor</p>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 transition-all"
                        placeholder="Pesquisar por nome ou tipo..."
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-xs">Todos</Button>
                    <Button variant="outline" className="text-xs">Páginas</Button>
                    <Button variant="outline" className="text-xs">Componentes</Button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-zinc-600 text-center py-20">Buscando módulos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map(module => (
                        <div key={module.id} className="glass-card group overflow-hidden">
                            <div className="p-1 bg-zinc-800/50 flex items-center justify-between px-3">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${module.type === 'PAGE' ? 'text-blue-400' : 'text-purple-400'
                                    }`}>
                                    {module.type}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-zinc-500 hover:text-white"><ExternalLink size={14} /></button>
                                    <button className="text-zinc-500 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded bg-blue-600/10 text-blue-500">
                                        {module.type === 'PAGE' ? <Layout size={20} /> : <FileCode size={20} />}
                                    </div>
                                    <h3 className="text-white font-bold">{module.name}</h3>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Criado em:</span>
                                        <span className="text-zinc-400">{new Date(module.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Arquivos:</span>
                                        <span className="text-green-500 font-mono">2 gerados</span>
                                    </div>
                                </div>
                                <Button className="w-full text-xs py-1.5 flex items-center justify-center gap-2">
                                    <FileCode size={14} />
                                    Abrir no Editor
                                </Button>
                            </div>
                        </div>
                    ))}

                    {modules.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-zinc-800 rounded-xl py-20 text-center text-zinc-500">
                            Nenhum módulo gerado ainda. Use o Wizard ou o Modelador ERD.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
