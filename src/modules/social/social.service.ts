import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Follow) private readonly followsRepo: Repository<Follow>,
    @InjectRepository(Favorite) private readonly favoritesRepo: Repository<Favorite>,
  ) {}

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;
    const found = await this.followsRepo.findOne({ where: { followerId, followingId } });
    return !!found;
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) throw new BadRequestException('Você não pode seguir a si mesmo');
    const exists = await this.followsRepo.findOne({ where: { followerId, followingId } });
    if (exists) return;
    await this.followsRepo.save(this.followsRepo.create({ followerId, followingId }));
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.followsRepo.delete({ followerId, followingId });
  }

  async followersCount(userId: string): Promise<number> {
    return this.followsRepo.count({ where: { followingId: userId } });
  }

  async followingCount(userId: string): Promise<number> {
    return this.followsRepo.count({ where: { followerId: userId } });
  }

  async favoritesByUser(userId: string) {
    return this.favoritesRepo.find({
      where: { userId },
      relations: ['game'],
      order: { position: 'ASC' },
    });
  }
}
