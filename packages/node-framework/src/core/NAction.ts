/**
 * NAction: Encapsula uma ação do sistema (MadBuilder Style)
 * Permite vincular comportamentos a componentes com parâmetros dinâmicos.
 */
export class NAction {
    private callback: Function;
    private parameters: Record<string, any> = {};

    constructor(callback: Function, parameters: Record<string, any> = {}) {
        this.callback = callback;
        this.parameters = parameters;
    }

    /**
     * Define um parâmetro para a ação
     */
    setParameter(key: string, value: any) {
        this.parameters[key] = value;
    }

    /**
     * Executa a ação
     */
    execute() {
        return this.callback(this.parameters);
    }
}
