import { oopEngineService } from './apps/api/src/services/oop-engine.service.js';

const mockTables = [
    {
        name: 'User',
        fields: [
            { name: 'id', type: 'string', isPrimary: true },
            { name: 'email', type: 'string' },
            { name: 'age', type: 'number', isNullable: true }
        ]
    },
    {
        name: 'Product',
        fields: [
            { name: 'id', type: 'string', isPrimary: true },
            { name: 'name', type: 'string' },
            { name: 'price', type: 'number' }
        ]
    }
];

console.log('🧪 Iniciando teste da Enterprise OOP Engine...\n');

const generatedFiles = oopEngineService.generateProject(mockTables as any);

Object.entries(generatedFiles).forEach(([fileName, content]) => {
    console.log(`--- Arquivo: ${fileName} ---`);
    console.log(content);
    console.log('\n');
});

console.log('✅ Teste concluído com sucesso!');
