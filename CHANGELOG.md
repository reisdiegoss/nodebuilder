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
- **CONSOLIDAÇÃO PREMIUM**: Paridade 100% com MadBuilder atingida.
- Refactor `NDataGrid` Pro: Ordenação, busca avançada e ações fixas.
- Refactor `NUniqueSearch` e `NDBSelect`: Suporte total a relacionamentos estrangeiros (FK).
- `NForm` Pro: Feedback visual de erro por campo baseado em validação Zod.
- A "Ponte de Ouro": Automação ERD -> Banco Real funcional via Docker Sync.
- SmartParser Pro: Injeção automática de `where: { tenantId }` para isolamento SaaS.
