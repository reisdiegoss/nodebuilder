import React from 'react';
import {
    NPage, NForm, NTabs, NChart, NMaskedInput,
    NInput, NUpload, NDataGrid, NToastContainer, NButton, NFormContainer
} from '../widgets';
import { LayoutDashboard, Users, Settings, Plus, ShoppingCart } from 'lucide-react';

export const EnterpriseDemo = () => {
    // Mock de dados para os gráficos
    const salesData = [
        { label: 'Jan', value: 450, color: '#3b82f6' },
        { label: 'Fev', value: 780, color: '#3b82f6' },
        { label: 'Mar', value: 600, color: '#3b82f6' },
        { label: 'Abr', value: 950, color: '#3b82f6' },
        { label: 'Mai', value: 820, color: '#3b82f6' },
        { label: 'Jun', value: 1100, color: '#2563eb' },
    ];

    const customerData = [
        { label: 'Seg', value: 20 },
        { label: 'Ter', value: 55 },
        { label: 'Qua', value: 45 },
        { label: 'Qui', value: 90 },
        { label: 'Sex', value: 75 },
    ];

    const handleSave = () => {
        (window as any).notify('Dados salvos com sucesso na nuvem!', 'success');
    };

    return (
        <NPage title="Demo Enterprise Suite">
            <NToastContainer />

            <NTabs
                tabs={[
                    {
                        id: 'dash',
                        label: 'Dashboard',
                        icon: <LayoutDashboard size={16} />,
                        content: (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <NChart
                                        type="bar"
                                        title="Vendas Mensais (R$)"
                                        data={salesData}
                                    />
                                    <NChart
                                        type="line"
                                        title="Novos Clientes p/ Dia"
                                        data={customerData}
                                    />
                                </div>
                                <div className="bg-blue-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-xl shadow-blue-900/20">
                                    <div>
                                        <h2 className="text-2xl font-bold">Relatório Consolidado</h2>
                                        <p className="opacity-80">Você atingiu 92% da meta trimestral.</p>
                                    </div>
                                    <NButton onClick={() => (window as any).notify('Relatório gerado!', 'info')}>
                                        Gerar PDF
                                    </NButton>
                                </div>
                            </div>
                        )
                    },
                    {
                        id: 'form',
                        label: 'Cadastro Avançado',
                        icon: <Plus size={16} />,
                        content: (
                            <NFormContainer
                                title="Configuração de Perfil Enterprise"
                                onSubmit={handleSave}
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <NInput label="Nome da Empresa" placeholder="Ex: Acme Corp" />
                                    <NMaskedInput mask="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" />
                                    <NMaskedInput mask="phone" label="Telefone Comercial" />
                                    <NMaskedInput mask="currency" label="Faturamento Previsto" />
                                </div>
                                <NUpload label="Documentação Digital" multiple />
                                <div className="flex justify-end mt-4">
                                    <NButton onClick={handleSave}>Salvar Alterações</NButton>
                                </div>
                            </NFormContainer>
                        )
                    },
                    {
                        id: 'settings',
                        label: 'Administrativo',
                        icon: <Settings size={16} />,
                        content: (
                            <NDataGrid
                                endpoint="/api/audit-logs"
                                columns={[
                                    { name: 'date', label: 'Data', sortable: true },
                                    { name: 'user', label: 'Usuário' },
                                    { name: 'action', label: 'Ação' },
                                    { name: 'status', label: 'Status' },
                                ]}
                                title="Logs de Auditoria"
                            />
                        )
                    }
                ]}
            />
        </NPage>
    );
};
