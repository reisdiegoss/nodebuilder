import admin from 'firebase-admin';
import { userRepository } from '../repositories/user.repository.js';
import { prisma } from '../../../../packages/database/index.js';

if (!admin.apps.length) {
    admin.initializeApp({});
}

export class OAuthService {
    /**
     * Valida o token vindo do Firebase (Tunnel) e sincroniza com o PostgreSQL (Truth)
     */
    static async handleFirebaseSession(idToken: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { uid, email, name } = decodedToken;

            // 1. Buscar usuário via Repository
            let user = await userRepository.findByFirebaseId(uid);

            if (!user && email) {
                user = await userRepository.findByEmail(email);
            }

            // 2. Se não existe, cria o Tenant + User (Signup Automático)
            if (!user) {
                const tenantSlug = email?.split('@')[0] || `user-${uid.substring(0, 5)}`;

                const tenant = await prisma.tenant.create({
                    data: {
                        name: `${name || tenantSlug}'s Organization`,
                        slug: tenantSlug,
                        plan: 'FREE',
                        status: 'ACTIVE'
                    } as any
                });

                user = await userRepository.create({
                    email: email!,
                    name: name || tenantSlug,
                    firebaseId: uid,
                    role: 'ADMIN',
                    tenantId: tenant.id
                });
            } else if (!(user as any).firebaseId) {
                // Sincroniza o firebaseId
                user = await userRepository.updateFirebaseId(user.id, uid);
            }

            return user;
        } catch (error) {
            console.error('Erro na validação Firebase:', error);
            throw new Error('Falha na autenticação via Firebase');
        }
    }
}
