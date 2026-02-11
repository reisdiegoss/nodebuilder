import { useState } from 'react';
import { z } from 'zod';

/**
 * NForm: Gerenciador de Estado, Validação Zod e Persistência
 */
export class NForm {
    private data: Record<string, any> = {};
    private model: string = '';
    private schema: z.ZodObject<any> | null = null;

    constructor(model?: string, schema?: z.ZodObject<any>) {
        if (model) this.model = model;
        if (schema) this.schema = schema;
    }

    linkTo(modelName: string, schema?: z.ZodObject<any>) {
        this.model = modelName;
        if (schema) this.schema = schema;
    }

    setData(data: any) {
        this.data = { ...this.data, ...data };
    }

    getData() {
        return this.data;
    }

    /**
     * Validação em tempo real usando Zod
     */
    async validate() {
        if (!this.schema) return { success: true };
        try {
            this.schema.parse(this.data);
            return { success: true };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, errors: error.issues };
            }
            return { success: false, errors: [{ message: 'Erro desconhecido na validação' }] };
        }
    }

    /**
     * Persistência Direta: Salva no backend do projeto
     */
    async save() {
        const validation = await this.validate();
        if (!validation.success) {
            console.error('Falha na validação:', validation.errors);
            alert('Por favor, corrija os erros no formulário.');
            return;
        }

        if (!this.model) throw new Error('Modelo não vinculado ao formulário');

        console.log(`💾 [NForm] Salvando em ${this.model}...`, this.data);

        try {
            const response = await fetch(`/api/v1/${this.model.toLowerCase()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });

            if (!response.ok) throw new Error('Falha ao salvar');

            alert('Registro salvo com sucesso!');
        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao comunicar com o servidor.');
        }
    }
}
