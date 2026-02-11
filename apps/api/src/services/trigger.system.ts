import { prisma } from '../../../../packages/database/index.js';
import axios from 'axios';

/**
 * TriggerSystem: Gerencia a execução de gatilhos automáticos
 */
export class TriggerSystem {
    /**
     * Intercepta eventos de escrita e executa gatilhos configurados
     */
    static async notifyEvent(projectId: string, eventType: 'ON_CREATE' | 'ON_UPDATE' | 'ON_DELETE', payload: any) {
        console.log(`🔔 [TriggerSystem] Evento ${eventType} no projeto ${projectId}`);

        // Buscar gatilhos ativos para este projeto e evento
        const triggers = await prisma.automationTrigger.findMany({
            where: {
                projectId,
                eventType,
                // isActive: true // se tivéssemos esse campo
            }
        });

        for (const trigger of triggers) {
            await this.execute(trigger, payload);
        }
    }

    private static async execute(trigger: any, payload: any) {
        const config = trigger.config as any;

        if (trigger.actionType === 'WEBHOOK' && config.url) {
            console.log(`🚀 [Trigger] Disparando Webhook para ${config.url}`);
            try {
                await axios.post(config.url, {
                    event: trigger.eventType,
                    data: payload,
                    timestamp: new Date().toISOString()
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
