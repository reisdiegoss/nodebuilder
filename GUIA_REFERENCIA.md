# GUIA DE REFERENCIA - NodeBuilder

## Componentes Disponíveis (@nodebuilder/core)

- `NPage`: Classe base para todas as páginas.
- `NForm`: Gestor de formulários com validação Zod.
- `NAction`: Encapsulamento de ações do sistema.
- `NDataGrid`: Tabela com paginação e busca.
- `NUniqueSearch`: Campo de busca FK com modal.
- `NTabs`: Navegação em abas.
- `NWindow`: Janelas/Modais.
- `NButton`: Botões inteligentes vinculados a NAction.

## Padrões

- Nomenclatura com prefixo `N`.
- Multi-tenancy isolado via injeção de `tenantId`.
- Estética Premium com Tailwind CSS e Framer Motion.
