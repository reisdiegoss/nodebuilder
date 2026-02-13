import React, { useState } from 'react';
import { Mail, Lock, User, Building, Rocket, ArrowRight, Loader2 } from 'lucide-react';

interface OnboardingProps {
    onSuccess: (authData: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onSuccess }) => {
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        tenantName: '',
        tenantSlug: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const endpoint = mode === 'LOGIN' ? '/auth/login' : '/auth/register';
        const payload = mode === 'LOGIN'
            ? { email: formData.email, password: formData.password }
            : formData;

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === 'success') {
                onSuccess(data);
            } else {
                alert(data.error || 'Falha na autenticação');
            }
        } catch (error) {
            console.error('Erro no onboarding:', error);
            alert('Falha ao conectar com o servidor industrial.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 opacity-50" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-4 rotate-3">
                        <Rocket size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">NodeBuilder <span className="text-blue-500">PRO</span></h1>
                    <p className="text-zinc-500 font-medium">Plataforma Low-Code Industrial</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                    <div className="flex gap-4 mb-8 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                        <button
                            onClick={() => setMode('LOGIN')}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode('REGISTER')}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Registrar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'REGISTER' && (
                            <>
                                <InputGroup
                                    label="Nome Completo"
                                    icon={<User size={18} />}
                                    placeholder="João Silva"
                                    value={formData.name}
                                    onChange={(val: string) => setFormData({ ...formData, name: val })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup
                                        label="Sua Empresa"
                                        icon={<Building size={18} />}
                                        placeholder="Minha Tech"
                                        value={formData.tenantName}
                                        onChange={(val: string) => setFormData({ ...formData, tenantName: val, tenantSlug: val.toLowerCase().replace(/\s+/g, '-') })}
                                    />
                                    <InputGroup
                                        label="Subdomínio"
                                        icon={<ArrowRight size={18} />}
                                        placeholder="minha-tech"
                                        value={formData.tenantSlug}
                                        onChange={(val: string) => setFormData({ ...formData, tenantSlug: val })}
                                    />
                                </div>
                            </>
                        )}

                        <InputGroup
                            label="E-mail"
                            icon={<Mail size={18} />}
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(val: string) => setFormData({ ...formData, email: val })}
                        />

                        <InputGroup
                            label="Senha"
                            icon={<Lock size={18} />}
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(val: string) => setFormData({ ...formData, password: val })}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'LOGIN' ? 'Acessar Workspace' : 'Criar Conta Industrial'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        NodeBuilder © 2026 • Versão Beta 1.5.0
                    </p>
                </div>
            </div>
        </div>
    );
};

const InputGroup = ({ label, icon, placeholder, value, onChange, type = "text" }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-white outline-none focus:border-blue-600/50 transition-all focus:ring-4 focus:ring-blue-600/5 group-hover:border-zinc-700"
            />
        </div>
    </div>
);
