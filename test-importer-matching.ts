import { importerService } from './apps/api/src/services/importer.service.js';

console.log('🧪 Testando Smart Matching do Importador...\n');

const fileHeaders = ['Nome Completo', 'E-mail Principal', 'Telefone Celular', 'Data de Cadastro'];
const schemaFields = ['name', 'email', 'phone', 'createdAt', 'role'];

const suggestions = importerService.getMappingSuggestions(fileHeaders, schemaFields);

console.log('Mapeamento Sugerido:');
console.table(suggestions);

const expectedMatches = {
    'Nome Completo': 'name',
    'E-mail Principal': 'email',
    'Telefone Celular': 'phone'
};

let success = true;
Object.entries(expectedMatches).forEach(([header, field]) => {
    if (suggestions[header] !== field) {
        console.error(`❌ Falha no matching: ${header} -> ${suggestions[header]} (esperado: ${field})`);
        success = false;
    } else {
        console.log(`✅ ${header} -> ${field}`);
    }
});

if (success) {
    console.log('\n🌟 Algoritmo de Matching validado com sucesso!');
} else {
    process.exit(1);
}
