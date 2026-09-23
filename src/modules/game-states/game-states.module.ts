import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameState } from './entities/game-state.entity';
import { Follow } from '../social/entities/follow.entity';
import { GameStatesController } from './game-states.controller';
import { GameStatesService } from './game-states.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameState, Follow])],
  controllers: [GameStatesController],
  providers: [GameStatesService],
  exports: [GameStatesService],
})
export class GameStatesModule {}
