import { useState } from 'react'
import {
  LayoutDashboard,
  Database,
  Settings,
  Shield,
  Layout,
  Boxes, // Added Boxes icon
  Wand2,
  ChevronRight,
  Plus,
  Play,
  Zap // Added Zap for automation
} from 'lucide-react'

import { ERDModeler } from './components/ERDModeler.tsx';
import { CRUDWizard } from './components/CRUDWizard.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ModuleListing } from './components/ModuleListing.tsx';
import { WorkflowDesigner } from './components/WorkflowDesigner.tsx';

function App() {
  const [activeTab, setActiveTab] = useState('database')

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-50 font-sans">
      {/* Sidebar de Navegação */}
      <aside className="w-16 flex flex-col items-center py-4 border-r border-zinc-800 bg-zinc-900/50">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-8 shadow-lg shadow-blue-900/20">
          <span className="font-bold text-xl">N</span>
        </div>

        <nav className="flex flex-col gap-6">
          <SidebarIcon icon={<LayoutDashboard size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
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
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Projeto: Meu App</h2>
          <Plus size={14} className="cursor-pointer hover:text-blue-500 transition-colors" />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <TreeItem label="Models (Database)" />
          <div className="ml-4 border-l border-zinc-800 pl-2">
            <TreeItem label="User" isSelected />
            <TreeItem label="Product" />
          </div>
          <TreeItem label="Páginas" />
          <div className="ml-4 border-l border-zinc-800 pl-2">
            <TreeItem label="Dashboard" />
            <TreeItem label="Lista de Usuários" />
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Tabs */}
        <header className="h-12 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm flex items-center gap-2">
              <span className="text-blue-400">Database Schema</span>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all shadow-lg shadow-blue-900/20">
            <Play size={14} fill="currentColor" />
            <span className="text-sm font-medium">Rodar Preview</span>
          </button>
        </header>

        {/* Editor/Core Area */}
        <div className="flex-1 overflow-auto bg-zinc-950">
          {activeTab === 'database' && <ERDModeler />}
          {activeTab === 'wizard' && <CRUDWizard />}
          {activeTab === 'modules' && <ModuleListing />}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'automation' && <WorkflowDesigner />}
          {activeTab === 'dashboard' && (
            <div className="p-8 text-zinc-500 text-center mt-20">Seu Dashboard aparecerá aqui em breve.</div>
          )}
          {['explorer', 'pages'].includes(activeTab) && (
            <div className="flex items-center justify-center h-full text-zinc-600">
              Selecione uma aba para começar
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
    <div className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm transition-colors ${isSelected ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
      }`}>
      <ChevronRight size={14} className={isSelected ? 'text-blue-400' : 'text-zinc-600'} />
      <span>{label}</span>
    </div>
  )
}

export default App
