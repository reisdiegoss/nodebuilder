import { prisma } from '../../../../packages/database/index.js';

export class WorkflowRepository {
    async findAllByProject(projectId: string) {
        return await prisma.workflow.findMany({
            where: { projectId },
            include: { steps: { orderBy: { order: 'asc' } } }
        });
    }

    async findById(id: string) {
        return await prisma.workflow.findUnique({
            where: { id },
            include: { steps: { orderBy: { order: 'asc' } } }
        });
    }

    async upsert(data: any) {
        const { id, steps, ...workflowData } = data;

        // 1. Upsert do Workflow (Cabeçalho)
        const workflow = await prisma.workflow.upsert({
            where: { id: id || 'new' },
            create: workflowData,
            update: workflowData
        });

        // 2. Limpar passos antigos e criar novos (Atomicidade para simplificar o Designer)
        if (steps) {
            await prisma.workflowStep.deleteMany({
                where: { workflowId: workflow.id }
            });

            await prisma.workflowStep.createMany({
                data: steps.map((step: any, index: number) => ({
                    ...step,
                    workflowId: workflow.id,
                    order: index
                }))
            });
        }

        return this.findById(workflow.id);
    }

    async delete(id: string) {
        await prisma.workflowStep.deleteMany({ where: { workflowId: id } });
        return await prisma.workflow.delete({ where: { id } });
    }
}

export const workflowRepository = new WorkflowRepository();
