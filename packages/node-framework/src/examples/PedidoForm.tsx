import React, { useEffect, useRef } from 'react';
import { NPage } from '../core/NPage';
import { NForm } from '../core/NForm';
import { NInput } from '../widgets/NInputs';
import { NUniqueSearch } from '../widgets/NUniqueSearch';
import { NButton } from '../widgets/NButton';
import { NDataGrid } from '../widgets/NDataGrid';
import { z } from 'zod';

/**
 * PedidoForm
 * Exemplo corrigido com tipagem explícita para passar no build "strict: true".
 * Resolve erros TS7006 (implicit any).
 */
export default function PedidoForm() {
    const form = useRef(new NForm('pedido_form')).current;

    const schema = z.object({
        codigo: z.string().min(1, "Código é obrigatório"),
        cliente_id: z.number({ required_error: "Selecione um cliente" }),
        total: z.number().min(0)
    });

    useEffect(() => {
        form.setValidationSchema(schema);
    }, [form, schema]); // Dependências adicionadas para evitar warn de lint

    const handleSave = async () => {
        const isValid = await form.validate();
        if (!isValid) {
            console.error("Erros:", form.getErrors());
            alert("Corrija os erros antes de salvar.");
            return;
        }

        const data = form.getData();
        console.log("Enviando:", data);
    };

    return (
        <NPage title="Cadastro de Pedidos" breadcrumb={['Vendas', 'Pedidos']}>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-3">
                    <NInput
                        name="codigo"
                        label="Código do Pedido"
                        // Tipagem explícita 'v: string' resolve TS7006
                        onChange={(v: string) => form.setField('codigo', v)}
                    />
                </div>

                <div className="col-span-12 md:col-span-6">
                    <NUniqueSearch
                        label="Cliente"
                        endpoint="/api/clientes"
                        displayField="nome"
                        // Tipagem explícita 'id: string | number' e 'row: any'
                        onSelect={(id: string | number, row: any) => {
                            form.setField('cliente_id', Number(id));
                            console.log("Selecionado:", row);
                        }}
                    />
                </div>

                <div className="col-span-12 md:col-span-3">
                    <NInput
                        name="total"
                        label="Valor Total"
                        type="number"
                        // Tipagem explícita
                        onChange={(v: string) => form.setField('total', parseFloat(v))}
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <NButton label="Salvar Pedido" onClick={handleSave} variant="primary" />
                <NButton label="Voltar" onClick={() => console.log('voltar')} variant="secondary" />
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Itens do Pedido</h3>
                <NDataGrid
                    endpoint="/api/pedidos/itens"
                    columns={[
                        { name: 'id', label: 'ID', width: '80px' },
                        { name: 'produto', label: 'Produto' },
                        { name: 'qtd', label: 'Qtd', width: '100px' },
                        { name: 'valor', label: 'Valor Unit.' }
                    ]}
                    actions={{
                        // Tipagem explícita
                        onDelete: (row: any) => console.log("Del:", row.id)
                    }}
                />
            </div>

        </NPage>
    );
}