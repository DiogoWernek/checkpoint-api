import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('follows')
@Index(['followingId'])
export class Follow {
  @PrimaryColumn({ name: 'follower_id' })
  followerId: string;

  @PrimaryColumn({ name: 'following_id' })
  followingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
