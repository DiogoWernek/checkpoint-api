import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 3306),
  username: process.env.DATABASE_USERNAME ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'checkpoint',
  logging: process.env.DATABASE_LOGGING === 'true',
}));
