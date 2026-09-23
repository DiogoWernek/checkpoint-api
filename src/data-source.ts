import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";

// Carregado fora do bootstrap do Nest (o CLI do TypeORM roda sozinho, sem
// subir o ConfigModule) — precisa ler o .env na mão aqui.
config();

/**
 * DataSource só pra CLI (`migration:generate`/`migration:run`/`migration:revert`)
 * — o app em si usa `TypeOrmModule.forRootAsync` no app.module.ts, que lê a
 * mesma config via ConfigService. Os dois precisam bater.
 *
 * `__dirname` funciona tanto rodando via ts-node (src/, entities .ts) quanto
 * compilado (dist/, entities .js) — o glob casa os dois formatos.
 */
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  username: process.env.DATABASE_USERNAME ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "checkpoint",
  charset: "utf8mb4",
  timezone: "Z",
  synchronize: false,
  logging: process.env.DATABASE_LOGGING === "true",
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  // O banco (`fops`, compartilhado) já tem uma tabela `migrations` própria do
  // api-fops — sem isso as duas ferramentas TypeORM brigariam pelo mesmo nome.
  migrationsTableName: "cp_migrations",
});
