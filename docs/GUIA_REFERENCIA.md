Guia de Referência de Negócio - NodeBuilder
===========================================

1\. O Conceito Low-code
-----------------------

O NodeBuilder é projetado para democratizar o desenvolvimento de software, atendendo a dois perfis principais:

* **Novatos:** Utilizam a abstração total através do Designer Visual, Modelador ERD e Wizards de criação. O foco é a produtividade sem necessidade de escrita manual de código.

* **Experientes:** Possuem total liberdade para ejetar do modo visual e editar o código TypeScript gerado, permitindo customizações complexas e integração de bibliotecas externas, mantendo a compatibilidade com o framework base.

2\. Estrutura SaaS (Multi-tenant)
---------------------------------

A plataforma opera como um ecossistema de múltiplos clientes, cada um isolado em sua própria organização.

* **Identidade Organizacional:** O cliente fornece dados como Razão Social, CNPJ/CPF e E-mail para faturamento e gestão.

* **Slug de Usuário (Identificador):** Cada cliente escolhe um slug único (ex: academia-vip).

* **Roteamento em Desenvolvimento:** Nesta fase inicial, o acesso aos projetos será feito via <http://localhost:PORTA>. O sistema gerencia um pool de portas dinâmicas para evitar conflitos entre diferentes containers de teste ativos.

3\. Planos e Limites de Uso
---------------------------

O acesso aos recursos é controlado por uma estrutura de planos (Starter, Pro, Enterprise), limitando:

* **Projetos:** Quantidade de aplicações independentes que podem ser criadas.

* **Usuários:** Número de desenvolvedores/colaboradores com acesso à IDE por projeto.

* **Banco de Dados:** Quantidade de instâncias de banco (MySQL/Postgres) provisionadas.

* **Modelagem:** Limite de tabelas e relacionamentos por projeto.

* **Integrações:** Volume de serviços externos e Webhooks configurados.

4\. Filosofia "Adianti" Adaptada ao Node.js
-------------------------------------------

O NodeBuilder herda a agilidade do Adianti Framework, transpondo-a para o ecossistema moderno de JavaScript/TypeScript:

* **Arquitetura Baseada em Objetos:** Telas (Forms, Grids) são tratadas como objetos que recebem definições de metadados, facilitando a manutenção e a padronização.

* **Injeção Automática de Lógica:** Filtros de segurança, auditoria (logs) e tratamento de multiunidade são injetados diretamente no "NodeBuilder Core", desonerando o desenvolvedor de implementar estas camadas repetitivamente.

5\. Estratégias de Multi-tenancy no Framework
---------------------------------------------

O desenvolvedor define como o sistema gerado lidará com o isolamento de dados:

* **Single Tenant:** Cada cliente do usuário final possui uma base de dados física isolada.

* **Multi Tenant (Shared DB):** Dados de todos os tenants residem na mesma tabela, com filtro obrigatório por company\_id injetado no nível do ORM (Prisma).

* **Multi Tenant (Multi DB):** O framework gerencia conexões dinâmicas que alternam o banco de dados em tempo de execução com base no contexto do usuário logado.

6\. Ciclo de Vida do Teste Online (Sandbox)
-------------------------------------------

O ambiente de teste é temporário e focado em validação rápida:

* **Isolamento:** Cada clique em "Gerar Teste" sobe um novo container Docker para a aplicação e uma instância para o banco de dados.

* **Temporalidade:** O ambiente tem vida útil de 20 minutos. Após este período, os containers e dados temporários são destruídos automaticamente.

* **Atualização:** O sistema permite o "Hot Update" (sincronização de arquivos no container ativo) ou "Full Rebuild" (recriação total do ambiente).

7\. Exportação e Segurança de Propriedade Intelectual
-----------------------------------------------------

* **Pacote de Código:** O usuário pode exportar o projeto completo em formato ZIP (Código TS + Configurações Docker + Schema Prisma).

* **Segurança de Download:** O link gerado para download é único e possui validade de 10 minutos no servidor antes de ser excluído permanentemente para proteger o código-fonte do cliente.
