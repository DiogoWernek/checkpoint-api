# checkpoint API

Backend próprio do [checkpoint](../checkpoint) — NestJS + TypeORM + MySQL +
MinIO + JWT, no lugar do Supabase usado até a Fase 4. Molde: o
[`api-fops`](../fops/api-fops), que já resolvia os mesmos problemas (registro,
login, código OTP, refresh token, upload em MinIO).

## Por quê

O checkpoint usava Supabase (Postgres + Auth + Storage + Edge Functions) num
projeto compartilhado com outros projetos pessoais (prefixo `cp_` em tudo). A
decisão foi trocar por infra própria — mesmo servidor que já hospeda o
`fops` (MySQL + MinIO via Easypanel), mas banco (`checkpoint`) e bucket
(`bucket-checkpoint`) separados do `fops`.

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

Com `NODE_ENV != production`, o TypeORM usa `synchronize: true` — o schema
nasce sozinho a partir das entities, sem precisar rodar migration nenhuma.
**Troque isso por migrations de verdade antes de qualquer deploy real.**

### Banco de dados

Localmente, aponte pra qualquer MySQL (`DATABASE_HOST=localhost`). Se for
usar o mesmo host remoto do `fops` (Easypanel), confirme que o usuário do
MySQL tem `ALL PRIVILEGES` no banco `checkpoint` — por padrão, um usuário
criado só pra outro banco (como o `mysql` do `fops`) só ganha `CREATE`/`DROP`
em bancos novos, não `ALTER`/`SELECT`/etc. Peça pra um admin rodar:

```sql
GRANT ALL PRIVILEGES ON checkpoint.* TO 'seu_usuario'@'%';
FLUSH PRIVILEGES;
```

Ou provisione um serviço de banco dedicado pro checkpoint no Easypanel (mais
limpo que reusar o usuário de outro app).

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
