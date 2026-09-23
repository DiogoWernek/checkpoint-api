import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Game } from '../../games/entities/game.entity';
import { Log } from '../../register/entities/log.entity';
import { ReviewLike } from './review-like.entity';
import { ReviewComment } from './review-comment.entity';

/** No máximo uma review por registro (log) — o campo "review" da tela Registrar. */
@Entity('cp_reviews')
@Index(['gameId', 'createdAt'])
@Index(['userId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'log_id' })
  logId: string;

  @ManyToOne(() => Log, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'log_id' })
  log: Log;

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

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: false, name: 'has_spoilers' })
  hasSpoilers: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ReviewLike, (like) => like.review)
  likes: ReviewLike[];

  @OneToMany(() => ReviewComment, (comment) => comment.review)
  comments: ReviewComment[];
}
