import React, { useState, useEffect } from 'react';
import { Plus, Layout, Calendar, ChevronRight, Activity, Trash2 } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    status?: string;
}

interface ProjectDashboardProps {
    onSelectProject: (project: Project) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ onSelectProject }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProject.name) return;

        try {
            const response = await fetch('http://localhost:3000/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });

            if (response.ok) {
                setShowNewModal(false);
                setNewProject({ name: '', description: '' });
                fetchProjects();
            }
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Meus Projetos</h1>
                    <p className="text-zinc-500 font-medium">Gerencie suas aplicações industriais</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} />
                    <span>Novo Projeto</span>
                </button>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => onSelectProject(project)}
                            className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 hover:bg-zinc-900/60 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={18} className="text-blue-500" />
                            </div>

                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Layout size={24} />
                            </div>

                            <h3 className="font-bold text-lg text-white mb-1">{project.name}</h3>
                            <p className="text-zinc-500 text-xs mb-6 line-clamp-2 leading-relaxed">
                                {project.description || 'Nenhuma descrição fornecida para este projeto industrial.'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    <Calendar size={12} />
                                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                                    <Activity size={10} />
                                    <span>Online</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Criar Novo Projeto</h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome do Projeto</label>
                                <input
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors"
                                    placeholder="Ex: ERP Logística Alpha"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Descrição</label>
                                <textarea
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors h-24 resize-none"
                                    placeholder="Descreva o objetivo deste sistema..."
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 text-sm font-bold text-zinc-500 hover:bg-zinc-800 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateProject}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
                            >
                                Criar Projeto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
