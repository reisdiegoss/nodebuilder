import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Database,
  Settings,
  Shield,
  Layout,
  Boxes,
  Wand2,
  ChevronRight,
  Plus,
  Play,
  Zap,
  Loader2,
  ExternalLink
} from 'lucide-react'

import { ERDModeler } from './components/ERDModeler.tsx';
import { CRUDWizard } from './components/CRUDWizard.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ModuleListing } from './components/ModuleListing.tsx';
import { WorkflowDesigner } from './components/WorkflowDesigner.tsx';
import { ProjectDashboard } from './components/ProjectDashboard.tsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isLaunching, setIsLaunching] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Resetar URL de preview ao trocar de projeto
  useEffect(() => {
    setPreviewUrl(null);
  }, [selectedProject]);

  const handleLaunchTest = async () => {
    if (!selectedProject) return;
    setIsLaunching(true);

    try {
      // Para o MVP Industrial 01, enviamos um schema básico se o modeler não estiver sincronizado
      const response = await fetch(`http://localhost:3000/projects/${selectedProject.id}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: [
            { name: 'Usuario', fields: [{ name: 'id', type: 'string', isPrimary: true }, { name: 'email', type: 'string' }] }
          ]
        })
      });

      const result = await response.json();
      if (result.url) {
        setPreviewUrl(result.url);
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao lançar teste:', error);
      alert('Falha ao orquestrar container de teste.');
    } finally {
      setIsLaunching(false);
    }
  }

  if (!selectedProject && activeTab !== 'admin') {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col">
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center px-8 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">N</div>
            <span className="font-bold tracking-tight text-white">NodeBuilder <span className="text-blue-500">IDE</span></span>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="text-zinc-500 hover:text-white p-2"
          >
            <Shield size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <ProjectDashboard onSelectProject={(p) => {
            setSelectedProject(p);
            setActiveTab('database');
          }} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-50 font-sans">
      {/* Sidebar de Navegação */}
      <aside className="w-16 flex flex-col items-center py-4 border-r border-zinc-800 bg-zinc-900/50">
        <div
          onClick={() => setSelectedProject(null)}
          className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-8 shadow-lg shadow-blue-900/20 cursor-pointer hover:scale-105 transition-all"
        >
          <span className="font-bold text-xl">N</span>
        </div>

        <nav className="flex flex-col gap-6">
          <SidebarIcon icon={<Database size={20} />} active={activeTab === 'database'} onClick={() => setActiveTab('database')} />
          <SidebarIcon icon={<Layout size={20} />} active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} />
          <SidebarIcon icon={<Boxes size={20} />} active={activeTab === 'modules'} onClick={() => setActiveTab('modules')} />
          <SidebarIcon icon={<Wand2 size={20} />} active={activeTab === 'wizard'} onClick={() => setActiveTab('wizard')} />
          <SidebarIcon icon={<Zap size={20} />} active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} />
          <SidebarIcon icon={<Shield size={20} />} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        </nav>

        <div className="mt-auto">
          <SidebarIcon icon={<Settings size={20} />} />
        </div>
      </aside>

      {/* Explorador Lateral */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Projeto Ativo</h2>
          <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full tracking-tight">
            {selectedProject?.name || 'Vazio'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <TreeItem label="Models (Database)" />
            <div className="ml-4 border-l border-zinc-800 pl-2 space-y-1">
              <TreeItem label="Usuario" isSelected />
              <TreeItem label="Pedido" />
            </div>
          </div>
          <div className="space-y-2">
            <TreeItem label="Páginas" />
            <div className="ml-4 border-l border-zinc-800 pl-2 space-y-1">
              <TreeItem label="Dashboard" />
              <TreeItem label="Relatórios" />
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Tabs */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Workspace</span>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <span className="text-white font-bold text-sm tracking-tight capitalize">{activeTab} Modeler</span>
          </div>

          <div className="flex items-center gap-3">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
              >
                <ExternalLink size={14} />
                <span>Preview Online</span>
              </a>
            )}
            <button
              onClick={handleLaunchTest}
              disabled={isLaunching}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white px-4 py-1.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              {isLaunching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              <span className="text-sm font-bold">{isLaunching ? 'Orquestrando...' : 'Rodar Preview Industrial'}</span>
            </button>
          </div>
        </header>

        {/* Editor/Core Area */}
        <div className="flex-1 overflow-auto bg-zinc-950">
          {activeTab === 'database' && <ERDModeler />}
          {activeTab === 'wizard' && <CRUDWizard />}
          {activeTab === 'modules' && <ModuleListing />}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'automation' && <WorkflowDesigner />}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
              <LayoutDashboard size={48} className="opacity-10 stroke-[1px]" />
              <p className="text-sm font-medium">Dashboard do Projeto em construção.</p>
            </div>
          )}
          {['explorer', 'pages'].includes(activeTab) && (
            <div className="flex items-center justify-center h-full text-zinc-600">
              Selecione uma entidade no explorador lateral.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SidebarIcon({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
        : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'
        }`}
    >
      {icon}
    </div>
  )
}

function TreeItem({ label, isSelected }: { label: string, isSelected?: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-all ${isSelected ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100'
      }`}>
      <ChevronRight size={14} className={isSelected ? 'text-blue-400' : 'text-zinc-700'} />
      <span className="font-medium">{label}</span>
    </div>
  )
}

export default App
