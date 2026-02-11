import { useState } from 'react';
import { Button } from '../../../../packages/ui/components/Button.js';
import { Wand2, Database, Check, ArrowRight, Layout } from 'lucide-react';

export const CRUDWizard = () => {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        table: '',
        pageName: '',
        template: 'list'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const nextStep = () => {
        if (step === 1 && !config.table) {
            alert('Por favor, selecione uma tabela primeiro.');
            return;
        }
        setStep(s => s + 1);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('http://localhost:3000/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: config.pageName || `${config.table}Page`,
                    type: 'PAGE',
                    schema: { ...config, generated: true },
                    projectId: 'default-project'
                })
            });
            if (response.ok) {
                alert('Página gerada e salva com sucesso!');
                setStep(1);
            }
        } catch (error) {
            console.error('Erro ao gerar:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600/20 rounded-xl">
                    <Wand2 className="text-blue-500" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Wizard CRUD</h1>
                    <p className="text-zinc-500">Gere telas funcionais em segundos</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-zinc-800'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                        <Database className="text-zinc-500" size={20} />
                        Selecione a Tabela
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {['Usuarios', 'Produtos', 'Vendas'].map(t => (
                            <button
                                key={t}
                                onClick={() => setConfig({ ...config, table: t })}
                                className={cn(
                                    "p-6 rounded-xl border text-left transition-all",
                                    config.table === t
                                        ? "bg-blue-600/10 border-blue-600 text-blue-400"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                )}
                            >
                                <span className="block font-bold mb-1">{t}</span>
                                <span className="text-xs opacity-60">Tabela do banco de dados</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                        <Layout className="text-zinc-500" size={20} />
                        Selecione o Template
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {['list', 'form', 'details'].map(t => (
                            <button
                                key={t}
                                onClick={() => setConfig({ ...config, template: t })}
                                className={cn(
                                    "p-6 rounded-xl border text-left transition-all",
                                    config.template === t
                                        ? "bg-blue-600/10 border-blue-600 text-blue-400"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                )}
                            >
                                <span className="block font-bold mb-1">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                                <span className="text-xs opacity-60">Template de {t}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                        <Check className="text-zinc-500" size={20} />
                        Resumo
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                        <div>
                            <p className="text-zinc-400 text-sm">Tabela Selecionada:</p>
                            <p className="text-white font-semibold">{config.table}</p>
                        </div>
                        <div>
                            <p className="text-zinc-400 text-sm">Template Selecionado:</p>
                            <p className="text-white font-semibold">{config.template.charAt(0).toUpperCase() + config.template.slice(1)}</p>
                        </div>
                        {/* Add more summary details if needed, e.g., pageName */}
                    </div>
                </div>
            )}

            <div className="mt-12 flex justify-end gap-4">
                {step > 1 && (
                    <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Voltar</Button>
                )}
                {step < 3 ? (
                    <Button onClick={nextStep} className="flex items-center gap-2">
                        Continuar
                        <ArrowRight size={18} />
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2"
                    >
                        {isGenerating ? 'Gerando...' : 'Gerar Página'}
                        <Check size={18} />
                    </Button>
                )}
            </div>
        </div>
    );
};

// Helper for classes (I'll need to fix this or import it)
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
