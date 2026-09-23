import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameState } from '../game-states/entities/game-state.entity';
import { Log } from '../register/entities/log.entity';
import { Review } from '../reviews/entities/review.entity';
import { List } from '../social/entities/list.entity';
import { GameStatus } from '../../common/enums/game-status.enum';
import { SocialService } from '../social/social.service';

export interface ProfileStats {
  gamesCount: number;
  yearCount: number;
  reviewsCount: number;
  listsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface PlayingNow {
  game: { id: string; title: string; slug: string; coverUrl: string | null };
  hours: number | null;
  platform: string | null;
}

export interface DiaryEntry {
  id: string;
  status: GameStatus;
  rating: number | null;
  playedOn: string | null;
  createdAt: Date;
  game: { id: string; title: string; slug: string; coverUrl: string | null };
}

export interface RatingHistogram {
  counts: number[]; // índice 0 = nota 1 (meia estrela) .. índice 9 = nota 10 (5 estrelas)
  average: number | null;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(GameState) private readonly statesRepo: Repository<GameState>,
    @InjectRepository(Log) private readonly logsRepo: Repository<Log>,
    @InjectRepository(Review) private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(List) private readonly listsRepo: Repository<List>,
    private readonly socialService: SocialService,
  ) {}

  async stats(userId: string): Promise<ProfileStats> {
    const year = new Date().getFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

    const [gamesCount, yearCount, reviewsCount, listsCount, followersCount, followingCount] = await Promise.all([
      this.statesRepo
        .createQueryBuilder('gs')
        .where('gs.user_id = :userId', { userId })
        .andWhere('gs.status != :wishlist', { wishlist: GameStatus.WISHLIST })
        .getCount(),
      this.logsRepo
        .createQueryBuilder('l')
        .where('l.user_id = :userId', { userId })
        .andWhere('l.created_at >= :start', { start: yearStart })
        .andWhere('l.created_at < :end', { end: yearEnd })
        .getCount(),
      this.reviewsRepo.count({ where: { userId } }),
      this.listsRepo.count({ where: { userId } }),
      this.socialService.followersCount(userId),
      this.socialService.followingCount(userId),
    ]);

    return { gamesCount, yearCount, reviewsCount, listsCount, followersCount, followingCount };
  }

  async playingNow(userId: string): Promise<PlayingNow | null> {
    const state = await this.statesRepo
      .createQueryBuilder('gs')
      .innerJoinAndSelect('gs.game', 'game')
      .where('gs.user_id = :userId', { userId })
      .andWhere('gs.status = :status', { status: GameStatus.PLAYING })
      .orderBy('gs.updatedAt', 'DESC')
      .getOne();

    if (!state) return null;

    const lastLog = await this.logsRepo.findOne({
      where: { userId, gameId: state.gameId },
      order: { createdAt: 'DESC' },
    });

    return {
      game: { id: state.game.id, title: state.game.title, slug: state.game.slug, coverUrl: state.game.coverUrl },
      hours: lastLog?.hours ?? null,
      platform: lastLog?.platform ?? null,
    };
  }

  async diary(userId: string, limit = 8): Promise<DiaryEntry[]> {
    const logs = await this.logsRepo
      .createQueryBuilder('l')
      .innerJoinAndSelect('l.game', 'game')
      .where('l.user_id = :userId', { userId })
      .orderBy('l.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return logs.map((l) => ({
      id: l.id,
      status: l.status,
      rating: l.rating,
      playedOn: l.playedOn,
      createdAt: l.createdAt,
      game: { id: l.game.id, title: l.game.title, slug: l.game.slug, coverUrl: l.game.coverUrl },
    }));
  }

  async ratingHistogram(userId: string): Promise<RatingHistogram> {
    const states = await this.statesRepo.find({ where: { userId } });
    const ratings = states.map((s) => s.rating).filter((r): r is number => r != null);

    const counts = Array(10).fill(0) as number[];
    for (const rating of ratings) counts[rating - 1] = (counts[rating - 1] ?? 0) + 1;

    const average = ratings.length ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length) : null;

    return { counts, average };
  }
}
