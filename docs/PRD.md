PRD - NodeBuilder IDE (Versão 1.1)
==================================

1\. Visão Geral do Produto
--------------------------

O **NodeBuilder** é uma plataforma SaaS de desenvolvimento Low-code baseada em Node.js e TypeScript. Inspirada no ecossistema Adianti/MadBuilder, ela permite que desenvolvedores e empresas criem sistemas complexos, escaláveis e multi-tenant de forma visual, sem abdicar da liberdade de editar o código-fonte.

### 1.1 Objetivos Principais

* Reduzir o tempo de desenvolvimento em até 80% através de geradores visuais.

* Fornecer um ambiente de teste online imediato via containers Docker (inicialmente em Localhost).

* Oferecer suporte nativo a arquiteturas Multi-tenant (Single ou Multi Database).

* Facilitar integrações de terceiros e exposição de APIs via Swagger.

2\. Arquitetura e Stack Técnica
-------------------------------

* **Frontend (IDE):** React.js + Tailwind CSS + Lucide Icons + Dnd-kit (Drag & Drop).

* **Backend (Gerador):** Node.js + Fastify/Express + TypeScript, seguindo arquitetura POO (Classes e Models).

* **ORM:** Prisma (Suporte a MySQL, PostgreSQL e Supabase).

* **Runtime (Framework Gerado):** "NodeBuilder Core" focado em Classes e Modelos POO (Entity/Repository).

* **Infraestrutura:** \* **Desenvolvimento:** Docker Engine API via mapeamento de portas dinâmicas em localhost.

  * **Produção:** Traefik (Proxy Reverso) para roteamento por subdomínios/paths.

  * **Cache:** Redis para controle de tempo de vida dos containers.

3\. Módulos do Sistema
----------------------

### 3.1 Painel SaaS (Retaguarda Admin)

Gestão global da plataforma para os administradores do NodeBuilder.

* **Gestão de Clientes:** Dados cadastrais (Nome, CPF/CNPJ, E-mail, Telefone).

* **Planos e Quotas:**

  * Starter: 2 projetos, 1 usuário, 10 tabelas.

  * Pro: 10 projetos, 5 usuários, 50 tabelas, 15 integrações.

  * Enterprise: Ilimitado.

* **Validação de URL:** Verificação de disponibilidade de slug (ex: nodebuilder.com.br/minha-empresa).

### 3.2 Modelagem de Dados (ERD)

* **Diagrama Visual:** Criação de tabelas, colunas, chaves primárias/estrangeiras e relacionamentos.

* **Auto-Prisma:** Geração automática do arquivo schema.prisma.

* **Views:** Definição visual de visões de banco de dados.

### 3.3 Designer Visual de Telas (Low-code)

* **Wizard de Criação:** Seleção de Template (Form, Listagem, Kanban, Gráfico) -> Seleção de Tabela -> Seleção de Campos.

* **Drag & Drop:** Sidebar direita com widgets (Inputs, Selects, Grids, Uploads).

* **Modo Visual vs Código:** Alternância em tempo real para edição direta do TypeScript.

### 3.4 Integrações e Lógica de Negócio

* **Consumo de API:** Importação de cURL para gerar Services automaticamente.

* **API Generator:** Criador de endpoints para expor dados do sistema com **Swagger** automático.

* **Webhooks:** Gestão de tokens e endpoints de entrada para gatilhos externos.

* **Services:** Funções reutilizáveis (server-side) que podem ser chamadas em páginas ou automações.

### 3.5 Importador de Dados Inteligente

* **Fontes:** Excel (.xlsx), CSV, ou Conexão com DB externo (Postgres/MySQL).

* **Matching Tool:** Interface visual para mapear Colunas de Origem -> Colunas de Destino.

* **Processamento:** Inserção em lote (Batch processing).

4\. Fluxo de Deploy e Teste Online
----------------------------------

### 4.1 O "Teste Online" (Sandbox Local)

1. O usuário clica em "Gerar Teste Online".

2. O sistema provisiona dois containers: **App Container** + **DB Instance**.

3. O sistema aloca uma porta disponível no host (ex: 3001, 3002) e a mapeia para a porta 80 do container.

4. O banco é populado com as migrações geradas pelo modelador.

5. O sistema fornece ao usuário o link: <http://localhost:PORTA>.

6. **Ciclo de Vida:** O container é destruído após 20 minutos de inatividade.

### 4.2 Modos de Atualização

* **Hot Update:** Atualiza apenas arquivos .ts/tsx no container existente via volumes ou docker cp.

* **Full Rebuild:** Destrói container e banco de dados, recriando tudo do zero.

5\. Regras de Negócio de Exportação
-----------------------------------

* **Bundle ZIP:** Compactação de todo o projeto (Código + Dockerfile + Prisma).

* **Segurança:** O link de download expira em 10 minutos.

6\. Configurações do Framework (Multi-tenant)
---------------------------------------------

O projeto gerado deve permitir configurar via IDE:

* **Multiunidade:** Filtro automático por company\_id em todas as queries.

* **Multi-DB:** Opção de isolar dados em bancos de dados físicos diferentes por tenant.

* **Logs:** Habilitação seletiva de logs para Web, CLI e API.

* **Segurança:** Injeção de _Rest Key_ e _Install Token_ no ambiente.

7\. Roadmap de Desenvolvimento
------------------------------

1. **Fase 1 (MVP):** Modelador de DB + Designer de Telas Básico + Geração de Código.

2. **Fase 2 (Infra Local):** Integração Docker Engine API com mapeamento de portas em localhost.

3. **Fase 3 (SaaS):** Painel de Planos + Multi-tenancy + Gestão de Usuários.

4. **Fase 4 (Enterprise):** Importador de Dados + API Generator/Swagger + Webhooks.

5. **Fase 5 (Finalização):** Integração com Traefik para proxy reverso e roteamento por domínio/slug.
