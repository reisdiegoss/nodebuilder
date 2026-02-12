import { prisma } from '../../../../packages/database/index.js';

export class WorkflowExecutor {
    /**
     * Executa um workflow completo, passo a passo.
     */
    static async executeWorkflow(workflowId: string, payload: any) {
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            include: { steps: { orderBy: { order: 'asc' } } }
        });

        if (!workflow || !workflow.isActive) return;

        console.log(`⚡ [WorkflowExecutor] Iniciando: ${workflow.name}`);

        let context = { ...payload, _timestamp: new Date().toISOString() };

        for (const step of workflow.steps) {
            try {
                context = await this.executeStep(step, context);
            } catch (err) {
                console.error(`❌ [WorkflowExecutor] Erro no passo ${step.type}:`, (err as any).message);
                break; // Interrompe o workflow em caso de erro crítico no passo
            }
        }
    }

    /**
     * Executa um passo individual do workflow.
     */
    private static async executeStep(step: any, context: any): Promise<any> {
        const config = step.config as any;

        switch (step.type) {
            case 'LOG':
                const logMsg = this.interpolate(config.message || 'Log do sistema', context);
                console.log(`📝 [Workflow:LOG] ${logMsg}`);
                break;

            case 'WEBHOOK':
                if (config.url) {
                    const interpolatedUrl = this.interpolate(config.url, context);
                    console.log(`🚀 [Workflow:WEBHOOK] Enviando para ${interpolatedUrl}`);
                    const response = await fetch(interpolatedUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(context)
                    });

                    const data = await response.json().catch(() => ({}));
                    // Adiciona o resultado do webhook ao contexto para passos futuros
                    return { ...context, [`step_${step.order}_result`]: data };
                }
                break;

            case 'CONDITION':
                // Lógica simples de condição: se o campo X for igual a Y
                if (config.field && config.value) {
                    const actualValue = context[config.field];
                    if (actualValue != config.value) {
                        console.log(`🚫 [Workflow:CONDITION] Condição não atingida. Saltando passos.`);
                        throw new Error('STOP_WORKFLOW'); // Sinaliza para parar a execução
                    }
                }
                break;

            case 'ASAAS_PAYMENT':
                console.log(`💰 [Workflow:ASAAS] Simulação de criação de cobrança no Asaas`);
                // Integração real viria aqui
                break;

            default:
                console.warn(`⚠️ [WorkflowExecutor] Tipo de passo desconhecido: ${step.type}`);
        }

        return context;
    }

    /**
     * Interpola strings usando o padrão {{ variavel }}
     */
    private static interpolate(str: string, context: any): string {
        return str.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (match, path) => {
            const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], context);
            return value !== undefined ? String(value) : match;
        });
    }
}
