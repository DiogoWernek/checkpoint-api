import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Favorite } from './entities/favorite.entity';
import { List } from './entities/list.entity';
import { ListItem } from './entities/list-item.entity';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, Favorite, List, ListItem])],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService, TypeOrmModule],
})
export class SocialModule {}
