# GUIA TECNICO - NodeBuilder

## Arquitetura

- **Monorepo**: Organizano em `packages` e `apps`.
- **Backend**: Fastify + Prisma.
- **Frontend**: React + Tailwind CSS.
- **Engine**: Localizada em `apps/api/src/services`, responsável pela geração de código OOP.

## Infraestrutura

- **Docker**: Utilizado para sandbox de teste dos projetos gerados.
- **Prisma Extensions**: Utilizado para o interceptador de Triggers globais.
- **Migration System**: Ponte entre o ERD JSON e o schema Prisma real.
