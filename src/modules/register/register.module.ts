import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { GameState } from '../game-states/entities/game-state.entity';
import { Review } from '../reviews/entities/review.entity';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log, GameState, Review])],
  controllers: [RegisterController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
