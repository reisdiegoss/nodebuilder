import React, { useState, useEffect } from 'react';
import { Layout, Zap, Database, Server, BarChart as ChartBar, TrendingUp, Cpu } from 'lucide-react';

interface Stats {
    totalProjects: number;
    activeDeployments: number;
    totalDeployments: number;
    usage: {
        storage: string;
        containers: number;
    }
}

interface ProjectStatsProps {
    user: any;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ user }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3000/stats', {
                    headers: { 'x-tenant-id': user.tenantId }
                });
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Erro ao buscar stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (isLoading) return <div className="p-8 h-full flex items-center justify-center text-zinc-500">Carregando métricas industriais...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tighter">Visão Geral do Tenant</h1>
                <p className="text-zinc-500 font-medium">Analytics em tempo real para {user.name}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Projetos Totais"
                    value={stats?.totalProjects || 0}
                    icon={<Layout className="text-blue-500" />}
                    trend="+12% este mês"
                />
                <StatCard
                    title="Containers Ativos"
                    value={stats?.activeDeployments || 0}
                    icon={<Zap className="text-emerald-500" />}
                    trend="Estável"
                />
                <StatCard
                    title="Uso de Storage"
                    value={stats?.usage.storage || '0GB'}
                    icon={<Database className="text-amber-500" />}
                    trend="54% da cota"
                />
                <StatCard
                    title="Infraestrutura"
                    value="Docker Swarm"
                    icon={<Server className="text-purple-500" />}
                    trend="On-Premise"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Atividade Recente
                        </h3>
                    </div>
                    <div className="h-48 flex items-end gap-2 px-2">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-600/20 rounded-t-lg relative group transition-all hover:bg-blue-600/40" style={{ height: `${h}%` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}req/s
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">
                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 text-zinc-500">Saúde do Sistema</h3>
                        <div className="flex items-center gap-4 py-4">
                            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                                <span className="text-xl font-black text-white">99%</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Uptime Global</h4>
                                <p className="text-xs text-zinc-500">Todos os serviços Swarm operando nominalmente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <HealthBar label="CPU Usage" percent={24} color="bg-blue-500" />
                        <HealthBar label="RAM Usage" percent={68} color="bg-purple-500" />
                        <HealthBar label="Disk I/O" percent={12} color="bg-amber-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend }: any) => (
    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl space-y-4 hover:border-zinc-700 transition-colors">
        <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-inner">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        </div>
        <div className="text-[10px] font-medium text-zinc-500">
            {trend}
        </div>
    </div>
);

const HealthBar = ({ label, percent, color }: any) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-zinc-600">{label}</span>
            <span className="text-zinc-400">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
        </div>
    </div>
);
