import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { IgdbToken } from './entities/igdb-token.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, IgdbToken])],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
