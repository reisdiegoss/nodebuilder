import { userRepository } from '../repositories/user.repository.js';
import { prisma } from '../../../../packages/database/index.js';

async function verify() {
    console.log('🧪 Iniciando Verificação de Auth Cross-Tenant...');

    try {
        // 1. Criar um Tenant e Usuário "Estranho"
        const tenantId = `foreign-tenant-${Date.now()}`;
        const email = `foreign-${Date.now()}@example.com`;

        await prisma.tenant.create({
            data: {
                id: tenantId,
                name: 'Foreign Org',
                slug: `foreign-${Date.now()}`,
                plan: 'FREE',
                status: 'ACTIVE'
            }
        });

        const role = await prisma.role.create({
            data: {
                name: 'Admin',
                slug: `admin-${Date.now()}`,
                tenantId: tenantId
            }
        });

        await userRepository.create({
            email: email,
            name: 'Foreign User',
            password: 'hashed_password',
            roleId: role.id,
            tenantId: tenantId
        });

        console.log('✅ Usuário estrangeiro criado no Tenant:', tenantId);

        // 2. Simular o Middleware setando um Tenant DIFERENTE (ex: default)
        (global as any).currentTenantId = 'default-tenant-id';
        console.log('🔄 Simulando contexto de Tenant Padrão...');

        // 3. Tentar buscar o usuário SEM desativar o isolamento (deve falhar)
        let user = await userRepository.findByEmail(email);
        if (!user) {
            console.log('🛡️  Isolamento funcionando: Usuário não encontrado no contexto errado.');
        } else {
            console.error('❌ FALHA: Isolamento não funcionou, usuário foi exposto!');
            process.exit(1);
        }

        // 4. Simular o Bypass de Auth (setando undefined)
        (global as any).currentTenantId = undefined;
        console.log('🔓 Aplicando Bypass de Auth (currentTenantId = undefined)...');

        // 5. Tentar buscar o usuário (deve funcionar)
        user = await userRepository.findByEmail(email);
        if (user && user.email === email) {
            console.log('🚀 SUCESSO: Usuário encontrado via Bypass de Auth!');
        } else {
            console.error('❌ FALHA: Mesmo com bypass, usuário não foi encontrado!');
            process.exit(1);
        }

        // 6. Cleanup
        await prisma.user.delete({ where: { email } });
        await prisma.role.delete({ where: { id: role.id } });
        await prisma.tenant.delete({ where: { id: tenantId } });
        console.log('扫 Cleanup concluído.');

        process.exit(0);
    } catch (error) {
        console.error('❌ ERRO CRÍTICO NA VERIFICAÇÃO:', error);
        process.exit(1);
    }
}

verify();
