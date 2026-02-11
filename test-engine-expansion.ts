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

console.log('🧪 Iniciando teste da Engine Enterprise Expandida...\n');

const generatedFiles = oopEngineService.generateProject('MeuProjetoX', mockTables as any);

console.log('Arquivos Gerados:');
Object.keys(generatedFiles).forEach(file => console.log(`- ${file}`));

console.log('\n--- Verificando src/index.ts (Swagger) ---');
console.log(generatedFiles['src/index.ts'].includes('fastify.register(swagger)') ? '✅ Swagger Registrado' : '❌ Falha no Swagger');

console.log('\n--- Verificando src/services/importer.service.ts (SQL Support) ---');
console.log(generatedFiles['src/services/importer.service.ts'].includes('import { knex } from \'knex\'') ? '✅ SQL Support Presente' : '❌ Falha no SQL Support');

console.log('\n--- Verificando package.json (Dependencies) ---');
console.log(generatedFiles['package.json'].includes('"knex":') ? '✅ Dependências do Importer OK' : '❌ Falha nas Dependências');

console.log('\n✅ Teste de expansão concluído!');
