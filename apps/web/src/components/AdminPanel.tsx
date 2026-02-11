import React, { useState, useEffect } from 'react';
import { Shield, Users, CreditCard, Activity, Ban, CheckCircle, Package, Trash2, Search } from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'OVERDUE';
    nextBillingDate?: string;
}

interface Project {
    id: string;
    name: string;
    tenant: { name: string, slug: string };
    createdAt: string;
}

export const AdminPanel: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [view, setView] = useState<'tenants' | 'projects'>('tenants');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tRes, pRes] = await Promise.all([
                fetch('http://localhost:3000/admin/tenants', { headers: { 'x-tenant-id': 'admin' } }),
                fetch('http://localhost:3000/admin/projects', { headers: { 'x-tenant-id': 'admin' } })
            ]);
            setTenants(await tRes.json());
            setProjects(await pRes.json());
        } catch (err) {
            // Mocks para demonstração caso API não esteja rodando com dados reais
            setTenants([
                { id: '1', name: 'Dev Studio', slug: 'dev-studio', plan: 'PRO', status: 'ACTIVE', nextBillingDate: '2026-03-10' },
                { id: '2', name: 'Marketing Corp', slug: 'mkt', plan: 'FREE', status: 'OVERDUE', nextBillingDate: '2026-02-05' },
            ]);
            setProjects([
                { id: 'p1', name: 'CRM Vendas', tenant: { name: 'Dev Studio', slug: 'dev-studio' }, createdAt: '2026-02-01' },
                { id: 'p2', name: 'Site Institucional', tenant: { name: 'Marketing Corp', slug: 'mkt' }, createdAt: '2026-02-05' }
            ]);
        }
    };

    const deleteProject = async (id: string) => {
        if (!confirm('Deseja realmente deletar este projeto permanentemente?')) return;
        setProjects(prev => prev.filter(p => p.id !== id));
        // await fetch(`http://localhost:3000/admin/projects/${id}`, { method: 'DELETE', headers: { 'x-tenant-id': 'admin' } });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 bg-black min-h-screen text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-10 h-10 text-brand-blue" />
                    <h1 className="text-3xl font-bold">Painel Administrativo (SaaS)</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setView('tenants')} className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'tenants' ? 'bg-brand-blue text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                        <Users className="w-4 h-4" /> Tenants
                    </button>
                    <button onClick={() => setView('projects')} className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'projects' ? 'bg-brand-blue text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                        <Package className="w-4 h-4" /> Projetos Globais
                    </button>
                    <button className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 flex items-center gap-2 text-zinc-400">
                        <Activity className="w-4 h-4" /> Logs
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Tenants Ativos" value={tenants.length} icon={<Users />} />
                <MetricCard title="Total Projetos" value={projects.length} icon={<Package />} />
                <MetricCard title="Uptime Engine" value="99.9%" icon={<Activity />} />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
                    <h2 className="text-xl font-semibold">{view === 'tenants' ? 'Gestão de Clientes' : 'Monitoramento de Projetos'}</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                        <input type="text" placeholder="Pesquisar..." className="bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none w-64" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {view === 'tenants' ? (
                        <table className="w-full text-left">
                            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500 font-semibold">
                                <tr>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Plano</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                {tenants.map(t => (
                                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4"><div className="font-medium">{t.name}</div><div className="text-xs text-zinc-500">/{t.slug}</div></td>
                                        <td className="p-4"><span className="font-mono text-zinc-400">{t.plan}</span></td>
                                        <td className="p-4">{getStatusBadge(t.status)}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-zinc-400 hover:text-white mr-4">Gerenciar</button>
                                            <button className="text-red-400 hover:text-red-300">Bloquear</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500 font-semibold">
                                <tr>
                                    <th className="p-4">Projeto</th>
                                    <th className="p-4">Dono / Tenant</th>
                                    <th className="p-4">Data Criação</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                {projects.map(p => (
                                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4 font-medium text-brand-blue">{p.name}</td>
                                        <td className="p-4 text-zinc-400">{p.tenant.name} <span className="text-xs text-zinc-600">(@{p.tenant.slug})</span></td>
                                        <td className="p-4 text-sm text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => deleteProject(p.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const getStatusBadge = (status: string) => {
    const configs: any = {
        ACTIVE: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Ativo' },
        OVERDUE: { color: 'bg-yellow-500/20 text-yellow-400', icon: <CreditCard className="w-3 h-3" />, label: 'Atrasado' },
        BLOCKED: { color: 'bg-red-500/20 text-red-400', icon: <Ban className="w-3 h-3" />, label: 'Bloqueado' }
    };
    const c = configs[status] || { color: 'bg-zinc-800 text-zinc-400', label: 'Inativo' };
    return <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${c.color}`}>{c.icon} {c.label}</span>;
};

const MetricCard = ({ title, value, icon }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-2 hover:border-brand-blue/30 transition-colors group">
        <div className="text-zinc-500 flex items-center gap-2 text-sm uppercase font-semibold group-hover:text-brand-blue transition-colors">
            {React.cloneElement(icon, { className: 'w-4 h-4' })}
            {title}
        </div>
        <div className="text-3xl font-bold">{value}</div>
    </div>
);
