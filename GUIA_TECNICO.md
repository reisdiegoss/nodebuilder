# GUIA TECNICO - NodeBuilder

## Arquitetura

- **Monorepo**: Organizano em `packages` e `apps`.
- **Backend**: Fastify + Prisma.
- **Frontend**: React + Tailwind CSS.
- **Engine**: Localizada em `apps/api/src/services`, responsável pela geração de código OOP e orquestração Docker.
- **Bind Mount Architecture**: O motor de lançamento escreve o código fisicamente em `storage/projects/<id>` e o monta diretamente nos containers para eliminar latência de rede e race conditions.

## Infraestrutura

- **Docker Swarm**: Gerencia o ciclo de vida dos containers de projeto e redes isoladas.
- **Prisma Extensions & Interceptors**: Todo projeto gerado inclui um `trigger.interceptor.ts` que rastreia mutações (CREATE/UPDATE/DELETE).
- **Multi-DB Provisioning**: Suporte nativo a MySQL, PostgreSQL e SQLite com provisionamento automático de serviços de banco vinculados.
- **Alpine Industrial Base**: Containers otimizados com `openssl` e `libc6-compat` injetados dinamicamente via `apk` no boot.
