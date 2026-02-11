# Changelog - NodeBuilder IDE

## [0.5.0] - 2026-02-10

### Added

- **Engine Enterprise**: Geração de código OOP completo (Entities, Repositories, Services).
- **Smart Importer**: Importação de CSV, XLSX e migração de bancos SQL (MySQL/Postgres).
- **Auto-Swagger**: Documentação interativa `/usuario/projeto/docs` gerada em tempo real.
- **Webhook Generator**: Criação dinâmica de endpoints de entrada para projetos do cliente.
- **Advanced Widgets**: Suporte para Upload de Arquivos e Dashboards Gerenciais na Engine.
- **Project Export**: Funcionalidade de download do código-fonte em ZIP (SaaS side).
- **SaaS Billing Asaas**: Integração de webhooks para automação de faturamento e status de assinatura.
- **Admin Dashboard**: Gestão global de projetos e auditoria de logs.

### Changed

- **Arquitetura**: Refatoração total para POO (Instanciáveis) em todo o ecossistema.
- **Routing**: Padronização de acesso via path-based routing para sandboxes.
- **Infrastructure**: Substituição de Traefik por Port Pooling dinâmico no Docker Engine para ambiente de teste.

### Fixed

- Isolamento de dados entre tenants via Prisma Extensions.
- Sincronização de Auth Firebase com PostgreSQL.
