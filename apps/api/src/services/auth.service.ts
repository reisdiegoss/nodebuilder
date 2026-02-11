import { prisma } from '../../../../packages/database/index.js';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';

export class AuthService {
    /**
     * Registra um novo Tenant e o usuário administrador inicial.
     */
    static async signup(data: { name: string, email: string, tenantName: string, tenantSlug: string, password?: string }) {
        // 1. Criar o Tenant
        const tenant = await prisma.tenant.create({
            data: {
                name: data.tenantName,
                slug: data.tenantSlug,
                plan: 'FREE',
                status: 'ACTIVE'
            } as any
        });

        // 2. Criar o Usuário Administrador (Via Repository)
        const hashedPassword = data.password ? crypto.createHash('sha256').update(data.password).digest('hex') : null;

        const user = await userRepository.create({
            email: data.email,
            name: data.name,
            password: hashedPassword,
            role: 'ADMIN',
            tenantId: tenant.id
        });

        return { tenant, user };
    }

    /**
     * Autentica um usuário
     */
    static async login(email: string, password?: string) {
        const user = await userRepository.findByEmail(email);

        if (!user) throw new Error('Usuário não encontrado');

        if (password) {
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            if (user.password !== hashedPassword) throw new Error('Senha incorreta');
        }

        return user;
    }
}
