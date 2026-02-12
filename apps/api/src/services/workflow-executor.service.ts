import { prisma } from '../../../../packages/database/index.js';

/**
 * Interface que define o contexto de execução em tempo real
 */
interface ExecutionContext {
    data: any; // O payload dinâmico (ex: dados do Pedido criado)
    flow: { id: string; name: string }; // Metadados do fluxo em execução
}

export class WorkflowExecutor {
    /**
     * Ponto de entrada principal acionado pelo TriggerSystem.
     */
    static async executeWorkflow(workflowId: string, payload: any) {
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            include: { steps: { orderBy: { order: 'asc' } } }
        });

        if (!workflow || !workflow.isActive) return;

        console.log(`⚡ [WorkflowEngine] Iniciando: ${workflow.name}`);

        const context: ExecutionContext = {
            data: payload,
            flow: { id: workflow.id, name: workflow.name }
        };

        for (const step of workflow.steps) {
            try {
                const continueFlow = await this.executeStep(step, context);
                if (!continueFlow) {
                    console.log(`⏹️ [Workflow: ${workflow.name}] Fluxo interrompido logicamente.`);
                    break;
                }
            } catch (err) {
                console.error(`❌ [Workflow: ${workflow.name}] Erro no passo ${step.type}:`, (err as any).message);
                break;
            }
        }
    }

    /**
     * Executa um passo individual do workflow.
     */
    private static async executeStep(step: any, context: ExecutionContext): Promise<boolean> {
        const config = step.config as any;
        const stepId = `Step:${step.type}:${step.order}`;

        switch (step.type) {
            case 'LOG':
                const logMsg = this.interpolate(config.message || 'Log do sistema', context);
                console.log(`📝 [${stepId}] ${logMsg}`);
                return true;

            case 'WEBHOOK':
            case 'HTTP_REQUEST':
                if (config.url) {
                    const url = this.interpolate(config.url, context);
                    const method = config.method || 'POST';
                    console.log(`🚀 [${stepId}] Enviando ${method} para ${url}`);

                    try {
                        const rawBody = config.body || context.data;
                        const interpolatedBody = typeof rawBody === 'string'
                            ? this.interpolate(rawBody, context)
                            : JSON.stringify(rawBody);

                        const response = await fetch(url, {
                            method,
                            headers: config.headers ? JSON.parse(this.interpolate(JSON.stringify(config.headers), context)) : { 'Content-Type': 'application/json' },
                            body: method !== 'GET' ? interpolatedBody : undefined
                        });

                        console.log(`✅ [${stepId}] Status: ${response.status}`);
                        return true;
                    } catch (err) {
                        console.error(`❌ [${stepId}] Falha:`, (err as any).message);
                        return config.stopOnError ? false : true;
                    }
                }
                return true;

            case 'CONDITION':
                return this.evaluateCondition(config, context);

            case 'ASAAS_PAYMENT':
                console.log(`💰 [${stepId}] Processando pagamento via Asaas...`);
                return true;

            default:
                console.warn(`⚠️ [${stepId}] Ignorado.`);
                return true;
        }
    }

    /**
     * Avaliador de Condições Premium
     */
    private static evaluateCondition(config: any, context: ExecutionContext): boolean {
        const fieldPath = config.field || config.fieldPath;
        const actualValue = this.resolvePath(fieldPath, context);
        const expectedValue = config.value || config.valueToCompare;
        const operator = config.operator || '==';

        const a = isNaN(Number(actualValue)) ? actualValue : Number(actualValue);
        const b = isNaN(Number(expectedValue)) ? expectedValue : Number(expectedValue);

        console.log(`🔍 [Condition] ${a} ${operator} ${b}`);

        switch (operator) {
            case '==': return a == b;
            case '!=': return a != b;
            case '>': return a > b;
            case '<': return a < b;
            case '>=': return a >= b;
            case '<=': return a <= b;
            case 'CONTAINS': return String(a).includes(String(b));
            default: return false;
        }
    }

    /**
     * Resolução recursiva de placeholders {{ data.pedido.total }} com casting automático de tipos.
     */
    private static interpolate(template: string, context: any): any {
        if (typeof template !== 'string') return template;

        // Se o template for EXATAMENTE um placeholder unico (ex: "{{data.id}}"), tentamos o casting
        const singleMatch = template.match(/^\{\{\s*([\w\.]+)\s*\}\}$/);
        if (singleMatch) {
            const rawValue = this.resolvePath(singleMatch[1], context);
            return this.autoCast(rawValue);
        }

        // Caso contrário, tratamos como interpolação de string comum
        return template.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (match, path) => {
            const value = this.resolvePath(path, context);
            return value !== undefined && value !== null ? String(value) : match;
        });
    }

    /**
     * Tenta converter strings para tipos primitivos (Number/Boolean).
     */
    private static autoCast(val: any): any {
        if (typeof val !== 'string') return val;

        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;

        const num = Number(val);
        if (!isNaN(num) && val.trim() !== '') return num;

        return val;
    }

    private static resolvePath(path: string, obj: any): any {
        if (!path || !obj) return undefined;
        try {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        } catch (err) {
            return undefined;
        }
    }
}
