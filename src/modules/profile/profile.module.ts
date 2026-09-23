import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameState } from '../game-states/entities/game-state.entity';
import { Log } from '../register/entities/log.entity';
import { Review } from '../reviews/entities/review.entity';
import { SocialModule } from '../social/social.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameState, Log, Review]), SocialModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
