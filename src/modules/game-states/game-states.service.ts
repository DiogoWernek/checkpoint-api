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
}
