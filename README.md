# checkpoint API

Backend próprio do [checkpoint](../checkpoint) — NestJS + TypeORM + MySQL +
MinIO + JWT, no lugar do Supabase usado até a Fase 4. Molde: o
[`api-fops`](../fops/api-fops), que já resolvia os mesmos problemas (registro,
login, código OTP, refresh token, upload em MinIO).

## Por quê

O checkpoint usava Supabase (Postgres + Auth + Storage + Edge Functions) num
projeto compartilhado com outros projetos pessoais (prefixo `cp_` em tudo). A
decisão foi trocar por infra própria — **mesmo banco MySQL do `fops`**
(literalmente o schema `fops`, não um banco separado — mesmo raciocínio do
Supabase: um servidor só, várias coisas pessoais nele) e mesma instância de
MinIO, com bucket próprio (`bucket-checkpoint`).

**Toda tabela usa o prefixo `cp_`** (`cp_users`, `cp_games`, `cp_logs`...) —
é isso que evita colidir com as tabelas do próprio `fops` no mesmo banco. A
tabela de controle de migrations do TypeORM também é renomeada
(`cp_migrations`, ver `data-source.ts`/`app.module.ts`) — sem isso ela
colidiria com a `migrations` que o `api-fops` já usa nesse schema.

## Stack

- **NestJS 11** + **TypeORM 0.3** (MySQL, `mysql2`)
- **JWT** próprio (access 15min + refresh 30d com rotação e detecção de
  reuso) — sem OAuth por enquanto (só e-mail/senha + código OTP)
- **MinIO** pra avatares (bucket público de leitura — sem signed URL, ao
  contrário dos documentos privados do `api-fops`)
- **Nodemailer** pra e-mails transacionais (código OTP)
- **class-validator/class-transformer**, **Swagger** (`/docs`), **Throttler**

## Setup

```bash
npm install
cp .env.example .env   # edite com suas credenciais
npm run start:dev
```

O schema vem de **migrations** (`src/migrations/`), não de `synchronize`
(desligado sempre, mesmo em dev). Depois do primeiro `npm install`, rode:

```bash
npm run migration:run
```

Isso cria as 14 tabelas do zero. O `Dockerfile` já roda esse comando
automaticamente antes de subir o servidor (`CMD` faz `migration:run &&
node dist/main`) — em cada deploy no Easypanel, migrations pendentes são
aplicadas sozinhas.

**Ao mudar uma entity** (`src/**/*.entity.ts`), gere a migration correspondente:

```bash
npm run build   # migration:generate faz diff contra o banco de verdade — schema atual (sem synchronize) importa
npm run migration:generate -- src/migrations/NomeDescritivo
```

Confira o arquivo gerado antes de commitar — geração automática de diff
erra às vezes em casos raros (renomear coluna vira "apagar + criar", por
exemplo). Reverter a última: `npm run migration:revert`.

### Banco de dados

**Local (dev):** qualquer MySQL, banco próprio e isolado — não precisa ser
`fops`, é só pra desenvolver (`DATABASE_HOST=localhost`, `DATABASE_NAME`
qualquer nome). As tabelas já nascem prefixadas `cp_`, então nem colidiria.

**Produção (Easypanel):** aponta pro banco `fops` de verdade —

```
DATABASE_HOST=epmsdv.easypanel.host
DATABASE_PORT=3306
DATABASE_USERNAME=mysql
DATABASE_PASSWORD=<a mesma senha que o api-fops usa>
DATABASE_NAME=fops
```

O usuário `mysql` já tem `ALL PRIVILEGES` no banco `fops` (é o mesmo que o
`api-fops` usa), então a migration roda sem precisar de nenhum `GRANT` extra.

### MinIO

Bucket `bucket-checkpoint` já existe na instância do `fops`
(`fops-storage-fops.epmsdv.easypanel.host`), criado com policy de leitura
pública (avatares carregam direto num `<img src>`, sem token). Se for outra
instância, o `MinioService` cria o bucket sozinho no boot (`onModuleInit`) e
aplica a mesma policy.

### IGDB / Twitch

Mesmas credenciais do checkpoint original (client credentials — sem login de
usuário). Ver `checkpoint/README.md` pra como gerar as suas.

## Rotas principais

Documentação interativa completa em `/docs` (Swagger) com o servidor
rodando. Resumo:

- `POST /api/auth/register` · `login` · `login/otp` · `refresh` · `logout`
- `POST /api/auth/verify-otp` · `resend-otp` · `forgot-password` · `reset-password`
- `GET /api/auth/username-disponivel/:username`
- `GET/PATCH /api/me` · `POST /api/me/avatar` · `GET /api/perfil/:username`
- `GET /api/games/search?q=` · `GET /api/games/:slug`
- `GET/PUT /api/game-states/...` (ações rápidas, amigos que jogaram)
- `POST /api/register` (registrar/avaliar — transacional: log + game_state + review opcional)
- `GET /api/games/:gameId/reviews`
- `GET/POST/DELETE /api/users/:userId/seguir` · `GET /api/users/:userId/favoritos`
- `GET /api/perfil/:userId/stats` · `jogando-agora` · `diario` · `notas`

## O que ficou de fora (por enquanto)

- **OAuth** (Google/Discord/Apple) — só e-mail/senha + código OTP.
- **Listas** (criar lista, adicionar jogos) — as entities existem
  (`List`/`ListItem`), mas sem endpoints ainda; o frontend também não tem
  essa tela construída.
- **Curtir/comentar review** — entities prontas (`ReviewLike`/`ReviewComment`),
  sem endpoints; é escopo da Fase 5 (feed) no plano original.
- **Feed de atividades** — não existia no Supabase original também (Fase 5).
