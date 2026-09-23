import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { GameStatus } from '../../../common/enums/game-status.enum';
import { User } from '../../users/entities/user.entity';
import { Game } from '../../games/entities/game.entity';

/** Estado atual de uma pessoa com um jogo — 1 linha por (user, game). Fonte das
 * ações rápidas e das médias/histograma (ver PLAN.md original §3.1). */
@Entity('game_states')
export class GameState {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'game_id' })
  gameId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ type: 'enum', enum: GameStatus })
  status: GameStatus;

  @Column({ type: 'smallint', nullable: true })
  rating: number | null; // 1..10 (meia estrela x2)

  @Column({ type: 'boolean', default: false })
  liked: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
