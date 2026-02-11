# Guia Técnico de Arquitetura - NodeBuilder

## 1. Tecnologias

- **Backend**: Fastify v4+ rodando em JavaScript compilado (`dist/`) para máxima compatibilidade Windows.
- **Frontend**: React 18 + Vite + Tailwind CSS.
- **Banco de Dados**: PostgreSQL v15+ com Prisma ORM v5.
- **Orquestração**: Docker Engine SDK (dockerode).
- **Arquitetura**: Orientada a Objetos (Classes, Models e Services instanciáveis).

## 2. Orquestração Docker (Desenvolvimento)

Enquanto em localhost, a orquestração seguirá estes passos:

1. **Alocação de Portas:** O backend mantém um pool de portas disponíveis (ex: 3000-4000).

2. **Docker API:** Utilização da lib dockerode para:

    - docker create (Node.js App + Database Image).

    - docker start.

3. **Volumes:** Montagem de volumes para sincronizar o código gerado na pasta /projects/user/app diretamente com o container (permitindo o Hot Update).

## 3. Engine de Geração de Código

O coração da IDE é o gerador:

- **Template Engine:** Uso de EJS ou strings literais de TS para injetar metadados em templates pré-definidos.

- **Prisma Introspection:** Capacidade de ler um banco existente para sugerir componentes no Wizard.

## 4. Importador de Dados

- **Parsing:** Uso de xlsx e csv-parser para leitura de arquivos.

- **Batch Insert:** Lógica de prisma.createMany() com tratamento de erros por linha.

- **Matching:** Algoritmo que sugere campos de destino baseados na similaridade de nomes (ex: Name -> nome).

## 5. Webhooks e Services

- **Services:** São exportados como classes TypeScript no framework gerado.

- **Webhooks:** Camada de API que recebe um POST, valida o Bearer Token e executa um service.run().

- **Swagger:** Integração automática com @fastify/swagger para expor a documentação dos endpoints criados pelo usuário.
