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
     * Validação real usando Zod com mapeamento refinado
     */
    async validate(): Promise<{ success: boolean; errors: Record<string, string> }> {
        if (!this.schema) return { success: true, errors: {} };

        const result = this.schema.safeParse(this.data);
        if (result.success) return { success: true, errors: {} };

        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
            const path = issue.path.join('.') || 'global';
            fieldErrors[path] = issue.message;
        });

        return { success: false, errors: fieldErrors };
    }

    /**
     * Salva os dados no banco usando persistência orquestrada
     */
    async save() {
        if (!this.model) throw new Error('Formulário não vinculado a um modelo Prisma. Use linkTo().');

        const validation = await this.validate();
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
