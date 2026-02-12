import { prisma } from '../../../../packages/database/index.js';
import { WorkflowExecutor } from './workflow-executor.service.js';

/**
 * TriggerSystem: Gerencia a execução de gatilhos automáticos
 */
export class TriggerSystem {
    /**
     * Intercepta eventos de escrita e executa gatilhos configurados
     */
    static async notifyEvent(projectId: string, eventType: 'ON_CREATE' | 'ON_UPDATE' | 'ON_DELETE', payload: any) {
        console.log(`🔔 [TriggerSystem] Evento ${eventType} no projeto ${projectId}`);

        // 1. Buscar gatilhos LEGADOS (AutomationTrigger)
        const triggers = await prisma.automationTrigger.findMany({
            where: { projectId, eventType }
        });

        for (const trigger of triggers) {
            await this.executeLegacy(trigger, payload);
        }

        // 2. Buscar NOVOS Workflows Dinâmicos (Low-Code)
        const workflows = await prisma.workflow.findMany({
            where: {
                projectId,
                triggerEvent: eventType,
                isActive: true
            }
        });

        for (const workflow of workflows) {
            await WorkflowExecutor.executeWorkflow(workflow.id, payload);
        }
    }

    private static async executeLegacy(trigger: any, payload: any) {
        const config = trigger.config as any;

        if (trigger.actionType === 'WEBHOOK' && config.url) {
            console.log(`🚀 [Trigger] Disparando Webhook para ${config.url}`);
            try {
                await fetch(config.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: trigger.eventType,
                        data: payload,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (err) {
                console.error(`Falha no Webhook ${trigger.id}:`, (err as any).message);
            }
        }

        if (trigger.actionType === 'SERVICE' && config.serviceName) {
            console.log(`⚙️ [Trigger] Executando Script: ${config.serviceName}`);
            // Lógica para carregar dinamicamente o .ts do service e executar o handle()
        }
    }
}
