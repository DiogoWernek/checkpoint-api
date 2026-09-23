import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatus } from '../../../common/enums/game-status.enum';
import { User } from '../../users/entities/user.entity';
import { Game } from '../../games/entities/game.entity';

/** Diário — 1 linha por registro feito na tela Registrar (não confundir com GameState, que é 1 por jogo). */
@Entity('logs')
@Index(['userId', 'createdAt'])
@Index(['gameId'])
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'game_id' })
  gameId: string;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ type: 'enum', enum: GameStatus })
  status: GameStatus; // nunca 'wishlist' aqui — validado no service

  @Column({ type: 'smallint', nullable: true })
  rating: number | null;

  @Column({ type: 'boolean', default: false })
  liked: boolean;

  @Column({ type: 'date', nullable: true, name: 'played_on' })
  playedOn: string | null;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  hours: number | null;

  @Column({ type: 'varchar', nullable: true })
  platform: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_replay' })
  isReplay: boolean;

  @Column({ type: 'json' })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
