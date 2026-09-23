import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Game } from '../../games/entities/game.entity';

@Entity('favorites')
@Index(['userId', 'position'], { unique: true })
export class Favorite {
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

  @Column({ type: 'smallint' })
  position: number; // 1..4

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
