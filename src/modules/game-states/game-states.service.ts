import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameState } from './entities/game-state.entity';
import { Follow } from '../social/entities/follow.entity';
import { SetGameStateDto } from './dto/set-game-state.dto';
import { GameStatus } from '../../common/enums/game-status.enum';

export interface FriendPlay {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number | null;
  status: GameStatus;
}

export interface GameAggregateStats {
  ratingCount: number;
  average: number | null; // 1..10, escala do banco
  histogram: number[]; // índice 0 = nota 1 (meia estrela) .. índice 9 = nota 10 (5 estrelas)
}

@Injectable()
export class GameStatesService {
  constructor(
    @InjectRepository(GameState) private readonly statesRepo: Repository<GameState>,
    @InjectRepository(Follow) private readonly followsRepo: Repository<Follow>,
  ) {}

  async get(userId: string, gameId: string): Promise<GameState | null> {
    return this.statesRepo.findOne({ where: { userId, gameId } });
  }

  /** Upsert usado pelas ações rápidas — o registro completo (horas/plataforma/review) é o módulo `register`. */
  async set(userId: string, dto: SetGameStateDto): Promise<GameState> {
    const existing = await this.statesRepo.findOne({ where: { userId, gameId: dto.gameId } });
    const payload: Partial<GameState> = {
      userId,
      gameId: dto.gameId,
      status: dto.status,
      rating: dto.rating ?? existing?.rating ?? null,
      liked: dto.liked ?? existing?.liked ?? false,
    };

    if (existing) {
      await this.statesRepo.update({ userId, gameId: dto.gameId }, payload);
    } else {
      await this.statesRepo.save(this.statesRepo.create(payload));
    }
    const saved = await this.get(userId, dto.gameId);
    if (!saved) throw new BadRequestException('Falha ao salvar estado do jogo');
    return saved;
  }

  /** Pessoas que `userId` segue e que têm estado nesse jogo. */
  async friendsWhoPlayed(userId: string, gameId: string): Promise<FriendPlay[]> {
    const follows = await this.followsRepo.find({ where: { followerId: userId } });
    const followingIds = follows.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const states = await this.statesRepo
      .createQueryBuilder('gs')
      .innerJoinAndSelect('gs.user', 'u')
      .where('gs.game_id = :gameId', { gameId })
      .andWhere('gs.user_id IN (:...followingIds)', { followingIds })
      .orderBy('gs.updatedAt', 'DESC')
      .getMany();

    return states.map((s) => ({
      userId: s.userId,
      username: s.user.username,
      displayName: s.user.displayName,
      avatarUrl: s.user.avatarUrl,
      rating: s.rating,
      status: s.status,
    }));
  }

  /** Média/histograma do jogo — calculado ao vivo (sem tabela de agregado mantida por trigger,
   * igual o raciocínio do ProfileService: escala pessoal não justifica essa complexidade). */
  async gameStats(gameId: string): Promise<GameAggregateStats> {
    const states = await this.statesRepo.find({ where: { gameId } });
    const ratings = states.map((s) => s.rating).filter((r): r is number => r != null);

    const histogram = Array(10).fill(0) as number[];
    for (const rating of ratings) histogram[rating - 1] = (histogram[rating - 1] ?? 0) + 1;

    const average = ratings.length ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length) : null;

    return { ratingCount: ratings.length, average, histogram };
  }
}
