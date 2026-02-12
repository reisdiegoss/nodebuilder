import { prisma } from '../../../../packages/database/index.js';
import type { User, Tenant } from '@prisma/client';

export class UserRepository {
    /**
     * Busca um usuário pelo e-mail (incluindo o Tenant)
     */
    async findByEmail(email: string): Promise<(User & { tenant: Tenant }) | null> {
        return await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        }) as any;
    }

    /**
     * Busca um usuário pelo Firebase ID
     */
    async findByFirebaseId(firebaseId: string): Promise<(User & { tenant: Tenant }) | null> {
        return await prisma.user.findFirst({
            where: { firebaseId } as any,
            include: { tenant: true }
        }) as any;
    }

    /**
     * Cria um novo usuário
     */
    async create(data: {
        email: string,
        name: string | null,
        password?: string | null,
        firebaseId?: string | null,
        roleId: string,
        tenantId: string
    }): Promise<User & { tenant: Tenant }> {
        return await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: data.password || undefined,
                firebaseId: data.firebaseId || null,
                roleId: data.roleId,
                tenantId: data.tenantId
            } as any,
            include: { tenant: true }
        }) as any;
    }

    /**
     * Atualiza o Firebase ID de um usuário existente
     */
    async updateFirebaseId(id: string, firebaseId: string): Promise<User & { tenant: Tenant }> {
        return await prisma.user.update({
            where: { id },
            data: { firebaseId } as any,
            include: { tenant: true }
        }) as any;
    }
}

export const userRepository = new UserRepository();
