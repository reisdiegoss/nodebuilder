import React, { useEffect, useRef } from 'react';
import { NPage } from '../widgets/NLayout';
import { NForm } from '../core/NForm';
import { NInput } from '../widgets/NInputs';
import { NUniqueSearch } from '../widgets/NUniqueSearch';
import { NButton } from '../widgets/NButton';
import { NDataGrid } from '../widgets/NDataGrid';
import { z } from 'zod';

/**
 * ESTE ARQUIVO REPRESENTA O OUTPUT DO SEU GERADOR.
 * Ele prova que a biblioteca @nodebuilder/core consegue renderizar um CRUD complexo.
 */

export default function PedidoForm() {
    // 1. Instância do Gerenciador de Formulário
    const form = useRef(new NForm('pedido_form')).current;

    // 2. Definição de Schema de Validação (Zod)
    const schema = z.object({
        codigo: z.string().min(1, "Código é obrigatório"),
        cliente_id: z.number({ required_error: "Selecione um cliente" }),
        total: z.number().min(0)
    });

    useEffect(() => {
        form.setValidationSchema(schema);
        // Simula carregamento de dados (Edit Mode)
        // form.setData({ codigo: 'PED-999', total: 150.00 });
    }, []);

    const handleSave = async () => {
        const isValid = await form.validate();
        if (!isValid) {
            alert("Erro na validação! Verifique os campos."); // No futuro: NToast.error()
            console.log(form.errors); // Mostra erros no console
            return;
        }

        const data = form.getData();
        console.log("Enviando para API Runtime:", data);
        // await api.post('/api/pedidos', data);
    };

    return (
        <NPage title="Cadastro de Pedidos">

            {/* Área do Formulário */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-12 gap-4">

                <div className="col-span-3">
                    <NInput
                        name="codigo"
                        label="Código do Pedido"
                        onChange={(v: any) => form.setData({ codigo: v })}
                    />
                </div>

                <div className="col-span-6">
                    {/* O Widget Enterprise em Ação */}
                    <NUniqueSearch
                        label="Cliente"
                        endpoint="/api/clientes" // API gerada automaticamente
                        displayField="nome_fantasia"
                        onSelect={(id: any, row: any) => {
                            form.setData({ cliente_id: id });
                            console.log("Cliente selecionado:", row);
                        }}
                    />
                </div>

                <div className="col-span-3">
                    <NInput
                        name="total"
                        label="Valor Total (R$)"
                        type="number"
                        onChange={(v: any) => form.setData({ total: parseFloat(v) })}
                    />
                </div>
            </div>

            {/* Barra de Ações */}
            <div className="flex gap-2 mb-8">
                <NButton label="Salvar Pedido" onClick={handleSave} variant="primary" />
                <NButton label="Cancelar" onClick={() => console.log('Back')} variant="secondary" />
            </div>

            {/* Grid de Itens (Mestre-Detalhe Simulado) */}
            <div className="border-t pt-6">
                <h3 className="font-bold text-gray-500 uppercase text-xs mb-4">Itens do Pedido</h3>
                <NDataGrid
                    endpoint="/api/pedido-itens?pedido_id=TEMP"
                    columns={[
                        { name: 'id', label: 'ID' },
                        { name: 'produto', label: 'Produto' },
                        { name: 'qtd', label: 'Qtd' },
                        { name: 'subtotal', label: 'Subtotal' }
                    ]}
                    // Exemplo de como a grid lida com estado vazio
                    actions={{
                        onDelete: (id: string) => console.log("Deletar item", id)
                    }}
                />
            </div>

        </NPage>
    );
}
