# CHANGELOG

## [1.0.0] - 2026-02-10

### Adicionado

- Estrutura inicial do projeto NodeBuilder com prefixo `N`.
- Implementação de Widgets Enterprise: `NDataGrid`, `NUniqueSearch`, `NDBSelect`, `NFile`.
- `NForm` com validação real via Zod e persistência automática.
- Ponte ERD -> Prisma (`MigrationService`) com suporte a multitenancy em containers Docker.
- `SmartParser` com filtros de segurança SaaS e mapeamento inteligente de widgets.
- Geração dinâmica de Swagger CRUD para todas as tabelas ERD.
- Documentação mandatória: CHANGELOG, GUIA TÉCNICO, GUIA DE REFERÊNCIA e ROADMAP.
- Criado script `github.bat` para automação de commits e push.

## [1.2.0] - 2026-02-11

### Adicionado

- **Enterprise Suite Widgets**: Lançamento de `NMaskedInput`, `NTabs`, `NChart` (SVG), `NUpload` Pro e `NToast`.
- **RBAC Visual**: Sistema de permissões granular com modelos `Role` e `Permission` integrados ao tenant.
- **Menu Builder Dinâmico**: Navegação lateral (`NDynamicMenu`) gerada sob demanda via API filtrada por permissões.
- **NLayout Pro**: Refatoração do layout base para incluir sidebar dinâmica e área de trabalho Enterprise.
- **AuthService Integration**: Signup automatizado com criação de `Role` ADMINISTRADOR e vinculação de segurança.
- **NodeBuilder Platform**: Transição de "Gerador de CRUD" para "Plataforma Low-Code" com infraestrutura de segurança industrial.
