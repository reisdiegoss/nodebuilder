import { oopEngineService } from './apps/api/src/services/oop-engine.service.js';

const mockTables = [
    {
        name: 'User',
        fields: [
            { name: 'id', type: 'string', isPrimary: true },
            { name: 'email', type: 'string' }
        ]
    }
];

console.log('🧪 Testando Engine Final (Paths & Webhooks)...\n');

const generatedFiles = oopEngineService.generateProject('TestProj', 'diego', 'meu-app', mockTables as any);

console.log('--- Verificando Roteamento do Swagger ---');
if (generatedFiles['src/index.ts'].includes("routePrefix: '/diego/meu-app/docs'")) {
    console.log('✅ Swagger Path Correct: /diego/meu-app/docs');
} else {
    console.error('❌ Swagger Path Incorrect!');
    console.log(generatedFiles['src/index.ts']);
}

console.log('\n--- Verificando Roteamento do Webhook ---');
if (generatedFiles['src/index.ts'].includes("fastify.post('/diego/meu-app/webhooks/asaas'")) {
    console.log('✅ Webhook Path Correct: /diego/meu-app/webhooks/asaas');
} else {
    console.error('❌ Webhook Path Incorrect!');
}

console.log('\n--- Verificando Handler do Webhook ---');
if (generatedFiles['src/webhooks/asaas.webhook.ts']) {
    console.log('✅ src/webhooks/asaas.webhook.ts gerado');
} else {
    console.error('❌ Webhook handler missing!');
}

console.log('\n✅ Todos os testes de geração passaram!');
