import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Trash2, Globe, Lock, ShieldCheck } from 'lucide-react';

interface DataSource {
    id: string;
    name: string;
    type: string;
    isPrimary: boolean;
    host?: string;
    database?: string;
}

export const ProjectSettings: React.FC<{ project: any, onUpdate: () => void }> = ({ project, onUpdate }) => {
    const [databases, setDatabases] = useState<DataSource[]>([]);
    const [isInspecting, setIsInspecting] = useState<string | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newDb, setNewDb] = useState({ name: '', type: 'postgresql', host: '', database: '', username: '', password: '' });

    useEffect(() => {
        fetchDatabases();
    }, [project.id]);

    const fetchDatabases = async () => {
        const res = await fetch(`http://localhost:3000/projects/${project.id}/databases`, {
            headers: { 'x-tenant-id': project.tenantId }
        });
        const data = await res.json();
        setDatabases(data);
    };

    const handleInspect = async (id: string) => {
        setIsInspecting(id);
        try {
            const res = await fetch(`http://localhost:3000/databases/${id}/inspect`, {
                headers: { 'x-tenant-id': project.tenantId }
            });
            const metadata = await res.json();
            console.log('Metadados importados:', metadata);
            alert('Schema importado com sucesso para o modelador visual!');
        } catch (err) {
            alert('Erro ao conectar no banco externo.');
        } finally {
            setIsInspecting(null);
        }
    };

    const handleAddDb = async () => {
        await fetch(`http://localhost:3000/projects/${project.id}/databases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-tenant-id': project.tenantId },
            body: JSON.stringify(newDb)
        });
        setShowNewModal(false);
        fetchDatabases();
        onUpdate();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <section className="space-y-6">
                <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Data Sources</h2>
                        <p className="text-zinc-500 text-sm font-medium">Gerencie múltiplas conexões e realize engenharia reversa</p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                        <Plus size={14} />
                        Conectar Novo Banco
                    </button>
                </div>

                <div className="grid gap-4">
                    {databases.map(db => (
                        <div key={db.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${db.isPrimary ? 'bg-blue-600/20 text-blue-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                    <Database size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white uppercase tracking-tighter">{db.name}</h4>
                                        {db.isPrimary && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase">Primary</span>}
                                    </div>
                                    <p className="text-zinc-500 text-xs font-medium">{db.type.toUpperCase()} • {db.host || 'Interno'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleInspect(db.id)}
                                    disabled={!!isInspecting}
                                    className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    {isInspecting === db.id ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    Importar Schema
                                </button>
                                {!db.isPrimary && (
                                    <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="border-b border-zinc-800 pb-6">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Infraestrutura de Produção</h2>
                    <p className="text-zinc-500 text-sm font-medium">Configure variáveis de ambiente para o deploy final</p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Segurança Industrial Ativa</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Postgres Production URL</label>
                            <div className="flex gap-2">
                                <input className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-400 font-mono" value="PB_DATABASE_URL" readOnly />
                                <button className="bg-zinc-800 p-2 rounded-xl"><Lock size={14} className="text-zinc-500" /></button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">MySQL External URL</label>
                            <div className="flex gap-2">
                                <input className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-400 font-mono" placeholder="mysql://user:pass@host:3306/db" />
                                <button className="bg-zinc-800 p-2 rounded-xl text-zinc-500 hover:text-white"><Globe size={14} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Nova Fonte de Dados</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Apelido do Banco</label>
                                <input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white" value={newDb.name} onChange={e => setNewDb({ ...newDb, name: e.target.value })} placeholder="Ex: MySQL Consultas" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Driver</label>
                                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white" value={newDb.type} onChange={e => setNewDb({ ...newDb, type: e.target.value })}>
                                    <option value="postgresql">PostgreSQL</option>
                                    <option value="mysql">MySQL</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hostname</label>
                                <input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white" value={newDb.host} onChange={e => setNewDb({ ...newDb, host: e.target.value })} placeholder="localhost" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setShowNewModal(false)} className="flex-1 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-800 uppercase">Cancelar</button>
                            <button onClick={handleAddDb} className="flex-1 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 uppercase">Salvar Conexão</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
