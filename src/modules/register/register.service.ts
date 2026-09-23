import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Log } from './entities/log.entity';
import { GameState } from '../game-states/entities/game-state.entity';
import { Review } from '../reviews/entities/review.entity';
import { RegisterLogDto } from './dto/register-log.dto';

/**
 * Equivalente à RPC `cp_registrar_log` do schema Postgres original: insere o
 * log do diário, espelha o estado atual (upsert em game_states) e, se houver
 * texto, cria a review — tudo numa transação só (mesmo raciocínio de por que
 * isso não pode ser 3 chamadas separadas: ver PLAN.md §"Salvar em Registrar").
 */
@Injectable()
export class RegisterService {
  constructor(private readonly dataSource: DataSource) {}

  async registrarLog(userId: string, dto: RegisterLogDto): Promise<Log> {
    return this.dataSource.transaction(async (manager) => {
      const log = await manager.save(
        manager.create(Log, {
          userId,
          gameId: dto.gameId,
          status: dto.status,
          rating: dto.rating ?? null,
          liked: dto.liked ?? false,
          playedOn: dto.playedOn ?? null,
          hours: dto.hours ?? null,
          platform: dto.platform ?? null,
          isReplay: dto.isReplay ?? false,
          tags: dto.tags ?? [],
        }),
      );

      const existingState = await manager.findOne(GameState, { where: { userId, gameId: dto.gameId } });
      const statePayload = {
        userId,
        gameId: dto.gameId,
        status: dto.status,
        rating: dto.rating ?? null,
        liked: dto.liked ?? false,
      };
      if (existingState) {
        await manager.update(GameState, { userId, gameId: dto.gameId }, statePayload);
      } else {
        await manager.save(manager.create(GameState, statePayload));
      }

      if (dto.reviewBody && dto.reviewBody.trim().length > 0) {
        await manager.save(
          manager.create(Review, {
            logId: log.id,
            userId,
            gameId: dto.gameId,
            body: dto.reviewBody.trim(),
            hasSpoilers: dto.reviewHasSpoilers ?? false,
          }),
        );
      }

      return log;
    });
  }
}
