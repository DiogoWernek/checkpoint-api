import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { GameStatesModule } from './modules/game-states/game-states.module';
import { RegisterModule } from './modules/register/register.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SocialModule } from './modules/social/social.module';
import { ProfileModule } from './modules/profile/profile.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Entities — listadas explicitamente pro TypeORM (mesmo padrão do api-fops).
import { User } from './modules/users/entities/user.entity';
import { Otp } from './modules/auth/entities/otp.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { Game } from './modules/games/entities/game.entity';
import { IgdbToken } from './modules/games/entities/igdb-token.entity';
import { GameState } from './modules/game-states/entities/game-state.entity';
import { Log } from './modules/register/entities/log.entity';
import { Review } from './modules/reviews/entities/review.entity';
import { ReviewLike } from './modules/reviews/entities/review-like.entity';
import { ReviewComment } from './modules/reviews/entities/review-comment.entity';
import { Follow } from './modules/social/entities/follow.entity';
import { Favorite } from './modules/social/entities/favorite.entity';
import { List } from './modules/social/entities/list.entity';
import { ListItem } from './modules/social/entities/list-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [databaseConfig, jwtConfig] }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        throttlers: [{ ttl: seconds(Number(cs.get('THROTTLE_TTL') ?? 60)), limit: Number(cs.get('THROTTLE_LIMIT') ?? 120) }],
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: 'mysql',
        host: cs.get('DATABASE_HOST') ?? 'localhost',
        port: Number(cs.get('DATABASE_PORT') ?? 3306),
        username: cs.get('DATABASE_USERNAME') ?? 'root',
        password: cs.get('DATABASE_PASSWORD') ?? '',
        database: cs.get('DATABASE_NAME') ?? 'checkpoint',
        charset: 'utf8mb4',
        // true em dev: sem migrations por enquanto, o schema nasce das entities.
        // Trocar por migrations antes de qualquer deploy real em produção.
        synchronize: cs.get('NODE_ENV') !== 'production',
        logging: cs.get('DATABASE_LOGGING') === 'true',
        timezone: 'Z',
        entities: [
          User, Otp, RefreshToken,
          Game, IgdbToken,
          GameState, Log,
          Review, ReviewLike, ReviewComment,
          Follow, Favorite, List, ListItem,
        ],
      }),
    }),

    StorageModule,
    MailModule,
    HealthModule,
    AuthModule,
    UsersModule,
    GamesModule,
    GameStatesModule,
    RegisterModule,
    ReviewsModule,
    SocialModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
