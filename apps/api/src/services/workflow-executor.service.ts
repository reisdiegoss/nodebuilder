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
        const stepId = `Step:${step.type}:${step.order}`;

        switch (step.type) {
            case 'LOG':
                const logMsg = this.interpolate(config.message || 'Log do sistema', context);
                console.log(`📝 [${stepId}] ${logMsg}`);
                break;

            case 'WEBHOOK':
                if (config.url) {
                    const interpolatedUrl = this.interpolate(config.url, context);
                    console.log(`🚀 [${stepId}] Enviando para ${interpolatedUrl}`);
                    try {
                        const response = await fetch(interpolatedUrl, {
                            method: config.method || 'POST',
                            headers: config.headers || { 'Content-Type': 'application/json' },
                            body: JSON.stringify(context)
                        });

                        const data = await response.json().catch(() => ({}));
                        console.log(`✅ [${stepId}] Resposta recebida.`);
                        // Adiciona o resultado ao contexto prefixado pelo ID do passo
                        return { ...context, [`step_${step.order}_result`]: data };
                    } catch (err) {
                        console.error(`❌ [${stepId}] Falha no Webhook:`, (err as any).message);
                        if (config.stopOnError) throw err;
                    }
                }
                break;

            case 'CONDITION':
                const actualValue = context[config.field] || this.interpolate(`{{${config.field}}}`, context);
                const expectedValue = config.value;
                const operator = config.operator || '==';

                console.log(`🔍 [${stepId}] Validando: ${actualValue} ${operator} ${expectedValue}`);

                let success = false;
                if (operator === '==' || operator === 'equals') success = actualValue == expectedValue;
                if (operator === '!=') success = actualValue != expectedValue;
                if (operator === '>') success = Number(actualValue) > Number(expectedValue);
                if (operator === '<') success = Number(actualValue) < Number(expectedValue);

                if (!success) {
                    console.log(`🚫 [${stepId}] Condição não atingida. Parando workflow.`);
                    throw new Error('STOP_WORKFLOW');
                }
                break;

            case 'ASAAS_PAYMENT':
                console.log(`💰 [${stepId}] Processando pagamento via Asaas...`);
                // Lógica de integração viria aqui
                break;

            default:
                console.warn(`⚠️ [${stepId}] Tipo de passo ignorado.`);
        }

        return context;
    }

    /**
     * Resolução recursiva de placeholders {{ user.name }}
     */
    private static interpolate(str: string, context: any): string {
        return str.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (match, path) => {
            const value = path.split('.').reduce((obj: any, key: string) => {
                if (obj === null || obj === undefined) return undefined;
                return obj[key];
            }, context);
            return value !== undefined ? String(value) : match;
        });
    }
}
