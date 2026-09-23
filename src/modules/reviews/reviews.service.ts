import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

export interface GameReview {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  body: string;
  hasSpoilers: boolean;
  rating: number | null; // 1..10, escala do banco — o client converte pra estrelas
  likes: number;
  comments: number;
  createdAt: Date;
}

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private readonly reviewsRepo: Repository<Review>) {}

  async findByGame(gameId: string, limit = 20): Promise<GameReview[]> {
    const reviews = await this.reviewsRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.user', 'u')
      .innerJoinAndSelect('r.log', 'log')
      .loadRelationCountAndMap('r.likesCount', 'r.likes')
      .loadRelationCountAndMap('r.commentsCount', 'r.comments')
      .where('r.game_id = :gameId', { gameId })
      .orderBy('r.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return reviews.map((r) => ({
      id: r.id,
      authorName: r.user.displayName,
      authorUsername: r.user.username,
      authorAvatarUrl: r.user.avatarUrl,
      body: r.body,
      hasSpoilers: r.hasSpoilers,
      rating: r.log.rating,
      likes: (r as unknown as { likesCount: number }).likesCount ?? 0,
      comments: (r as unknown as { commentsCount: number }).commentsCount ?? 0,
      createdAt: r.createdAt,
    }));
  }
}
