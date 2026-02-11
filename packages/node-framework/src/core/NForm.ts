import { z } from 'zod';

/**
 * NForm: Gerenciador de estado e validação de formulários.
 * * Agora implementa os métodos setField, getErrors, getData e outros
 * necessários para que os componentes de exemplo compilem corretamente.
 */
export class NForm {
    private name: string;
    private data: Record<string, any> = {};
    private schema: z.ZodObject<any> | null = null;
    private errors: Record<string, string> = {};
    private targetModel: string = '';

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Define o valor de um campo específico.
     * Utilizado pelos widgets de Input para atualizar o estado.
     * @param field Nome do campo
     * @param value Valor do campo
     */
    public setField(field: string, value: any): void {
        this.data[field] = value;
        // Limpa o erro do campo ao digitar, se existir
        if (this.errors[field]) {
            delete this.errors[field];
        }
    }

    /**
     * Retorna o valor atual de um campo.
     * @param field Nome do campo
     */
    public getField(field: string): any {
        return this.data[field];
    }

    /**
     * Substitui todo o objeto de dados (útil para carregar dados de edição).
     * @param data Objeto completo
     */
    public setData(data: any): void {
        this.data = { ...data };
    }

    /**
     * Retorna o objeto de dados completo para envio à API.
     */
    public getData(): Record<string, any> {
        return this.data;
    }

    /**
     * Retorna a lista de erros de validação atuais.
     */
    public getErrors(): Record<string, string> {
        return this.errors;
    }

    /**
     * Retorna o erro de um campo específico, se houver.
     */
    public getError(field: string): string | undefined {
        return this.errors[field];
    }

    /**
     * Vincula o formulário a um Schema de validação Zod.
     */
    public setValidationSchema(schema: any): this {
        this.schema = schema;
        return this;
    }

    /**
     * Vincula a um modelo de banco de dados (para uso futuro com o Parser).
     */
    public linkTo(modelName: string): this {
        this.targetModel = modelName;
        return this;
    }

    /**
     * Executa a validação dos dados atuais contra o schema.
     * @returns true se válido, false se houver erros.
     */
    public async validate(): Promise<boolean> {
        if (!this.schema) return true;

        try {
            this.schema.parse(this.data);
            this.errors = {}; // Limpa erros se passar
            return true;
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {};
                err.errors.forEach((e) => {
                    // Garante que o path existe antes de atribuir
                    if (e.path.length > 0) {
                        formattedErrors[e.path[0].toString()] = e.message;
                    }
                });
                this.errors = formattedErrors;
            }
            return false;
        }
    }
}