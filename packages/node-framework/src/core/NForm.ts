import { z } from 'zod';

/**
 * NForm: O cérebro do formulário NodeBuilder.
 * Gerencia automaticamente busca, validação Zod e persistência.
 */
export class NForm {
    private data: Record<string, any> = {};
    private schema: z.ZodObject<any> | null = null;
    private errors: Record<string, string> = {};
    private model: string = '';

    constructor(model?: string, schema?: z.ZodObject<any>) {
        if (model) this.model = model;
        if (schema) this.schema = schema;
    }

    /**
     * Vincula o formulário a um modelo do Prisma no servidor gerado
     */
    public linkTo(modelName: string, schema?: z.ZodObject<any>) {
        this.model = modelName;
        if (schema) this.schema = schema;
        return this;
    }

    /**
     * Define o esquema de validação
     */
    public setValidationSchema(schema: any) {
        this.schema = schema;
        return this;
    }

    public setData(data: any) {
        this.data = { ...this.data, ...data };
    }

    public getData(field?: string) {
        if (field) return this.data[field];
        return this.data;
    }

    /**
     * Valida os dados usando Zod.
     */
    public async validate(): Promise<boolean> {
        if (!this.schema) return true;

        try {
            this.schema.parse(this.data);
            this.errors = {};
            return true;
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors: any = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0]] = e.message;
                });
                this.errors = formattedErrors;
            }
            return false;
        }
    }

    public getError(field: string): string | undefined {
        return this.errors[field];
    }

    /**
     * Salva os dados no servidor (Paridade MadBuilder)
     */
    public async save(): Promise<any> {
        if (!this.model) throw new Error('Formulário não vinculado a um modelo. Use linkTo().');

        const isValid = await this.validate();
        if (!isValid) return { success: false, errors: this.errors };

        try {
            const endpoint = `/api/v1/${this.model.toLowerCase()}`;
            const method = this.data.id ? 'PUT' : 'POST';
            const url = this.data.id ? `${endpoint}/${this.data.id}` : endpoint;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });

            const result = await res.json();
            if (res.ok) alert('Registro processado com sucesso!');
            return { success: res.ok, data: result };
        } catch (err) {
            console.error('NForm Save Error:', err);
            alert('Erro ao comunicar com o servidor.');
            return { success: false, error: 'Erro de rede.' };
        }
    }
}
